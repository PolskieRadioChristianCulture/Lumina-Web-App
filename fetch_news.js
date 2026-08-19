const fs = require('fs');
const https = require('https');

https.get('https://wiadomosci.wp.pl/rss.xml', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        const titles = [];
        const regex = /<item>[\s\S]*?<title>(?:<!\[CDATA\[)?([^<]+?)(?:\]\]>)?<\/title>/g;
        let match;
        while ((match = regex.exec(data)) !== null) {
            let title = match[1].trim();
            // decode html entities
            title = title.replace(/&#34;/g, '"');
            title = title.replace(/&quot;/g, '"');
            title = title.replace(/&amp;/g, '&');
            titles.push(title);
            if (titles.length >= 10) break;
        }
        
        fs.writeFileSync('news.json', JSON.stringify(titles, null, 2), 'utf8');
        console.log('news.json updated with ' + titles.length + ' titles.');
    });
}).on('error', (err) => {
    console.error('Error fetching RSS:', err.message);
});
