import https from 'https';

https.get('https://firestore.googleapis.com/v1/projects/lumina-cc/databases/(default)/documents/lumina_profiles?pageSize=100', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.documents) {
        console.log(`Total profiles in Firestore: ${json.documents.length}`);
        json.documents.forEach((d, idx) => {
          const f = d.fields || {};
          const id = d.name.split('/').pop();
          const name = f.name?.stringValue || '(bez nazwy)';
          const slug = f.slug?.stringValue || id;
          const match = f.matchScore?.stringValue || '';
          console.log(`[${idx+1}] ID: ${id} | Name: "${name}" | Slug: "${slug}" | Match: "${match}"`);
        });
      }
    } catch(e) {
      console.error(e);
    }
  });
});
