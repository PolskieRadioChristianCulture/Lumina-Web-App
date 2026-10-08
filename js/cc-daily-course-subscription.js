/* Account-bound opt-in. No automatic permission prompt, enrollment or send. */
(function () {
  const share = document.getElementById('ccDailyShare');
  if (!share || document.getElementById('ccDailySubscription')) return;
  const panel = document.createElement('section');
  panel.id = 'ccDailySubscription'; panel.className = 'cc-daily-share';
  panel.innerHTML = '<h2>Nie przegap nowej lekcji</h2><p>Subskrypcja jest powiązana z Twoim kontem Christian Culture/LUMINA. Powiadomienia otrzymasz na urządzeniach, na których włączysz push. Możesz zrezygnować w każdej chwili.</p><label style="display:flex;align-items:flex-start;gap:10px;padding:12px 0"><input type="checkbox" style="width:22px;min-height:22px;flex-shrink:0" aria-label="Zgoda na powiadomienia nowych lekcji"><span>Chcę otrzymywać powiadomienia push o nowych lekcjach kursu „Z Biblią za Pan Brat” i zgadzam się na zapis tej preferencji przy moim koncie.</span></label><div class="cc-daily-share-actions"><button type="button" data-action="subscribe">Subskrybuj nowe lekcje</button><button type="button" data-action="status">Sprawdź subskrypcję</button><button type="button" data-action="unsubscribe">Zrezygnuj</button></div><p role="status" aria-live="polite"></p><a href="/lumina-login">Zaloguj się do swojego konta</a>';
  share.insertAdjacentElement('afterend',panel);
  const status = panel.querySelector('[role="status"]');
  let busy = false;
  for (const button of panel.querySelectorAll('button')) button.addEventListener('click',async () => {
    if (busy) return;
    const action = button.dataset.action;
    if (action==='subscribe' && !panel.querySelector('input').checked) {status.textContent='Najpierw zaznacz zgodę na powiadomienia kursu.';return;}
    busy=true; panel.querySelectorAll('button').forEach(b=>b.disabled=true);
    try {
      const sdk = await import('/lumina-db.js?v=20261007_guardian2');
      const {auth} = await sdk.ensureDbReady();
      if (!auth) throw Error('Nie udało się połączyć z usługą logowania.');
      await auth.authStateReady();
      const user = auth.currentUser;
      if (!user || user.isAnonymous) throw Error('Zaloguj się, by bezpłatnie korzystać z większej liczby możliwości i zarządzać subskrypcją lekcji.');
      if (action==='subscribe') {
        const token = await sdk.requestNotificationPermission(user.uid);
        if (!token) throw Error('Push nie został włączony. Sprawdź zgodę na powiadomienia w przeglądarce i spróbuj ponownie.');
      }
      if (auth.currentUser?.uid!==user.uid) throw Error('Konto się zmieniło. Spróbuj ponownie.');
      const response = await fetch('https://lumina-push.nazirczarkes.workers.dev/v1/course/subscription',{
        method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+await user.getIdToken()},
        body:JSON.stringify(action==='subscribe'?{action,consent:true}:{action})
      });
      const data = await response.json();
      if (!response.ok) throw Error(data.error || 'Zapis subskrypcji nie powiódł się.');
      if (typeof data.subscribed !== 'boolean') throw Error('Serwer nie potwierdził stanu subskrypcji. Spróbuj ponownie.');
      status.textContent=data.subscribed?'Subskrypcja aktywna. Powiadomimy Cię o następnej nowej lekcji.':'Subskrypcja wyłączona. Powiadomienia czatu pozostają bez zmian.';
      if (action==='unsubscribe') panel.querySelector('input').checked=false;
    } catch(error) {status.textContent=error.message || 'Operacja nie powiodła się. Spróbuj ponownie.';}
    finally {busy=false;panel.querySelectorAll('button').forEach(b=>b.disabled=false);}
  });
})();
