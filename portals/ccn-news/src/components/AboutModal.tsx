import React from 'react';
import { X, Heart, Shield, Radio, Sparkles } from 'lucide-react';
import { AUTHORS } from '../data/articles';
import { CcnLogo } from './CcnLogo';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white text-gray-900 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-auto border border-gray-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CcnLogo layout="compact" theme="dark" />
            <span className="text-stone-400 text-sm">| O portalu CCN News</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          <div>
            <h2 className="font-serif-headline text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Misja CCN News – Christian Culture
            </h2>
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
              <strong>CCN News</strong> to niezależny chrześcijański portal informacyjny będący częścią ekosystemu <strong>Christian Culture</strong> oraz portalu <strong>Lumina</strong> (<code>polskieradio.cc</code>).
              Naszą misją jest rzetelne prezentowanie wiadomości ze świata wiary, kultury i społeczeństwa, w duchu prawdy, nadziei i chrześcijańskich wartości.
            </p>
          </div>

          {/* Core Values */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <Shield className="w-6 h-6 text-red-700 mb-2" />
              <h4 className="font-bold text-sm text-gray-900 mb-1">Prawda i Rzetelność</h4>
              <p className="text-xs text-gray-600">
                Weryfikowane fakty, niezależne spojrzenie i brak kompromisów w głoszeniu prawdy.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <Heart className="w-6 h-6 text-red-700 mb-2" />
              <h4 className="font-bold text-sm text-gray-900 mb-1">Wiara i Nadzieja</h4>
              <p className="text-xs text-gray-600">
                Budowanie ducha, świadectwa przemiany życia i umacnianie braterskich relacji.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <Radio className="w-6 h-6 text-red-700 mb-2" />
              <h4 className="font-bold text-sm text-gray-900 mb-1">Ekosystem Mediów</h4>
              <p className="text-xs text-gray-600">
                Ścisła integracja z Polskie Radio CC, CCTV24-Worship oraz portalem Lumina.
              </p>
            </div>
          </div>

          {/* Founders & Leadership - strictly adheres to prompt special profiles */}
          <div>
            <h3 className="font-serif-headline text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-red-700" />
              Kluczowe Postacie Ekosystemu
            </h3>

            <div className="grid sm:grid-cols-3 gap-4">
              {/* Cezary Rogowski */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-center">
                <img
                  src={AUTHORS.cezary.avatarUrl}
                  alt={AUTHORS.cezary.name}
                  className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-2 border-red-700 shadow-xs"
                />
                <h4 className="font-bold text-sm text-gray-900">{AUTHORS.cezary.name}</h4>
                <p className="text-xs font-semibold text-red-800 mt-0.5">{AUTHORS.cezary.role}</p>
                <span className="inline-block mt-1 text-[11px] bg-stone-200 text-stone-700 px-2 py-0.5 rounded font-medium">
                  Status: {AUTHORS.cezary.status}
                </span>
                <p className="text-xs text-gray-600 mt-2">
                  Lider i twórca wizji Christian Culture, stacji Polskie Radio CC i portalu Lumina.
                </p>
              </div>

              {/* Wioletta Rogowska */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-center">
                <img
                  src={AUTHORS.wioletta.avatarUrl}
                  alt={AUTHORS.wioletta.name}
                  className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-2 border-red-700 shadow-xs"
                />
                <h4 className="font-bold text-sm text-gray-900">{AUTHORS.wioletta.name}</h4>
                <p className="text-xs font-semibold text-red-800 mt-0.5">{AUTHORS.wioletta.role}</p>
                <span className="inline-block mt-1 text-[11px] bg-stone-200 text-stone-700 px-2 py-0.5 rounded font-medium">
                  Status: {AUTHORS.wioletta.status}
                </span>
                <p className="text-xs text-gray-600 mt-2">
                  Koordynatorka inicjatyw ewangelizacyjnych, troski o rodzinę i działań charytatywnych.
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-sm font-semibold transition cursor-pointer"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
