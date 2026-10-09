/* Account-bound opt-in. No automatic permission prompt, enrollment or send. */
(function () {
  const share = document.getElementById('ccDailyShare');
  if (!share || document.getElementById('ccDailySubscription')) return;
  const panel = document.createElement('section');
  panel.id = 'ccDailySubscription'; panel.className = 'cc-daily-share';
  panel.innerHTML = '<h2>Nie przegap nowej lekcji</h2><p>Subskrypcja jest powiązana z Twoim kontem Christian Culture/LUMINA. Powiadomienia otrzymasz na urządzeniach, na których włączysz push. Możesz zrezygnować w każdej chwili.</p><label style="display:flex;align-items:flex-start;gap:10px;padding:12px 0"><input type="checkbox" style="width:22px;min-height:22px;flex-shrink:0" aria-label="Zgoda na powiadomienia nowych lekcji"><span>Chcę otrzymywać powiadomienia push o nowych lekcjach kursu „Z Biblią za Pan Brat” i zgadzam się na zapis tej preferencji przy moim koncie.</span></label><div style="margin:10px 0 16px"><label for="ccCourseHourSelect" style="display:block;margin-bottom:6px;font-weight:600;color:#e2cc9a">Preferowana godzina powiadomienia:</label><select id="ccCourseHourSelect" aria-label="Preferowana godzina powiadomienia" style="box-sizing:border-box;min-height:44px;min-width:44px;padding:10px 14px;border-radius:12px;border:1px solid #806120;background:#161b26;color:#f4f4f5;font:inherit;font-size:15px;width:100%;max-width:340px;cursor:pointer"><option value="6">06:00 (Poranek / przed pracą)</option><option value="7" selected>07:00 (Rano — zalecana)</option><option value="8">08:00 (Początek dnia)</option><option value="20">20:00 (Wieczorne rozważanie)</option></select></div><div class="cc-daily-share-actions"><button type="button" data-action="subscribe">Subskrybuj / Zapisz godzinę</button><button type="button" data-action="status">Sprawdź subskrypcję</button><button type="button" data-action="unsubscribe">Zrezygnuj</button></div><p role="status" aria-live="polite"></p><a id="ccCourseLoginLink" href="/lumina-login">Zaloguj się do swojego konta</a>';
  share.insertAdjacentElement('afterend',panel);
  const topAudioBtn = document.getElementById('btn-audio-tts');
  if (topAudioBtn && !document.getElementById('ccTopSubLink')) {
    const topLink = document.createElement('a');
    topLink.id = 'ccTopSubLink'; topLink.href = '#ccDailySubscription';
    topLink.title = 'Subskrybuj lekcje (powiadomienia)';
    topLink.setAttribute('aria-label', 'Subskrybuj lekcje');
    topLink.className = 'w-[38px] h-[38px] min-w-[38px] min-h-[38px] p-0 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-bold hover:bg-amber-500/20 transition inline-flex items-center justify-center';
    topLink.innerHTML = '<i class="fa-solid fa-bell text-xs"></i>';
    topAudioBtn.insertAdjacentElement('afterend', topLink);
    topLink.addEventListener('click', (e) => {
      e.preventDefault();
      panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      panel.style.boxShadow = '0 0 0 3px #e2cc9a';
      setTimeout(() => { panel.style.boxShadow = ''; }, 2500);
    });
  }
  const status = panel.querySelector('[role="status"]');
  const hourEl = panel.querySelector('#ccCourseHourSelect');
  const loginLink = panel.querySelector('#ccCourseLoginLink');
  function updateLoginLink() {
    try {
      const user = window.firebaseAuth?.currentUser;
      const isLogged = !!(user && !user.isAnonymous) || (localStorage.getItem('lumina_user_session') === 'active');
      if (loginLink) loginLink.hidden = isLogged;
    } catch {}
  }
  updateLoginLink();
  window.addEventListener('lumina-auth-state', updateLoginLink);
  let busy = false;
  for (const button of panel.querySelectorAll('button')) button.addEventListener('click',async () => {
    if (busy) return;
    const action = button.dataset.action;
    if (action==='subscribe' && !panel.querySelector('input').checked) {status.textContent='Najpierw zaznacz zgodę na powiadomienia kursu.';return;}
    busy=true; panel.querySelectorAll('button').forEach(b=>b.disabled=true);
    try {
      const sdk = await import('/lumina-db.js?v=20261009_coursekv2');
      const {auth} = await sdk.ensureDbReady();
      if (!auth) throw Error('Nie udało się połączyć z usługą logowania.');
      await auth.authStateReady();
      const user = auth.currentUser;
      const isLogged = !!(user && !user.isAnonymous);
      if (loginLink) loginLink.hidden = isLogged;
      if (!isLogged) throw Error('Zaloguj się, by bezpłatnie korzystać z większej liczby możliwości i zarządzać subskrypcją lekcji.');
      let pushToken = null;
      if (action==='subscribe') {
        pushToken = await sdk.requestCourseNotificationToken(user.uid);
        if (!pushToken) throw Error('Push nie został włączony. Sprawdź zgodę na powiadomienia w przeglądarce i spróbuj ponownie.');
      }
      if (auth.currentUser?.uid!==user.uid) throw Error('Konto się zmieniło. Spróbuj ponownie.');
      const preferredHour = hourEl ? parseInt(hourEl.value, 10) : 7;
      const payload = action==='subscribe' ? {action,consent:true,preferredHour,fcmToken:pushToken} : {action};
      const response = await fetch('https://lumina-push.nazirczarkes.workers.dev/v1/course/subscription',{
        method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+await user.getIdToken()},
        body:JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw Error(data.error || 'Zapis subskrypcji nie powiódł się.');
      if (typeof data.subscribed !== 'boolean') throw Error('Serwer nie potwierdził stanu subskrypcji. Spróbuj ponownie.');
      if (data.subscribed) {
        if (typeof data.preferredHour === 'number' && hourEl) hourEl.value = String(data.preferredHour);
        const hourStr = String(data.preferredHour ?? preferredHour).padStart(2,'0') + ':00';
        status.textContent = `Subskrypcja aktywna. Preferowana godzina: ${hourStr}. Powiadomimy Cię o nowej lekcji.`;
      } else {
        status.textContent = 'Subskrypcja wyłączona. Powiadomienia czatu pozostają bez zmian.';
      }
      if (action==='unsubscribe') panel.querySelector('input').checked=false;
    } catch(error) {status.textContent=error.message || 'Operacja nie powiodła się. Spróbuj ponownie.';}
    finally {busy=false;panel.querySelectorAll('button').forEach(b=>b.disabled=false);}
  });
})();
