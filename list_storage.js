// list_storage.js — lista plików MP3 z Firebase Storage (christian-culture-global)
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccount = require('C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'christian-culture-global.appspot.com'
});

const bucket = admin.storage().bucket();

async function listMp3s() {
    const [files] = await bucket.getFiles();
    const mp3s = files
        .map(f => f.name)
        .filter(n => n.toLowerCase().endsWith('.mp3'))
        .sort();

    console.log(`Znaleziono ${mp3s.length} plików MP3:\n`);
    mp3s.forEach((name, i) => {
        console.log(`${i + 1}. ${name}`);
    });

    // Zapisz też do pliku JSON do dalszego przetwarzania
    fs.writeFileSync('storage_files.json', JSON.stringify(mp3s, null, 2));
    console.log('\n✅ Zapisano do storage_files.json');
}

listMp3s().catch(console.error);
