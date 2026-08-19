const fs = require('fs');

let content = fs.readFileSync('cctv24-worship.html', 'utf8');

const targetStr = 'document.getElementById("clockDateLabel").textContent = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`;';
const replacementStr = 'document.getElementById("clockDateLabel").innerHTML = `${days[now.getDay()]},<br>${now.getDate()} ${months[now.getMonth()]}`;';

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replacementStr);
    fs.writeFileSync('cctv24-worship.html', content);
    console.log("Date format updated successfully.");
} else {
    console.log("Could not find the target string!");
}
