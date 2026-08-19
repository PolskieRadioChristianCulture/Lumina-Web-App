function getDynamicBackground(imagePath) {
    const min = 15; // ODD
    const isPoranneTurn = (min % 2 === 0); // false
    
    if (imagePath && imagePath.includes("?v=")) {
        imagePath = imagePath.split("?v=")[0];
    }
    
    if (imagePath === "tlo_poranne_live.png" || imagePath === "breakfast_presenters.jpg") {
        if (isPoranneTurn) {
            return "tlo_poranne_live.png";
        } else {
            imagePath = "breakfast_presenters.jpg";
        }
    }
    
    if (imagePath === "tlo_live_1.png" || imagePath === "tlo_live_2.png") {
        if (isPoranneTurn) {
            return "tlo_live_1.png";
        } else {
            return "tlo_live_2.png";
        }
    }
    return imagePath;
}

console.log(getDynamicBackground("tlo_live_1.png")); // Expect tlo_live_2.png
