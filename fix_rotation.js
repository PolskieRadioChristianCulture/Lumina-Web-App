const fs = require('fs');

let content = fs.readFileSync('cctv24-worship.html', 'utf8');

const rotationScript = `
    <script>
    (function(){
        const bgImages = ['bg-worship-1.png', 'bg-worship-2.png', 'bg-worship-3.png', 'bg-worship-4.png'];
        let currentBgIdx = 0;
        
        // Set initial image
        const active = document.getElementById("bg-img-active");
        const swap = document.getElementById("bg-img-swap");
        if(active) active.src = bgImages[currentBgIdx];

        setInterval(() => {
            if(!active || !swap) return;
            currentBgIdx = (currentBgIdx + 1) % bgImages.length;
            
            swap.src = bgImages[currentBgIdx];
            swap.style.transition = 'opacity 2s ease-in-out';
            swap.style.opacity = 1;
            
            setTimeout(() => {
                active.src = swap.src;
                swap.style.opacity = 0;
            }, 2000);
        }, 35000); // Rotate every 35 seconds
        
        // Override the global getDynamicBackground just in case old code calls it
        window.getDynamicBackground = function() { 
            return document.getElementById("bg-img-active").src; 
        };
    })();
    </script>
</body>
`;

content = content.replace('</body>', rotationScript);

fs.writeFileSync('cctv24-worship.html', content);
console.log("Background rotation injected.");
