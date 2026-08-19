const fs = require('fs');
let html = fs.readFileSync('cctv24-worship.html', 'utf8');

// Update WhatsApp text
html = html.replace(/DOŁĄCZ NA WHATSAPP — szczegóły w bocznej ramce/g, 'DOŁĄCZ NA WHATSAPP — Napisz pod numer 507 821 789');

// Update Prayer text
html = html.replace(/Dziękujemy za każde wsparcie i modlitwę!/g, 'Dziękujemy za każde wsparcie i wspólną modlitwę za Ojczyznę!');

fs.writeFileSync('cctv24-worship.html', html);
console.log("Updated ticker texts.");
