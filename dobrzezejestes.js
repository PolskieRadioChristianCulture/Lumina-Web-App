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

window.shareDzjContent = function() {
    const textToShare = window.currentDzjTitle + "\n\n" + window.currentDzjText;
    const shareUrl = window.location.origin + window.location.pathname + "?dzj=true";
    
    if(navigator.share) {
        navigator.share({
            title: window.currentDzjTitle,
            text: textToShare,
            url: shareUrl
        }).catch(console.error);
    } else {
        if(navigator.clipboard) {
            navigator.clipboard.writeText(textToShare + "\n\n" + shareUrl)
                .then(() => alert('Treść rozważania została skopiowana do schowka!'))
                .catch(console.error);
        } else {
            alert('Twoja przeglądarka nie wspiera systemowego udostępniania.');
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const dzjBtn = document.getElementById("navDzjLink");
    const dzjIconBtn = document.getElementById("navDzjIconBtn");
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

                window.currentDzjTitle = titleBox.textContent;
                window.currentDzjText = doc.content || "Brak treści na dziś.";

                let formattedContent = (doc.content || "Brak treści na dziś.")
                    .replace(/\n\n/g, '</p><p class="mt-4">')
                    .replace(/\n/g, '<br/>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                
                contentBox.innerHTML = `
                    <div class="dzj-text-content">
                        <p>${formattedContent}</p>
                    </div>
                    
                    <!-- Przycisk Udostępnij -->
                    <div style="text-align: center; margin: 20px 0;">
                        <button onclick="window.shareDzjContent()" style="background: #E2B859; color: #000; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(226, 184, 89, 0.4); font-family: inherit;">
                            <i class="fa-solid fa-share-nodes"></i> UDOSTĘPNIJ ROZWAŻANIE
                        </button>
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

                const rawContent = `Dzień 6 – Taktyka Wiernego Podporządkowania Rozkazom.

Żaden oddział nie wygra potyczki, jeśli żołnierze ignorują wytyczne dowództwa i walczą według własnego uznania. Samowola na froncie prowadzi do chaosu i porażki. Oddanie Bogu chwały wymaga dziś od Ciebie pełnego i natychmiastowego podporządkowania swoich planów pod Jego wolę. Kiedy uciszasz własne ego, ambicje i lęki, a w zamian wybierasz proste posłuszeństwo Słowu Bożemu, zyskujesz pełne wsparcie i ochronę z nieba. Prawdziwa siła nie wynika z Twoich własnych pomysłów, ale z wierności rozkazom Najwyższego Dowódcy.

Jezus mówi dziś do Ciebie:
„Jeśli Mnie miłujecie, będziecie zachowywać moje przykazania.” (Jana 14,15)

**Zadanie Taktyczne:**
Zidentyfikuj dziś jedną sytuację, w której masz tendencję do robienia rzeczy po swojemu, wbrew Bożym zasadom. Świadomie zrezygnuj z własnego planu i postąp dokładnie tak, jak nakazuje Ewangelia. Podporządkuj swój strach Jego rozkazom.

W Christian Culture subskrypcje i aplikacje są zawsze BEZPŁATNE.

**Modlitwa Bojowa:**
„Jezu, mój Najwyższy Dowódco, przyznaję, że zbyt często chcę działać na własną rękę, ufając tylko swojemu umysłowi. Przepraszam za każdą samowolę. Dziś staję przed Tobą w pełnej gotowości i proszę – wydaj rozkaz, a ja go wykonam. Niech Twoja wola stanie się moim absolutnym priorytetem, a posłuszeństwo moją największą siłą.”

**Rozkaz Dnia (Zadbaj o wzrost):**
Wejdź do letniej bazy ludzi z pasją!

**Błogosławieństwo:**
Niech Pan zastępów strzeże dziś Twojego umysłu i serca. Niech Jego prawda napełni Cię świętą mądrością i niezłomną siłą do realizowania Jego woli.

Dobrej nocy! PODAJ DALEJ 🔴
www.polskieradio.cc | www.cclite.pl
Apps: https://play.google.com/store/apps/dev?id=5215448773598149938`;

                window.currentDzjTitle = titleBox.textContent;
                window.currentDzjText = rawContent;

                let formattedContent = rawContent
                    .replace(/\n\n/g, '</p><p class="mt-4">')
                    .replace(/\n/g, '<br/>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                
                contentBox.innerHTML = `
                    <div class="dzj-text-content">
                        <p>${formattedContent}</p>
                    </div>
                    
                    <!-- Przycisk Udostępnij -->
                    <div style="text-align: center; margin: 20px 0;">
                        <button onclick="window.shareDzjContent()" style="background: #E2B859; color: #000; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(226, 184, 89, 0.4); font-family: inherit;">
                            <i class="fa-solid fa-share-nodes"></i> UDOSTĘPNIJ ROZWAŻANIE
                        </button>
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
    if (dzjIconBtn) dzjIconBtn.addEventListener("click", (e) => { e.preventDefault(); openModal(); });
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (closeFooterBtn) closeFooterBtn.addEventListener("click", closeModal);
    if (modalOverlay) modalOverlay.addEventListener("click", closeModal);

    // Auto-open modal if URL contains ?dzj=true
    if (window.location.search.includes('dzj=true')) {
        openModal();
    }
});
