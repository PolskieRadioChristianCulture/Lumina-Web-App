// Public web documents only: never alter broadcast, operational or embed screens.
export const BACK_TO_TOP_SCRIPT = '/js/cc-back-to-top.js?v=20261013_col2';
export function applyPageStandard(file, html) {
  const name = file.replaceAll('\\', '/').toLowerCase();
  if (!name.endsWith('.html') || /(?:live|stream|obs|embed|admin|mission.control|pilot|cctv24)/.test(name)) return html;
  if (!/<body\b/i.test(html) || !/<\/body\s*>/i.test(html)) return html;
  if (/http-equiv\s*=\s*["']refresh["']/i.test(html)) return html;
  // Refresh the shared chat loader even when back-to-top is already installed.
  html = html.replace(/(src=["'])(\/(?:components|js)\/cc-support-footer\.js)(?:\?[^"']*)?(["'])/g, '$1$2?v=20261014_lumi1$3');
  html = html.replace(/(src=["'])(\/js\/cc-back-to-top\.js)(?:\?[^"']*)?(["'])/g, '$1$2?v=20261013_col2$3');
  if (html.includes('/js/cc-back-to-top.js')) return html;
  return html.replace(/<\/body\s*>/i, `<script defer src="${BACK_TO_TOP_SCRIPT}"></script>\n</body>`);
}
