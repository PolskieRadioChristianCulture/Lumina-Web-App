'use strict';
// UI-only preview: deliberately has no network calls, no authentication, no persistence.
const tabs=document.querySelectorAll('.tab');
const content=document.querySelector('#demo-content');
const views={
 rozmowy:`<div class="fake-chat"><p class="day">Dziś · przykładowe wiadomości</p><div class="bubble inbound"><small>Mama · przykład</small><p>Cześć! Jak minął Ci dzień? 💙</p></div><div class="bubble outbound"><small>Przykładowa odpowiedź</small><p>Super! 😊 Opowiem Ci później!</p></div><div class="bubble inbound"><small>Tata · przykład</small><p>Miłego popołudnia! ❤️</p></div></div>`,
 kontakty:`<p class="day">Tylko przykładowe kontakty</p><div class="list-contact">👩 Mama <span>✓ Zatwierdzona</span></div><div class="list-contact">👨 Tata <span>✓ Zatwierdzony</span></div><div class="list-contact">👵 Babcia <span>✓ Zatwierdzona</span></div><p class="day">Dodawanie kontaktów jest niedostępne w demo.</p>`,
 pomoc:`<div style="padding:18px;text-align:center"><div style="font-size:3rem">💜</div><h3>Potrzebujesz pomocy?</h3><p style="line-height:1.65;color:#627791">Porozmawiaj z zaufanym dorosłym. W prawdziwej aplikacji zgłoszenie trafi do zweryfikowanego opiekuna.</p></div>`
};
for(const tab of tabs)tab.addEventListener('click',()=>{for(const t of tabs){const selected=t===tab;t.classList.toggle('active',selected);t.setAttribute('aria-selected',String(selected));}content.innerHTML=views[tab.dataset.tab];});
document.querySelector('#helpButton').addEventListener('click',()=>document.querySelector('#helpDialog').showModal());
document.querySelector('#year').textContent=new Date().getFullYear();
