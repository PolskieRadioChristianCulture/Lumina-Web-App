import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
  projectId: "gen-lang-client-0094354839",
  appId: "1:553245611022:web:5ae303f1fe0d6d16f8985f",
  apiKey: "AIzaSyBDuwM3vB5elVsTgFw6xKkwbqEUCT--h7c",
  authDomain: "gen-lang-client-0094354839.firebaseapp.com",
  storageBucket: "gen-lang-client-0094354839.firebasestorage.app",
  messagingSenderId: "553245611022",
  measurementId: "G-P5L6Q1MXRL"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-be1ade58-95a0-4035-8abe-2b3fd74793b6");

document.addEventListener("DOMContentLoaded", () => {
    const dzjBtn = document.getElementById("navDzjLink");
    const modal = document.getElementById("dzjModal");
    const closeBtn = document.getElementById("dzjCloseBtn");
    const closeFooterBtn = document.getElementById("dzjCloseFooterBtn");
    const modalOverlay = document.getElementById("dzjModalOverlay");

    const contentBox = document.getElementById("dzjContentBox");
    const titleBox = document.getElementById("dzjTitle");
    const dateBox = document.getElementById("dzjDate");

    const openModal = async () => {
        // Close side drawer if open
        const drawer = document.getElementById("sideDrawer");
        const drawerOverlay = document.getElementById("drawerOverlay");
        if (drawer) drawer.classList.remove("open");
        if (drawerOverlay) drawerOverlay.classList.remove("visible");

        modal.classList.add("open");
        document.body.style.overflow = "hidden"; // Prevent scrolling

        try {
            contentBox.innerHTML = `
                <div class="dzj-loading">
                    <div class="dzj-spinner"></div>
                    <p>Pobieranie z chmury...</p>
                </div>
            `;
            
            const q = query(collection(db, "morning_inspirations"), orderBy("timestamp", "desc"), limit(1));
            const snap = await getDocs(q);

            if (!snap.empty) {
                const doc = snap.docs[0].data();
                
                let dateStr = "Dzisiaj";
                if (doc.timestamp && doc.timestamp.toDate) {
                    const date = doc.timestamp.toDate();
                    dateStr = date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
                }

                titleBox.textContent = doc.title || "Codzienna Inspiracja";
                dateBox.textContent = dateStr;

                let formattedContent = (doc.content || "Brak treści na dziś.")
                    .replace(/\n\n/g, '</p><p class="mt-4">')
                    .replace(/\n/g, '<br/>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                
                contentBox.innerHTML = `
                    <div class="dzj-text-content">
                        <p>${formattedContent}</p>
                    </div>
                    
                    <!-- YouTube Video Section -->
                    <div class="dzj-youtube-section">
                        <div class="dzj-youtube-header">
                            <i class="fa-solid fa-heart"></i>
                            <span>POSŁUCHAJ HYMNU</span>
                        </div>
                        <div class="dzj-youtube-container">
                            <iframe 
                                src="https://www.youtube.com/embed/wKfdQrKwYtw?si=IrRVVy4LlgUqtnTq" 
                                title="Dobrze, że jesteś - Hymn" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                referrerpolicy="strict-origin-when-cross-origin" 
                                allowfullscreen
                            ></iframe>
                        </div>
                    </div>

                    <!-- SMS CTA -->
                    <div class="dzj-sms-cta">
                        <p class="dzj-sms-title"><i class="fa-solid fa-share-nodes"></i> Bądź na bieżąco</p>
                        <p class="dzj-sms-text">Jeśli Twój frontowy system powiadomień jeszcze nie działa, wyślij darmowy SMS o treści <strong>Inspiracje</strong> na numer <strong class="dzj-sms-number">783 478 280</strong>, by codziennie odbierać to Słowo na swój telefon!</p>
                    </div>
                `;
            } else {
                titleBox.textContent = "☀️ Lato ku Bożej chwale";
                dateBox.textContent = new Date().toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });

                const rawContent = `Dzień czwarty – Taktyka Oczyszczenia Linii Zaopatrzenia

Żaden oddział nie przetrwa na froncie, jeśli jego linie zaopatrzenia zostaną odcięte lub zanieczyszczone przez wroga. W walce duchowej Twoim zaopatrzeniem jest czysta prawda, która karmi Twoje serce. Oddanie Bogu chwały wymaga dziś od Ciebie radykalnego przeglądu tego, czym się karmisz. Jeśli pozwalasz, aby do Twojego umysłu sączyły się kłamstwa, plotki, toksyczne wiadomości lub bezwartościowe treści, Twoja siła do działania natychmiast spada. Czas odciąć dopływ duchowej trucizny i podłączyć się pod jedyne, niezawodne źródło życia.

Jezus mówi dziś do Ciebie:
„Wy już jesteście czyści dzięki słowu, które do was powiedziałem.” (Ewangelia według świętego Jana, rozdział piętnasty, werset trzeci)

**Zadanie Taktyczne:**
Przeprowadź dziś radykalną selekcję informacji. Wyłącz na cały dzień źródła, które przynoszą Ci niepokój, gniew lub skłaniają do grzechu. Zamiast tego przeznacz ten czas na uważne przeczytanie jednego rozdziału Pisma Świętego. Oczyść swoje linie zaopatrzenia.

W Christian Culture subskrypcje i aplikacje są dla Ciebie zawsze bezpłatne.

**Modlitwa Bojowa:**
„Jezu, staję przed Tobą, by uporządkować moje wnętrze. Przepraszam za chwile, gdy karmiłem umysł rzeczami, które oddalały mnie od Ciebie. Oczyszczaj mnie Swoim Słowem i daj mi pragnienie szukania wyłącznie tego, co buduje, umacnia i przynosi chwałę Twojemu świętemu Imieniu.”

**Rozkaz Dnia (Zadbaj o wzrost):**
Otwórz swoje serce na działanie we wspólnocie. Wejdź do letniej bazy ludzi z pasją, zintegruj swoje siły z innymi i zacznij działać w zorganizowanym zespole, który ramię w ramię idzie drogą formacji i realnego wpływu na świat.

**Błogosławieństwo:**
Niech Pan zastępów strzeże dziś Twojego umysłu i serca przed wszelkimi kłamstwami nieprzyjaciela. Niech Jego prawda napełni Cię świeżą mądrością, czystością myśli i niezłomną siłą do realizowania Jego woli.

Dobrego dnia! Podaj dalej.`;

                let formattedContent = rawContent
                    .replace(/\n\n/g, '</p><p class="mt-4">')
                    .replace(/\n/g, '<br/>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                
                contentBox.innerHTML = `
                    <div class="dzj-text-content">
                        <p>${formattedContent}</p>
                    </div>
                    
                    <!-- YouTube Video Section -->
                    <div class="dzj-youtube-section">
                        <div class="dzj-youtube-header">
                            <i class="fa-solid fa-heart"></i>
                            <span>POSŁUCHAJ HYMNU</span>
                        </div>
                        <div class="dzj-youtube-container">
                            <iframe 
                                src="https://www.youtube.com/embed/wKfdQrKwYtw?si=IrRVVy4LlgUqtnTq" 
                                title="Dobrze, że jesteś - Hymn" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                referrerpolicy="strict-origin-when-cross-origin" 
                                allowfullscreen
                            ></iframe>
                        </div>
                    </div>

                    <!-- SMS CTA -->
                    <div class="dzj-sms-cta">
                        <p class="dzj-sms-title"><i class="fa-solid fa-share-nodes"></i> Bądź na bieżąco</p>
                        <p class="dzj-sms-text">Jeśli Twój frontowy system powiadomień jeszcze nie działa, wyślij darmowy SMS o treści <strong>Inspiracje</strong> na numer <strong class="dzj-sms-number">783 478 280</strong>, by codziennie odbierać to Słowo na swój telefon!</p>
                    </div>
                `;
            }
        } catch (e) {
            console.error("Błąd pobierania rozważania:", e);
            contentBox.innerHTML = '<p class="dzj-error">Wystąpił błąd podczas pobierania. Spróbuj ponownie później.</p>';
        }
    };

    const closeModal = () => {
        modal.classList.remove("open");
        document.body.style.overflow = "";
    };

    if (dzjBtn) dzjBtn.addEventListener("click", (e) => { e.preventDefault(); openModal(); });
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (closeFooterBtn) closeFooterBtn.addEventListener("click", closeModal);
    if (modalOverlay) modalOverlay.addEventListener("click", closeModal);
});
