const https = require('https');

https.get('https://firestore.googleapis.com/v1/projects/lumina-cc/databases/(default)/documents/lumina_agent_notes', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.documents) {
        const notes = json.documents.map(d => {
          const f = d.fields || {};
          return {
            id: d.name.split('/').pop(),
            status: f.status?.stringValue || 'pending',
            priority: f.priority?.stringValue || 'normal',
            isSpecialPriority: f.isSpecialPriority?.booleanValue || false,
            specialGuidelines: f.specialGuidelines?.stringValue || '',
            note: f.note?.stringValue || '',
            page: f.page?.stringValue || '',
            selector: f.selector?.stringValue || '',
            createdAt: f.createdAt?.stringValue || '',
            timestamp: parseInt(f.timestamp?.integerValue || '0')
          };
        });
        notes.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
        console.log('--- REJESTR NOTATEK DLA AGENTA (LUMINA) ---');
        notes.slice(0, 5).forEach((n, idx) => {
          console.log(`[${idx+1}] ID: ${n.id} | Status: ${n.status} | Priorytet: ${n.priority} | Data: ${n.createdAt}`);
          console.log(`    📍 Strona: ${n.page} | Selektor: ${n.selector}`);
          if (n.specialGuidelines) console.log(`    👑 WYTYCZNE DOWÓDCY: ${n.specialGuidelines}`);
          console.log(`    📝 Treść:\n${n.note}`);
          console.log('----------------------------------------------------------------------');
        });
      } else {
        console.log('Brak dokumentów w kolekcji lumina_agent_notes.');
      }
    } catch(e) {
      console.error('Błąd parsowania:', e);
    }
  });
});
