// Public web documents only: never alter broadcast, operational or embed screens.
export const BACK_TO_TOP_SCRIPT = '/js/cc-back-to-top.js?v=20261009_top1';
export function applyPageStandard(file, html) {
  const name = file.replaceAll('\\', '/').toLowerCase();
  if (!name.endsWith('.html') || /(?:live|stream|obs|embed|admin|mission.control|pilot|cctv24)/.test(name)) return html;
  if (!/<body\b/i.test(html) || !/<\/body\s*>/i.test(html)) return html;
  if (/http-equiv\s*=\s*["']refresh["']/i.test(html) || html.includes('/js/cc-back-to-top.js')) return html;
  return html.replace(/<\/body\s*>/i, `<script defer src="${BACK_TO_TOP_SCRIPT}"></script>\n</body>`);
}
