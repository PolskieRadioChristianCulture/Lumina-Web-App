// Move the existing call link; never duplicate it or initiate a call.
(() => {
  const link = document.getElementById('helplineFloat');
  const target = document.getElementById('quickActionsMenu');
  if (!link || !target || !window.matchMedia) return;
  const home = document.createComment('helpline desktop position');
  link.before(home);
  const mobile = window.matchMedia('(max-width: 768px)');
  function sync() {
    if (mobile.matches) target.prepend(link);
    else if (home.parentNode) home.parentNode.insertBefore(link, home.nextSibling);
  }
  sync();
  mobile.addEventListener('change', sync);
})();
