import React from 'react';
import { X, Volume2, VolumeX, Play, Pause, ExternalLink, Radio } from 'lucide-react';

interface RadioPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const RadioPlayerModal: React.FC<RadioPlayerModalProps> = ({
  isOpen,
  onClose,
  isPlaying,
  onTogglePlay,
  volume,
  onVolumeChange,
  isMuted,
  onToggleMute,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#111111] text-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-neutral-800 p-6 flex flex-col items-center text-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Radio Badge & Wave */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-red-900 to-red-600 flex items-center justify-center shadow-lg my-3 relative">
          <Radio className="w-10 h-10 text-white" />
          {isPlaying && (
            <span className="absolute -inset-1.5 rounded-full border-2 border-red-500/60 animate-ping pointer-events-none"></span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
            Transmisja na żywo
          </span>
        </div>

        <h3 className="font-serif-headline text-2xl font-bold mt-2 text-white">
          Polskie Radio Christian Culture
        </h3>
        <p className="text-xs text-neutral-400 mt-1 max-w-xs">
          Oficjalna stacja radiowa ekosystemu Christian Culture (`polskieradio.cc`).
        </p>

        {/* Player controls */}
        <div className="my-6 w-full flex flex-col items-center gap-4">
          <button
            onClick={onTogglePlay}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition cursor-pointer shadow-xl ${
              isPlaying
                ? 'bg-red-700 text-white hover:bg-red-800'
                : 'bg-white text-black hover:bg-red-600 hover:text-white'
            }`}
            aria-label={isPlaying ? 'Zatrzymaj radio' : 'Włącz radio'}
          >
            {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
          </button>

          {/* Volume slider */}
          <div className="flex items-center gap-3 w-3/4 max-w-xs text-neutral-300">
            <button
              onClick={onToggleMute}
              className="p-1 hover:text-white transition cursor-pointer"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
            <span className="text-[11px] font-mono w-8 text-right">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>
        </div>

        {/* Link to website */}
        <div className="pt-4 border-t border-neutral-800 w-full flex items-center justify-between text-xs text-neutral-400">
          <span>Strumień 128 kbps stereo</span>
          <a
            href="https://polskieradio.cc"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 transition"
          >
            <span>polskieradio.cc</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
