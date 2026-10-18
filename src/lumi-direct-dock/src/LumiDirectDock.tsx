import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { DirectMessagingAdapter, DockConversation, DockMessage, IncomingDM } from './types';
import './lumi-direct-dock.css';

export type LumiDirectDockProps = {
  adapter: DirectMessagingAdapter;
  /** Leave the public chat bubble untouched. Dock offset should match its real placement. */
  rightOffsetPx?: number;
  bottomOffsetPx?: number;
};

type DockPrefs = { autoOpen: boolean };
const DEFAULT_PREFS: DockPrefs = { autoOpen: false };
const MAX_TEXT_LENGTH = 4000;
function upsertMessage(items: DockMessage[], message: DockMessage) {
  if (items.some(m => m.id === message.id)) return items;
  return [...items, message].sort((a,b) => a.createdAt.localeCompare(b.createdAt));
}
function safePrefs(): DockPrefs {
  try { return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem('lumi-direct-dock-prefs-v1') || '{}') }; }
  catch { return DEFAULT_PREFS; }
}
function dateLabel(date: string) {
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString('pl-PL', { hour:'2-digit', minute:'2-digit' });
}
export function LumiDirectDock({ adapter, rightOffsetPx = 88, bottomOffsetPx = 16 }: LumiDirectDockProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<DockConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string,DockMessage[]>>({});
  const [drafts, setDrafts] = useState<Record<string,string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [prefs, setPrefs] = useState<DockPrefs>(safePrefs);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hidden, setHidden] = useState<string[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<string | null>(null);
  const hiddenRef = useRef<string[]>([]);
  const prefsRef = useRef(prefs);
  const adapterRef = useRef(adapter);
  const loadToken = useRef(0);
  const readAttemptRef = useRef(new Set<string>());

  useEffect(() => { activeRef.current = activeId; }, [activeId]);
  useEffect(() => { hiddenRef.current = hidden; }, [hidden]);
  useEffect(() => { prefsRef.current = prefs; try { localStorage.setItem('lumi-direct-dock-prefs-v1', JSON.stringify(prefs)); } catch {} }, [prefs]);
  useEffect(() => { adapterRef.current = adapter; }, [adapter]);

  const loadConversation = useCallback(async (id: string) => {
    const token = ++loadToken.current;
    try {
      const result = await adapterRef.current.listMessages(id, 50);
      if (token === loadToken.current) setMessages(prev => ({ ...prev, [id]: result }));
    } catch { if (token === loadToken.current) setError('Nie udało się pobrać wiadomości.'); }
  }, []);

  const openConversation = useCallback((id: string) => {
    setHidden(prev => prev.filter(v => v !== id));
    setActiveId(id);
    setError('');
    void loadConversation(id);
  }, [loadConversation]);

  useEffect(() => {
    const id = adapter.getCurrentUserId();
    setUserId(id);
    setConversations([]);
    setActiveId(null);
    setMessages({});
    setDrafts({});
    setHidden([]);
    if (!id) return;
    let mounted = true;
    void adapter.listDirectConversations().then(items => {
      if (mounted) setConversations(items.filter(c => c.type === 'direct' && c.participant.id !== id));
    }).catch(() => { if (mounted) setError('Nie udało się pobrać rozmów prywatnych.'); });
    const off = adapter.subscribeIncomingDM((event: IncomingDM) => {
      if (!mounted || event.message.senderId === id) return;
      // A new incoming DM restores a previously closed chat head.
      setHidden(prev => prev.filter(v => v !== event.conversationId));
      hiddenRef.current = hiddenRef.current.filter(v => v !== event.conversationId);
      // The actual authorization and DIRECT-only filtering must happen in the adapter/backend.
      setConversations(prev => prev.map(c => c.id === event.conversationId
        ? { ...c, unreadCount: c.unreadCount + (activeRef.current === c.id ? 0 : 1), lastMessageAt: event.message.createdAt }
        : c));
      setMessages(prev => ({...prev, [event.conversationId]: upsertMessage(prev[event.conversationId] || [], event.message)}));
      if (prefsRef.current.autoOpen) {
        // Only existing verified conversation IDs are displayed; refresh if newly created.
        void adapter.listDirectConversations().then(items => {
          if (!mounted) return;
          setConversations(items.filter(c => c.type === 'direct' && c.participant.id !== id));
          if (items.some(c => c.id === event.conversationId && c.type === 'direct' && c.participant.id !== id)) setActiveId(event.conversationId);
        }).catch(() => {});
      } else {
        void adapter.listDirectConversations().then(items => {
          if (mounted) setConversations(items.filter(c => c.type === 'direct' && c.participant.id !== id));
        }).catch(() => {});
      }
    });
    return () => { mounted = false; off(); loadToken.current++; };
  }, [adapter]);

  useEffect(() => {
    if (!activeId || !adapter.subscribeConversation) return;
    return adapter.subscribeConversation(activeId, message => {
      if (message.conversationId !== activeId) return;
      setMessages(prev => ({...prev, [activeId]: upsertMessage(prev[activeId] || [], message)}));
    });
  }, [activeId, adapter]);

  useEffect(() => {
    if (!activeId || !userId) return;
    const convo = conversations.find(c => c.id === activeId);
    const last = messages[activeId]?.at(-1);
    if (!convo || !last || last.senderId === userId) return;
    const readKey = `${activeId}:${last.id}`;
    if (readAttemptRef.current.has(readKey)) return;
    // Only mark read when the conversation is actually open and visible.
    if (document.visibilityState !== 'visible') return;
    readAttemptRef.current.add(readKey);
    void adapter.markRead(activeId, last.id).then(() => {
      setConversations(prev => prev.map(c => c.id === activeId ? {...c, unreadCount:0} : c));
    }).catch(() => { readAttemptRef.current.delete(readKey); });
  }, [activeId, messages, conversations, adapter, userId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({block:'end'}); }, [activeId, messages]);
  const active = conversations.find(c => c.id === activeId);
  const ordered = [...conversations].sort((a,b) => (b.lastMessageAt || '').localeCompare(a.lastMessageAt || ''));
  const draft = activeId ? (drafts[activeId] || '') : '';
  const send = async () => {
    if (!activeId || busy || !draft.trim() || draft.trim().length > MAX_TEXT_LENGTH) return;
    const id = activeId;
    const text = draft.trim();
    setBusy(true); setError('');
    try {
      const requestId = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
      await adapter.sendText(id, text, requestId);
      setDrafts(prev => ({...prev,[id]:''}));
      await loadConversation(id);
    } catch { setError('Wysyłanie nie powiodło się. Wiadomość pozostała w polu wpisywania.'); }
    finally { setBusy(false); }
  };
  if (!userId) return null;
  return <section className="ldd-root" style={{'--ldd-right': `${rightOffsetPx}px`, '--ldd-bottom':`${bottomOffsetPx}px`} as React.CSSProperties} aria-label="LUMI prywatne wiadomości">
    {active && <div className="ldd-window" role="dialog" aria-label={`Prywatna rozmowa z ${active.participant.name}`}>
      <header className="ldd-header">
        {active.participant.avatarUrl ? <img className="ldd-avatar" src={active.participant.avatarUrl} alt="" /> : <span className="ldd-avatar ldd-initial">{active.participant.name.charAt(0)}</span>}
        <div className="ldd-name"><strong>{active.participant.name}</strong><small>{active.participant.isOnline ? '● Aktywny teraz' : 'Wiadomość prywatna'}</small></div>
        <button type="button" aria-label="Minimalizuj rozmowę" onClick={() => setActiveId(null)}>−</button>
        <button type="button" aria-label="Zamknij rozmowę" onClick={() => {setHidden(prev => [...new Set([...prev,activeId])]); setActiveId(null);}}>×</button>
      </header>
      <div className="ldd-history" aria-label="Historia rozmowy" role="log" aria-live="polite">
        {(messages[active.id] || []).map(m => <div key={m.id} className={`ldd-line ${m.senderId === userId ? 'ldd-mine' : 'ldd-theirs'}`}>
          <div className="ldd-bubble">{m.text}</div><span className="ldd-time">{dateLabel(m.createdAt)}{m.senderId === userId && m.deliveryStatus ? ` · ${m.deliveryStatus === 'read' ? 'Wyświetlono' : m.deliveryStatus === 'delivered' ? 'Dostarczono' : 'Wysłano'}` : ''}</span>
        </div>)}
        <div ref={bottomRef}/>
      </div>
      {error && <p className="ldd-error" role="alert">{error}</p>}
      <form className="ldd-compose" onSubmit={e => { e.preventDefault(); void send(); }}>
        <label className="ldd-sr" htmlFor="ldd-compose-field">Napisz prywatną wiadomość</label>
        <textarea ref={inputRef} id="ldd-compose-field" rows={1} maxLength={MAX_TEXT_LENGTH} placeholder="Aa · Wiadomość…" value={draft} onChange={e => setDrafts(prev => ({...prev,[active.id]:e.target.value}))} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {e.preventDefault();void send();} }} />
        <button type="submit" disabled={busy || !draft.trim()} aria-label="Wyślij wiadomość">➤</button>
      </form>
    </div>}
    <div className="ldd-dock" aria-label="Skróty rozmów prywatnych">
      {ordered.filter(c => !hidden.includes(c.id)).slice(0,6).map(c => <button type="button" key={c.id} className={`ldd-head ${activeId === c.id ? 'ldd-selected' : ''}`} onClick={() => activeId === c.id ? setActiveId(null) : openConversation(c.id)} title={`Rozmowa z ${c.participant.name}`} aria-label={`Otwórz rozmowę z ${c.participant.name}, nieprzeczytane: ${c.unreadCount}`}>
        {c.participant.avatarUrl ? <img src={c.participant.avatarUrl} alt="" /> : <span>{c.participant.name.charAt(0)}</span>}
        {c.unreadCount > 0 && <b className="ldd-count">{c.unreadCount > 99 ? '99+' : c.unreadCount}</b>}
      </button>)}
      {ordered.length > 6 && <span className="ldd-more" title="Pozostałe rozmowy dostępne w LUMI Messenger">+{ordered.length - 6}</span>}
      <button type="button" className="ldd-prefs" aria-label="Ustawienia prywatnych powiadomień" title="Ustawienia" onClick={() => setSettingsOpen(v => !v)}>⚙</button>
    </div>
    {settingsOpen && <div className="ldd-settings"><label><input type="checkbox" checked={prefs.autoOpen} onChange={e => setPrefs({autoOpen:e.target.checked})}/> Automatycznie otwieraj nowe wiadomości prywatne</label><p>Domyślnie wyłączone, aby nie przerywać pracy.</p><button type="button" onClick={() => setHidden([])}>Przywróć zamknięte skróty</button></div>}
  </section>;
}
