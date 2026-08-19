const fs = require('fs');

try {
    let content = fs.readFileSync('index.html', 'utf8');

    const injectionString = `
                        <!-- Course Ad: Apokalipsa - Księga Nadziei -->
                        <div style="margin-top: 20px; width: 100%; border-radius: 12px; overflow: hidden; border: 1.5px solid rgba(212,175,55,0.3); box-shadow: 0 10px 25px rgba(0,0,0,0.5); transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                            <a href="https://youtube.com/playlist?list=PLDA6geI28g8T0x5fNBe-WkTdZDgz5IYlR&si=4xqCUZokh-vLWbnW" target="_blank" style="display: block;">
                                <img src="SOBOTA.jpg" alt="Apokalipsa Księga Nadziei - Kurs" style="width: 100%; height: auto; display: block;">
                            </a>
                        </div>
`;

    // Find the end of the Wideo Shorts block
    const targetTag = '<p style="text-align: center; font-size: 0.75rem; color: #a1a1aa; margin-top: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Zobacz wideo-podsumowanie</p>';
    
    if (content.includes(targetTag)) {
        content = content.replace(targetTag, targetTag + '\n' + injectionString);
        fs.writeFileSync('index.html', content, 'utf8');
        console.log("Banner inserted successfully.");
    } else {
        console.log("Could not find the target tag.");
    }
} catch (e) {
    console.error(e);
}
