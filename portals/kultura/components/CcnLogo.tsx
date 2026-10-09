import React from 'react';

interface CcnLogoProps {
  layout?: 'stacked' | 'horizontal' | 'compact';
  className?: string;
  theme?: 'light' | 'dark';
  subLabel?: string;
  subTitle?: string;
  disableLink?: boolean;
}

export const CcnLogo: React.FC<CcnLogoProps> = ({
  layout = 'horizontal',
  className = '',
  theme = 'light',
  subLabel,
  subTitle,
  disableLink = false,
}) => {
  const isDark = theme === 'dark';

  const logoImg = (
    <a
      href="/news"
      title="Przejdź do CCN News"
      className="inline-flex items-center shrink-0 hover:opacity-90 transition-opacity cursor-pointer"
      onClick={(e) => {
        // Pozwól na standardową nawigację do /news
      }}
    >
      <img
        src={isDark ? '/ccn-logo-dark-bg.png' : '/ccn-logo-horizontal.png'}
        alt="CCN News Christian Culture"
        className={layout === 'compact' ? 'h-8 sm:h-9 w-auto object-contain' : 'h-10 sm:h-12 w-auto object-contain'}
      />
    </a>
  );

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {logoImg}
      {subLabel && (
        <div className="flex flex-col justify-center leading-none">
          <span className={`px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider ${
            isDark ? 'bg-[#f9282b] text-white' : 'bg-[#bb142e] text-white'
          }`}>
            {subLabel}
          </span>
          {subTitle && (
            <span className={`text-[9px] font-bold tracking-wider uppercase mt-1 hidden sm:block ${
              isDark ? 'text-zinc-400' : 'text-zinc-500'
            }`}>
              {subTitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
