import React, { useEffect, useRef, useState } from 'react';
import { ArticleAudio } from '../types';

const DEFAULT_PEAKS = [
  54, 38, 39, 45, 65, 25, 38, 41, 53, 54, 56, 38, 56, 62, 59, 60,
  63, 44, 47, 49, 64, 60, 59, 67, 49, 65, 56, 80, 71, 56, 53, 53,
  49, 49, 56, 64, 52, 51, 72, 73, 84, 51, 66, 66, 68, 56, 51, 60,
  64, 61, 67, 44, 45, 48, 51, 48, 45, 44, 39, 57, 45, 38, 40, 48,
];
const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '--:--';
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const secs = Math.floor(sec % 60);
  return `${hrs > 0 ? `${hrs}:` : ''}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const CcnAudioPlayer: React.FC<{ audio?: ArticleAudio }> = ({ audio }) => {
  if (!audio || audio.publicationStatus !== 'published') return null;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState<number>(
    Number.isFinite(audio.durationSeconds) && audio.durationSeconds > 0 ? audio.durationSeconds : NaN
  );
  const [speedIndex, setSpeedIndex] = useState(1);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const directStreamUrl = (audio.audioUrl || (audio as any).src || '').trim();
  const hasDirectStream = Boolean(directStreamUrl);
  const [showFallback, setShowFallback] = useState(!hasDirectStream);
  const [statusMsg, setStatusMsg] = useState<string>(
    hasDirectStream
      ? 'Źródło audio skonfigurowane. Naciśnij Odtwórz.'
      : 'Źródło Google Drive — odtwórz w podglądzie poniżej.'
  );

  const peaks = Array.isArray(audio.peaks) && audio.peaks.length > 8 ? audio.peaks : DEFAULT_PEAKS;
  const playerId = `ccn-player-${audio.articleId || 'default'}`;

  useEffect(() => {
    const onOtherPlay = (e: Event) => {
      const custom = e as CustomEvent;
      if (custom.detail?.id !== playerId && audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
    };
    window.addEventListener('ccn-audio-play', onOtherPlay);
    return () => {
      window.removeEventListener('ccn-audio-play', onOtherPlay);
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
    };
  }, [playerId]);

  const effectiveDuration = Number.isFinite(duration) && duration > 0 ? duration : NaN;
  const ratio = Number.isFinite(effectiveDuration)
    ? Math.max(0, Math.min(1, currentTime / effectiveDuration))
    : 0;

  const handleTogglePlay = async () => {
    const el = audioRef.current;
    if (!el || !hasDirectStream) return;
    if (el.paused) {
      try {
        document.querySelectorAll('audio').forEach((other) => {
          if (other !== el && !other.paused) other.pause();
        });
        await el.play();
      } catch {
        setStatusMsg('Nie można uruchomić nagrania. Użyj podglądu źródłowego Google Drive.');
        setShowFallback(true);
      }
    } else {
      el.pause();
    }
  };

  const handleSeekRatio = (r: number) => {
    const el = audioRef.current;
    if (!el || !hasDirectStream || !Number.isFinite(effectiveDuration)) return;
    const next = Math.max(0, Math.min(effectiveDuration, r * effectiveDuration));
    el.currentTime = next;
    setCurrentTime(next);
  };

  const handleWaveClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!waveRef.current || !hasDirectStream) return;
    const rect = waveRef.current.getBoundingClientRect();
    if (rect.width > 0) {
      handleSeekRatio((e.clientX - rect.left) / rect.width);
    }
  };

  const handleWaveKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!hasDirectStream || !Number.isFinite(effectiveDuration) || !audioRef.current) return;
    if (['ArrowLeft', 'ArrowDown', 'ArrowRight', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
      e.preventDefault();
      if (e.key === 'Home') audioRef.current.currentTime = 0;
      else if (e.key === 'End') audioRef.current.currentTime = effectiveDuration;
      else {
        const delta = e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -5 : 5;
        audioRef.current.currentTime = Math.min(
          effectiveDuration,
          Math.max(0, (audioRef.current.currentTime || 0) + delta)
        );
      }
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleCycleSpeed = () => {
    const nextIdx = (speedIndex + 1) % SPEEDS.length;
    setSpeedIndex(nextIdx);
    if (audioRef.current) {
      audioRef.current.playbackRate = SPEEDS[nextIdx];
    }
  };

  const handleToggleMute = () => {
    const next = !muted;
    setMuted(next);
    if (audioRef.current) {
      audioRef.current.muted = next;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    setMuted(false);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = false;
    }
  };

  return (
    <section
      id={playerId}
      aria-label="Posłuchaj artykułu"
      style={{
        border: '1px solid rgba(196, 163, 90, 0.5)',
        borderRadius: '14px',
        background:
          'radial-gradient(ellipse at 45% 40%, rgba(172, 126, 56, 0.16), transparent 55%), linear-gradient(115deg, #28231e, #1d1e23 55%, #292930)',
        boxShadow: '0 10px 34px rgba(0,0,0,0.45), inset 0 1px rgba(255,255,255,0.12)',
        padding: '20px 22px',
        color: '#F5F2EE',
        margin: '18px 0',
      }}
    >
      <audio
        ref={audioRef}
        preload="metadata"
        src={hasDirectStream ? directStreamUrl : undefined}
        onPlay={() => {
          setIsPlaying(true);
          setStatusMsg('Odtwarzanie');
          window.dispatchEvent(new CustomEvent('ccn-audio-play', { detail: { id: playerId } }));
        }}
        onPause={() => {
          setIsPlaying(false);
          setStatusMsg('Pauza');
        }}
        onWaiting={() => setStatusMsg('Buforowanie nagrania…')}
        onError={() => {
          setIsPlaying(false);
          setStatusMsg('Błąd pobierania strumienia. Otwórz źródłowe nagranie w Google Drive.');
          setShowFallback(true);
        }}
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          if (Number.isFinite(d) && d > 0) setDuration(d);
        }}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime || 0)}
        onEnded={() => {
          setIsPlaying(false);
          setStatusMsg('Nagranie zakończone');
        }}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          alignItems: 'center',
          gap: '18px',
        }}
      >
        <div>
          <div style={{ color: '#D1AA66', fontSize: '11px', fontWeight: 700, letterSpacing: '0.035em' }}>
            POSŁUCHAJ ARTYKUŁU
          </div>
          <div
            role="heading"
            aria-level={2}
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 'clamp(18px, 2vw, 22px)',
              lineHeight: 1.15,
              fontWeight: 500,
              margin: '8px 0',
              color: '#f1eeec',
            }}
          >
            {audio.title}
          </div>
          <div style={{ fontSize: '11px', color: '#ad9d88' }}>
            Czyta: <strong style={{ color: '#dfbb78' }}>{audio.reader || 'AI Lektor'}</strong> · Czas:{' '}
            <span>{Number.isFinite(effectiveDuration) ? formatTime(effectiveDuration) : '--:--'}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', gridColumn: 'span 2' }}>
          <button
            type="button"
            onClick={handleTogglePlay}
            disabled={!hasDirectStream}
            aria-label={isPlaying ? 'Wstrzymaj nagranie' : 'Odtwórz nagranie'}
            title="Odtwórz / Pauza"
            style={{
              width: '56px',
              height: '56px',
              flexShrink: 0,
              borderRadius: '50%',
              border: '1px solid #ffdf9a',
              background: 'radial-gradient(circle at 30% 25%, #fff2cb, #ebbf75 48%, #a57632)',
              color: '#28201a',
              boxShadow: '0 0 24px rgba(224,167,74,0.55), 0 0 43px rgba(178,135,64,0.24), inset 0 2px 4px rgba(255,255,255,0.5)',
              display: 'grid',
              placeItems: 'center',
              cursor: hasDirectStream ? 'pointer' : 'not-allowed',
              fontSize: '20px',
              fontWeight: 800,
            }}
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              ref={waveRef}
              role="slider"
              aria-label="Pozycja odtwarzania"
              tabIndex={0}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(ratio * 100)}
              aria-valuetext={formatTime(currentTime)}
              onClick={handleWaveClick}
              onKeyDown={handleWaveKeyDown}
              style={{
                height: '60px',
                display: 'flex',
                gap: '2px',
                alignItems: 'center',
                position: 'relative',
                cursor: hasDirectStream ? 'pointer' : 'default',
                touchAction: 'pan-y',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '1px',
                  bottom: '1px',
                  width: '2px',
                  left: `${ratio * 100}%`,
                  background: '#f8ce7f',
                  pointerEvents: 'none',
                  boxShadow: '0 0 12px #e0a74a',
                }}
              />
              {peaks.map((h, idx) => {
                const isPast = idx / peaks.length < ratio;
                return (
                  <span
                    key={idx}
                    aria-hidden="true"
                    style={{
                      flex: 1,
                      minWidth: '2px',
                      maxWidth: '6px',
                      height: `${Math.max(12, Math.min(92, h))}%`,
                      borderRadius: '3px',
                      background: isPast ? 'linear-gradient(#fce2a9, #c99540)' : '#5b5c61',
                      boxShadow: isPast ? '0 0 7px rgba(201,155,82,0.44)' : 'none',
                    }}
                  />
                );
              })}
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: '#aba8ab',
                fontSize: '10px',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              <span style={{ color: '#e0b76e' }}>{formatTime(currentTime)}</span>
              <span>
                {formatTime(currentTime)} / {Number.isFinite(effectiveDuration) ? formatTime(effectiveDuration) : '--:--'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleCycleSpeed}
              disabled={!hasDirectStream}
              aria-label="Prędkość odtwarzania"
              style={{
                fontSize: '12px',
                background: '#343437',
                border: '1px solid #555',
                color: '#d1d2d6',
                borderRadius: '100px',
                padding: '0 12px',
                minHeight: '44px',
                minWidth: '56px',
                cursor: hasDirectStream ? 'pointer' : 'not-allowed',
              }}
            >
              {SPEEDS[speedIndex]}× ▾
            </button>
            <button
              type="button"
              onClick={handleToggleMute}
              disabled={!hasDirectStream}
              aria-label={muted ? 'Włącz dźwięk' : 'Wycisz'}
              style={{
                background: 'none',
                border: '1px solid rgba(196,163,90,0.3)',
                color: '#d1d2d6',
                borderRadius: '9px',
                minWidth: '44px',
                minHeight: '44px',
                cursor: hasDirectStream ? 'pointer' : 'not-allowed',
                fontSize: '15px',
              }}
            >
              {muted ? '×' : '◖))'}
            </button>
            {audio.driveId && (
              <button
                type="button"
                onClick={() => setShowFallback(!showFallback)}
                aria-expanded={showFallback}
                title="Opcje źródła"
                style={{
                  background: 'none',
                  border: '1px solid rgba(196,163,90,0.3)',
                  color: '#d1d2d6',
                  borderRadius: '9px',
                  minWidth: '44px',
                  minHeight: '44px',
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
              >
                ☷
              </button>
            )}
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#d1d2d6' }}>
            <span>◖</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              aria-label="Głośność"
              style={{ width: '96px', accentColor: '#d7b579' }}
            />
          </label>
        </div>
      </div>

      <div role="status" style={{ paddingTop: '8px', fontSize: '11px', color: '#c5bdaf' }}>
        {statusMsg}
      </div>

      {showFallback && audio.driveId && (
        <div
          style={{
            borderTop: '1px solid #6d5c3b',
            marginTop: '12px',
            paddingTop: '14px',
            fontSize: '12px',
            color: '#c4c3c5',
          }}
        >
          <p style={{ marginBottom: '8px' }}>
            <strong>Zapasowe źródło Google Drive:</strong> Możesz również odsłuchać lub pobrać nagranie bezpośrednio z Dysku Google.
          </p>
          <iframe
            title="Podgląd nagrania na Dysku Google"
            src={`https://drive.google.com/file/d/${encodeURIComponent(audio.driveId)}/preview`}
            loading="lazy"
            allow="autoplay"
            style={{ width: '100%', minHeight: '130px', border: 0, background: '#151515', borderRadius: '8px' }}
          />
          <p style={{ marginTop: '8px' }}>
            <a
              href={`https://drive.google.com/file/d/${encodeURIComponent(audio.driveId)}/view`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#eec987', textDecoration: 'underline' }}
            >
              Otwórz oryginalny plik audio w Google Drive ↗
            </a>
          </p>
        </div>
      )}
    </section>
  );
};
