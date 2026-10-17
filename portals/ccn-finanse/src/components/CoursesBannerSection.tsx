import React from 'react';
import { GraduationCap, Award, CheckCircle, ArrowRight, Play, BookOpen } from 'lucide-react';

export const CoursesBannerSection: React.FC = () => {
  return (
    <section className="my-12 bg-gradient-to-r from-[#010101] via-[#12080a] to-[#010101] rounded-2xl border border-[#2b0c12] text-white p-6 sm:p-10 shadow-xl overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#bb142e]/10 blur-3xl pointer-events-none"></div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#bb142e]/20 border border-[#bb142e]/40 text-[#f9282b] text-xs font-bold uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" />
            Akademia Biblijna Christian Culture
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white leading-tight">
            Bezpłatne Kursy Biblijne z Certyfikatem Ukończenia
          </h2>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
            Zgłębiaj Słowo Boże z najlepszymi narzędziami: 24 wykłady wideo o Księdze Objawienia w jakości 4K, codzienne lekcje z kodami Stronga, interaktywne quizy oraz osobista opieka duszpasterska.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-zinc-300">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% Bezpłatny Dostęp</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-300">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>24 Wykłady Wideo 4K</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-300">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Imienny Certyfikat PDF</span>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-3">
            <a
              href="/akademia"
              className="bg-[#bb142e] hover:bg-[#981025] text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg transition flex items-center gap-2"
            >
              <span>Przejdź do Akademii Biblijnej</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/akademia/apokalipsa/lekcja-01"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-5 py-3 rounded-xl border border-white/20 transition flex items-center gap-2"
            >
              <Play className="w-4 h-4 text-[#f9282b]" />
              <span>Zacznij Lekcję 01</span>
            </a>
          </div>
        </div>

        {/* Course Card Preview */}
        <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Główny Program 2026
              </span>
            </div>
            <span className="text-xs font-mono text-zinc-400">24 Lekcje</span>
          </div>

          <div>
            <h3 className="font-serif font-bold text-lg text-white">
              Kurs Apokalipsy: Księga Nadziei i Zwycięstwa
            </h3>
            <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
              Kompletny komentarz werset po wersecie autorstwa doświadczonych biblistów. Odkryj proroctwa bez lęku w świetle miłości Bożej.
            </p>
          </div>

          <div className="p-3 bg-black/40 rounded-xl border border-white/5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#f9282b]" />
              <span className="text-zinc-200">Kurs Codzienny: Z Biblią za Pan Brat</span>
            </div>
            <a
              href="/akademia/kurscodzienny"
              className="text-[#f9282b] font-bold hover:underline"
            >
              Zobacz →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
