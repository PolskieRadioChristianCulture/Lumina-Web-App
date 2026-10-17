import React from 'react';

interface CcnLogoProps {
  layout?: 'stacked' | 'horizontal' | 'compact';
  className?: string;
  theme?: 'light' | 'dark';
  variant?: 'image' | 'vector';
  disableLink?: boolean;
}

export const CcnLogo: React.FC<CcnLogoProps> = ({
  layout = 'stacked',
  className = '',
  theme = 'light',
  variant = 'image',
  disableLink = false,
}) => {
  const isDark = theme === 'dark';

  const renderContent = () => {
    if (variant === 'image') {
      if (layout === 'horizontal') {
        return (
          <img
            src={isDark ? '/ccn-logo-dark-bg.png' : '/ccn-logo-horizontal.png'}
            alt="CCN News Christian Culture"
            className="h-10 sm:h-12 w-auto object-contain block"
          />
        );
      }

      if (layout === 'compact') {
        return (
          <img
            src={isDark ? '/ccn-logo-dark-bg.png' : '/ccn-logo-horizontal.png'}
            alt="CCN News Christian Culture"
            className="h-8 sm:h-9 w-auto object-contain block"
          />
        );
      }

      // stacked
      return (
        <img
          src={isDark ? '/ccn-logo-square-trans.png' : '/ccn-logo-square.png'}
          alt="CCN News Christian Culture"
          className="h-14 sm:h-16 w-auto object-contain block"
        />
      );
    }

    // Fallback vector reproduction in logo colors: #010101, #f9282b, #bb142e
    if (layout === 'horizontal') {
      return (
        <div className="flex items-center gap-3.5 select-none">
          <div className="flex items-center gap-0.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#010101] flex items-center justify-center shadow-xs">
              <span className="text-white text-2xl font-black font-sans tracking-tight">C</span>
            </div>
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#010101] flex items-center justify-center shadow-xs">
              <span className="text-white text-2xl font-black font-sans tracking-tight">C</span>
            </div>
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#010101] flex items-center justify-center shadow-xs">
              <span className="text-[#f9282b] text-2xl font-black font-sans tracking-tight">N</span>
            </div>
          </div>

          <div className="flex flex-col justify-center leading-none">
            <span
              className="font-serif-headline text-2xl sm:text-3xl font-extrabold tracking-wide"
              style={{ color: isDark ? '#ffffff' : '#bb142e' }}
            >
              NEWS
            </span>
            <span
              className="text-[10px] sm:text-[11px] font-serif font-bold tracking-[0.22em] uppercase mt-0.5"
              style={{ color: isDark ? '#f87171' : '#bb142e' }}
            >
              CHRISTIAN CULTURE
            </span>
          </div>
        </div>
      );
    }

    if (layout === 'compact') {
      return (
        <div className="flex items-center gap-2 select-none">
          <div className="flex items-center gap-0.5">
            <div className="w-7 h-7 bg-[#010101] flex items-center justify-center">
              <span className="text-white text-base font-bold font-sans">C</span>
            </div>
            <div className="w-7 h-7 bg-[#010101] flex items-center justify-center">
              <span className="text-white text-base font-bold font-sans">C</span>
            </div>
            <div className="w-7 h-7 bg-[#010101] flex items-center justify-center">
              <span className="text-[#f9282b] text-base font-bold font-sans">N</span>
            </div>
          </div>
          <span
            className="font-serif-headline font-bold text-sm tracking-wide"
            style={{ color: isDark ? '#ffffff' : '#bb142e' }}
          >
            NEWS
          </span>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-start select-none">
        <div className="flex items-center gap-0.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#010101] flex items-center justify-center shadow-xs">
            <span className="text-white text-2xl font-black font-sans leading-none">C</span>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#010101] flex items-center justify-center shadow-xs">
            <span className="text-white text-2xl font-black font-sans leading-none">C</span>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#010101] flex items-center justify-center shadow-xs">
            <span className="text-[#f9282b] text-2xl font-black font-sans leading-none">N</span>
          </div>
        </div>

        <div className="mt-1 leading-none text-left">
          <div
            className="font-serif-headline text-2xl sm:text-[26px] font-black tracking-wide"
            style={{ color: isDark ? '#ffffff' : '#bb142e' }}
          >
            NEWS
          </div>
          <div
            className="text-[9px] sm:text-[10px] font-serif font-bold tracking-[0.22em] uppercase mt-0.5"
            style={{ color: isDark ? '#f87171' : '#bb142e' }}
          >
            CHRISTIAN CULTURE
          </div>
        </div>
      </div>
    );
  };

  const content = renderContent();

  if (disableLink) {
    return (
      <div className={`inline-flex items-center select-none ${className}`}>
        {content}
      </div>
    );
  }

  return (
    <a
      href="/news"
      title="Przejdź do strony głównej CCN News"
      aria-label="CCN News – Christian Culture Strona Główna"
      className={`inline-flex items-center select-none cursor-pointer group hover:opacity-90 transition-opacity ${className}`}
    >
      {content}
    </a>
  );
};
