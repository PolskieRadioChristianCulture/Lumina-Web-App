import fs from 'node:fs';

async function createCampaign() {
  const payload = {
    id: 'camp_anty_halloween_20261030',
    slug: 'anty-halloween-wybierz-swiatlosc-2026',
    subject_pl: '#antyHALLOWEEN — Wybierz Światłość zamiast mroku ✨ | Deklaracja Christian Culture',
    subject_en: '#antiHALLOWEEN — Choose Light over darkness ✨ | Christian Culture Declaration',
    preheader_pl: 'My świętujemy inaczej! Pobierz darmowe grafiki, poznaj biblijną deklarację i wesprzyj dzieło Ewangelii.',
    preheader_en: 'We celebrate differently! Download free graphics, read the biblical declaration, and support the mission.',
    topic_filter_json: JSON.stringify(['nowosci-ekocc', 'muzyka-radio-tv', 'biblia-akademia']),
    locale_filter: 'all',
    status: 'approved',
    html_body: `<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8"><title>#antyHALLOWEEN — Wybierz Światłość zamiast mroku ✨ | Deklaracja Christian Culture</title></head>
<body style="margin:0;padding:0;background-color:#0b0f17;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e6edf3;">
  <div style="max-width:620px;margin:0 auto;background:#131b26;border:1px solid #243247;border-radius:16px;overflow:hidden;margin-top:24px;margin-bottom:32px;">
    <div style="background:linear-gradient(135deg,#1f2c3f 0%,#0e1520 100%);padding:32px 24px;text-align:center;border-bottom:2px solid #C5A059;">
      <div style="display:inline-block;padding:6px 14px;background:#C5A059;color:#000;font-weight:900;font-size:12px;letter-spacing:2px;border-radius:20px;text-transform:uppercase;margin-bottom:12px;">#antyHALLOWEEN 2026</div>
      <h1 style="color:#ffffff;font-size:24px;margin:0 0 8px;font-weight:800;line-height:1.3;">My świętujemy inaczej!</h1>
      <p style="color:#C5A059;margin:0;font-size:14px;letter-spacing:1px;font-weight:600;">Wybieramy Światłość, Życie, Rodzinę i Ewangelię</p>
    </div>
    <div style="padding:32px 28px;line-height:1.7;color:#c9d1d9;font-size:15px;">
      <p style="font-size:17px;font-weight:600;color:#ffffff;margin-top:0;">Szczęść Boże,</p>
      <p>Halloween coraz częściej przedstawiane jest jako niewinna zabawa. Jednak chrześcijaństwo pyta o owoce: jakie wartości promuje ta kultura i czym wypełnia serca naszych dzieci?</p>
      <p>Jako <strong>Christian Culture</strong> mówimy zdecydowane <em>„NIE”</em> kulturze grozy, lęku i komercyjnego mroku. Zamiast tego z radością wybieramy <strong>Światłość Chrystusa</strong>, prawdę Ewangelii, nadzieję i prawdziwą wspólnotę.</p>
      <blockquote style="margin:24px 0;padding:16px 20px;background:#182333;border-left:4px solid #FF7A00;border-radius:8px;font-style:italic;color:#e6edf3;">
        „Wy wszyscy bowiem jesteście synami światłości i synami dnia. Nie jesteśmy synami nocy ani ciemności.”<br>
        <span style="font-style:normal;font-weight:700;color:#FF7A00;">— 1 List do Tesaloniczan 5:5 (UBG)</span>
      </blockquote>
      <h3 style="color:#ffffff;font-size:18px;margin:28px 0 12px;">Dołącz do akcji i podaj Światło dalej:</h3>
      <p>Przygotowaliśmy dla Ciebie oficjalną deklarację chrześcijańską oraz pakiet bezpłatnych grafik w wysokiej rozdzielczości gotowych do publikacji na Facebooku, Instagramie i WhatsAppie.</p>
      <div style="text-align:center;margin:32px 0;">
        <a href="https://polskieradio.cc/Halloween" style="display:inline-block;padding:16px 36px;background:#FF7A00;color:#ffffff;text-decoration:none;font-weight:800;font-size:15px;border-radius:12px;box-shadow:0 8px 24px rgba(255,122,0,0.35);text-transform:uppercase;letter-spacing:1px;">Otwórz stronę akcji i pobierz grafiki →</a>
      </div>
      <div style="margin-top:40px;padding:24px;background:#0d131c;border:1px solid #243247;border-radius:12px;">
        <div style="color:#C5A059;font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Mecenat i Wsparcie Misji</div>
        <div style="color:#ffffff;font-weight:700;font-size:16px;margin-bottom:8px;">Zostań Mecenasem Ewangelizacji w Polsce</div>
        <p style="font-size:13px;color:#8b949e;line-height:1.6;margin:0 0 16px;">Nasze radio 24/7, telewizja CCTV24, Akademia Biblijna oraz akcje takie jak #antyHALLOWEEN docierają bezpłatnie do tysięcy ludzi dzięki hojności Mecenasów Misji. Jeśli to dzieło jest bliskie Twojemu sercu, możesz wesprzeć je dowolną kwotą.</p>
        <a href="https://polskieradio.cc/wspieraj" style="color:#FF7A00;font-weight:700;font-size:14px;text-decoration:none;">Wspieram Misję Christian Culture &rarr;</a>
      </div>
    </div>
    <div style="background:#0b0f17;padding:20px 24px;border-top:1px solid #243247;font-size:12px;color:#8b949e;text-align:center;line-height:1.6;">
      <p style="margin:0 0 8px;">Otrzymujesz tę wiadomość, ponieważ zapisałeś się do Newslettera <strong>Christian Culture</strong>.</p>
      <p style="margin:0;">
        <a href="{{MANAGE_URL}}" style="color:#C5A059;text-decoration:none;margin-right:12px;">Zmień preferencje tematyczne</a> |
        <a href="{{UNSUBSCRIBE_URL}}" style="color:#8b949e;text-decoration:none;margin-left:12px;">Wypisz się z newslettera</a>
      </p>
    </div>
  </div>
</body>
</html>`,
    text_body: `#antyHALLOWEEN 2026 — My świętujemy inaczej!
Wybieramy Światłość, Życie, Rodzinę i Ewangelię

Szczęść Boże,

Halloween coraz częściej przedstawiane jest jako niewinna zabawa. Jednak chrześcijaństwo pyta o owoce: jakie wartości promuje ta kultura i czym wypełnia serca naszych dzieci?

Jako Christian Culture mówimy zdecydowane „NIE” kulturze grozy, lęku i komercyjnego mroku. Zamiast tego z radością wybieramy Światłość Chrystusa, prawdę Ewangelii, nadzieję i prawdziwą wspólnotę.

„Wy wszyscy bowiem jesteście synami światłości i synami dnia. Nie jesteśmy synami nocy ani ciemności.” — 1 List do Tesaloniczan 5:5 (UBG)

DOŁĄCZ DO AKCJI:
https://polskieradio.cc/Halloween

ZOSTAŃ MECENASEM MISJI:
https://polskieradio.cc/wspieraj

Zarządzanie preferencjami: {{MANAGE_URL}}
Wypisz się z newslettera: {{UNSUBSCRIBE_URL}}`,
  };

  const res = await fetch('https://polskieradio.cc/api/newsletter/admin/campaigns', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-newsletter-admin-secret': 'cc_admin_secret_20261030',
    },
    body: JSON.stringify(payload),
  });

  console.log('HTTP Status:', res.status);
  const data = await res.json();
  console.log('Response:', data);
}

createCampaign();
