const fs = require('fs');

try {
    let content = fs.readFileSync('zapolske-live.html', 'utf8');

    // Replace the query definition
    const oldQuery = `        const q = query(
            collection(db, "prayer_intentions"),
            limit(50)
        );`;
        
    const newQuery = `        const q = query(collection(db, "prayer_intentions"), orderBy("timestamp", "desc"), limit(50));`;

    if (content.includes(oldQuery)) {
        content = content.replace(oldQuery, newQuery);
        fs.writeFileSync('zapolske-live.html', content, 'utf8');
        console.log("Success! Query updated.");
    } else {
        console.log("Old query not found, attempting regex fallback.");
        const regex = /const q = query\([\s\S]*?limit\(50\)[\s\S]*?\);/;
        if (regex.test(content)) {
            content = content.replace(regex, newQuery);
            fs.writeFileSync('zapolske-live.html', content, 'utf8');
            console.log("Success! Query updated using regex.");
        } else {
            console.error("Could not find the query block.");
        }
    }
} catch(e) {
    console.error(e);
}
