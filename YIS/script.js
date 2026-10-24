'use strict';
const menu = document.getElementById('mobileMenu');
const toggle = document.getElementById('menuToggle');
function closeMenu(restoreFocus = false) {
  menu.hidden = true;
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Otwórz menu');
  if (restoreFocus) {
    const edgeTrigger = document.querySelector('.cc-mobile-edge-trigger');
    if (toggle.getClientRects().length) toggle.focus();
    else edgeTrigger?.focus();
  }
}
toggle.addEventListener('click', () => {
  if (!menu.hidden) { closeMenu(true); return; }
  menu.hidden = false;
  toggle.setAttribute('aria-expanded', 'true');
  toggle.setAttribute('aria-label', 'Zamknij menu');
  menu.querySelector('a')?.focus();
});
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !menu.hidden) {
    event.preventDefault();
    closeMenu(true);
  }
});
document.addEventListener('click', event => {
  if (!menu.hidden && !menu.contains(event.target) && !toggle.contains(event.target)) closeMenu();
});
window.matchMedia?.('(min-width:821px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});
window.CCMobileEdge?.mount({ legacy: toggle, placement: document.querySelector('.mini-brand') });
document.getElementById('year').textContent = new Date().getFullYear();

const filters = [...document.querySelectorAll('.filter')];
const projects = [...document.querySelectorAll('.project')];
filters.forEach(btn => btn.addEventListener('click', () => {
  const filter = btn.dataset.filter;
  filters.forEach(b => {
    const active = b === btn;
    b.classList.toggle('active', active);
    b.setAttribute('aria-pressed', String(active));
  });
  projects.forEach(el => { el.hidden = filter !== 'all' && el.dataset.type !== filter; });
}));

document.getElementById('contactForm').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = document.getElementById('formStatus');
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const name = String(data.get('person') || '').trim();
  const email = String(data.get('mail') || '').trim();
  const kind = String(data.get('kind') || '');
  const details = String(data.get('details') || '').trim();
  if (!name || !email || !details) {
    status.textContent = 'Uzupełnij wszystkie wymagane pola.';
    return;
  }
  const subject = encodeURIComponent('Zapytanie do YIS — ' + kind);
  const body = encodeURIComponent(
    'Imię / firma: ' + name + '\nE-mail: ' + email +
    '\nRodzaj projektu: ' + kind + '\n\nOpis:\n' + details
  );
  status.textContent = 'Otwieram program pocztowy. Wiadomość nie została jeszcze wysłana — sprawdź ją i wyślij samodzielnie.';
  window.location.href = 'mailto:yourimaginationstudio@gmail.com?subject=' + subject + '&body=' + body;
});
document.getElementById('copyEmail').addEventListener('click', async () => {
  const button = document.getElementById('copyEmail');
  try {
    await navigator.clipboard.writeText('yourimaginationstudio@gmail.com');
    button.textContent = 'Skopiowano ✓';
  } catch {
    button.textContent = 'yourimaginationstudio@gmail.com';
  }
});
