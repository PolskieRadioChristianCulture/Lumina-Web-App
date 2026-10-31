#!/usr/bin/env python3
"""Deterministic, standard-library-only EkoCC news selection and anti-spam checks."""
import argparse, json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

DEFAULT = {"timezone":"Europe/Warsaw","daily_limits":{"whatsapp":1,"x":2,"facebook":1},"min_gap_minutes":180,"same_event_cooldown_hours":72,"quiet_start":23,"quiet_end":7,"freshness_hours":48,"require_source":True}

def dt(raw):
    d=datetime.fromisoformat(raw.replace('Z','+00:00'))
    if d.tzinfo is None: raise ValueError('timestamps must include timezone')
    return d

def select(events, history, now, cfg=None):
    conf={**DEFAULT,**(cfg or {})}; tz=ZoneInfo(conf['timezone']); local=now.astimezone(tz)
    if conf['quiet_start'] <= local.hour or local.hour < conf['quiet_end']:
        return {"generated_at":now.isoformat(),"recommendations":[],"reason":"quiet_hours"}
    results=[]
    for event in events:
        if event.get('status') not in ('published','live','scheduled'): continue
        if not all(event.get(k) for k in ('event_id','title','verified_at','starts_at','significance')): continue
        if conf['require_source'] and not str(event.get('source_url','')).startswith(('https://','http://')): continue
        try: verified=dt(event['verified_at']); starts=dt(event['starts_at'])
        except (TypeError, ValueError): continue
        if verified > now or now-verified > timedelta(hours=conf['freshness_hours']): continue
        if event['status']=='scheduled' and starts < now: continue
        if event['status']=='live' and now-verified > timedelta(minutes=30): continue
        score=int(event.get('priority',0))
        for ch in event.get('channels',[]):
            if ch not in conf['daily_limits']:continue
            prior=[]
            for h in history:
                if h.get('channel')!=ch or h.get('status')!='published': continue
                try: published=dt(h['published_at'])
                except (KeyError, ValueError, TypeError): continue
                if published<=now:prior.append((h,published))
            today=[h for h,t in prior if t.astimezone(tz).date()==local.date()]
            if len(today)>=conf['daily_limits'][ch]:continue
            if any(now-t < timedelta(minutes=conf['min_gap_minutes']) for _,t in prior):continue
            if any(h.get('event_id')==event['event_id'] and now-t < timedelta(hours=conf['same_event_cooldown_hours']) for h,t in prior):continue
            results.append({"event_id":event['event_id'],"channel":ch,"title":event['title'],"status":event['status'],"source_url":event.get('source_url'),"summary":event.get('summary',''),"significance":event['significance'],"priority":score,"requires_approval":True,"suggested_angle":"Wyjaśnij znaczenie dla odbiorcy; nie kopiuj komunikatu promocyjnego."})
    results.sort(key=lambda r:(-r['priority'],r['event_id'],r['channel']))
    return {"generated_at":now.isoformat(),"recommendations":results,"reason":"candidates_found" if results else "no_verified_non_repetitive_news"}

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--events',required=True);ap.add_argument('--history',required=True);ap.add_argument('--config');ap.add_argument('--out',required=True);ap.add_argument('--now',help='ISO8601 timestamp with offset (for testing)'); a=ap.parse_args()
    load=lambda f:json.loads(Path(f).read_text(encoding='utf8'))
    output=select(load(a.events),load(a.history),dt(a.now) if a.now else datetime.now(timezone.utc),load(a.config) if a.config else None)
    Path(a.out).write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print(f"proposals: {len(output['recommendations'])}, reason: {output['reason']}")
if __name__=='__main__': main()
