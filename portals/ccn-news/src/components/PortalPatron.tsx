import React from 'react';

export const PORTAL_PATRON_URL = 'https://buy.stripe.com/dRm14hfZG8klbsT3rsbsc02?locale=en&__embed_source=buy_btn_1StrU77fVEX4acCUmubYefe2';

export const PortalPatron: React.FC<{ dark?: boolean }> = ({ dark = false }) => (
  <section aria-label="Wsparcie portalu CCN" className={`rounded-xl border p-5 ${dark ? 'border-neutral-700 bg-neutral-900 text-white' : 'border-stone-200 bg-stone-50 text-gray-900'}`}>
    <h3 className="font-semibold text-lg">Mecenas portalu</h3>
    <p className={`mt-2 text-sm leading-relaxed ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
      Pomóż rozwijać CCN News. Wsparcie jest dobrowolne — wszystkie materiały pozostają bezpłatne.
    </p>
    <a href={PORTAL_PATRON_URL} target="_blank" rel="noopener noreferrer" aria-label="Mecenas portalu — wesprzyj CCN przez Stripe w nowej karcie" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#bb142e] px-5 py-3 text-sm font-semibold text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-500">
      Wesprzyj portal
    </a>
    <p className={`mt-2 text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Przejdziesz do strony płatności Stripe w nowej karcie.</p>
  </section>
);
