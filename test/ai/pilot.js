const api = '/api/ai-dla-jezusa/v1/pilot-chat';
const byId = id => document.getElementById(id);
const form = byId('chat');
const mode = byId('mode');
const key = byId('key');
const consent = byId('consent');
const question = byId('question');
const send = byId('send');
const status = byId('status');
const messages = byId('messages');
let previous = '';
let pending = null;

function element(tag, text) {
  const node = document.createElement(tag);
  node.textContent = text;
  return node;
}

function updateMode() {
  const external = mode.value !== 'sources';
  byId('provider').hidden = !external;
  key.required = external;
  consent.required = external;
  if (!external) {
    key.value = '';
    consent.checked = false;
  }
}

function render(questionText, payload) {
  const item = document.createElement('article');
  item.append(element('h2', questionText));
  const answer = element('p', payload.answer || payload.error);
  answer.className = 'answer';
  item.append(element('small', payload.mode && payload.mode !== 'sources' ? 'Interpretacja modelu · porównaj z Biblią' : 'Tryb źródeł biblijnych'), answer);
  if (payload.sources?.length) {
    const list = document.createElement('ul');
    list.className = 'sources';
    for (const source of payload.sources) {
      const row = document.createElement('li');
      const link = element('a', source.label + ' · ' + source.translation);
      link.href = source.url;
      const quote = element('blockquote', source.verses.map(v => v.number + ' ' + v.text).join(' '));
      row.append(link, quote);
      list.append(row);
    }
    item.append(list, element('small', payload.sources[0].attribution));
  }
  messages.prepend(item);
}

const intro = byId('intro');
const introVideo = byId('intro-video');
const replay = byId('open-intro');
const skip = byId('skip-intro');
const motto = byId('motto');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let introTimer;

function finishIntro() {
  clearTimeout(introTimer);
  const restoreFocus = document.activeElement === skip;
  introVideo.pause();
  introVideo.currentTime = 0;
  intro.hidden = true;
  intro.classList.remove('closing');
  replay.hidden = false;
  if (restoreFocus) replay.focus({ preventScroll: true });
  if (!reducedMotion.matches) {
    motto.textContent = 'Twórcza rozmowa w służbie dobra.';
    motto.classList.add('reveal');
  }
}

function closeIntro() {
  if (intro.hidden || intro.classList.contains('closing')) return;
  if (reducedMotion.matches) {
    finishIntro();
    return;
  }
  intro.classList.add('closing');
  introTimer = setTimeout(finishIntro, 320);
}

function startIntro(focusSkip = false) {
  clearTimeout(introTimer);
  motto.textContent = '';
  motto.classList.remove('reveal');
  intro.hidden = false;
  replay.hidden = true;
  if (focusSkip) skip.focus({ preventScroll: true });
  if (!introVideo.hasAttribute('src')) introVideo.src = introVideo.dataset.src;
  introTimer = setTimeout(closeIntro, 12000);
  introVideo.play().catch(closeIntro);
}

replay.onclick = () => startIntro(true);
skip.onclick = closeIntro;
introVideo.addEventListener('ended', closeIntro);
introVideo.addEventListener('error', closeIntro);
intro.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeIntro();
});
introVideo.addEventListener('animationend', finishIntro);
motto.addEventListener('animationend', () => {
  motto.classList.remove('reveal');
  motto.textContent = '';
});
if (!reducedMotion.matches) startIntro();

mode.onchange = updateMode;
byId('disconnect').onclick = () => {
  pending?.abort();
  mode.value = 'sources';
  updateMode();
};
byId('example').onclick = () => {
  question.value = 'Pomóż mi zrozumieć J 3:16';
  question.focus();
};
byId('reset').onclick = () => {
  pending?.abort();
  previous = '';
  question.value = '';
  messages.replaceChildren();
  status.textContent = '';
  question.focus();
};

form.addEventListener('submit', async event => {
  event.preventDefault();
  const text = question.value.trim();
  if (!text || pending) return;
  const controller = new AbortController();
  pending = controller;
  send.disabled = true;
  mode.disabled = true;
  status.textContent = 'Szukam sprawdzonych fragmentów…';
  const selected = mode.value;
  const headers = { 'Content-Type': 'application/json' };
  if (selected !== 'sources') headers['X-User-Gemini-Key'] = key.value;
  try {
    const response = await fetch(api, {
      method: 'POST', headers, signal: controller.signal,
      body: JSON.stringify({ question: text, previous, mode: selected, consent: consent.checked })
    });
    const payload = await response.json();
    if (controller.signal.aborted) return;
    render(text, payload);
    if (response.ok) {
      if (payload.sources.length) previous = text;
      if (question.value.trim() === text) question.value = '';
    }
    status.textContent = response.ok ? 'Odpowiedź gotowa.' : 'Sprawdź komunikat rozmowy.';
  } catch {
    if (!controller.signal.aborted) status.textContent = 'Nie udało się połączyć. Spróbuj ponownie.';
  } finally {
    pending = null;
    send.disabled = false;
    mode.disabled = false;
  }
});

try {
  const response = await fetch(api);
  if (!response.ok) throw new Error();
  const { code, models } = await response.json();
  byId('code-title').textContent = code.title + ' · ' + code.version;
  for (const rule of code.rules) byId('code-rules').append(element('li', rule));
  for (const model of models) {
    const option = element('option', model.label + ' · własny klucz API');
    option.value = model.id;
    mode.append(option);
  }
} catch {
  status.textContent = 'Ustawienia modeli chwilowo niedostępne.';
}
