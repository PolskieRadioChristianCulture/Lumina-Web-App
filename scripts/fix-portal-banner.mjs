import fs from 'fs';

const p = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/scripts/build-ccn-static-pages.mjs';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
  '<p class="ccn-primary-portal-text">Główne, pełne wydanie redakcyjne tej analizy zostało opublikowane w portalu tematycznym <strong>CCN Finanse</strong>.</p>',
  '<p class="ccn-primary-portal-text">Główne, pełne wydanie redakcyjne tej analizy zostało opublikowane w portalu tematycznym <strong>${escapeHtml(article.primaryPortalLabel || "portalu partnerskim")}</strong>.</p>'
);

c = c.replace(
  '<span>Przejdź do CCN Finanse</span>',
  '<span>Przejdź do ${escapeHtml(article.primaryPortalLabel || "portalu")}</span>'
);

fs.writeFileSync(p, c, 'utf8');
console.log('Fixed build-ccn-static-pages.mjs banner template.');
