import { db } from "./firebase-config.js";
import { collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

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

    const hTitleBox = document.getElementById("homepageDzjTitle");
    const hDateBox = document.getElementById("homepageDzjDate");
    const hContentBox = document.getElementById("homepageDzjContent");

    const populateContent = (title, formattedContent, dateStr) => {
        // Populate modal
        if (titleBox) titleBox.textContent = title;
        if (dateBox) dateBox.textContent = dateStr;
        if (contentBox) {
            contentBox.innerHTML = `
                <div class="dzj-text-content">
                    <p>${formattedContent}</p>
                </div>
                
                <!-- Przycisk Udostępnij & TV -->
                <div style="text-align: center; margin: 20px 0; display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
                    <button onclick="window.shareDzjContent()" style="background: #E2B859; color: #000; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(226, 184, 89, 0.4); font-family: inherit;">
                        <i class="fa-solid fa-share-nodes"></i> UDOSTĘPNIJ ROZWAŻANIE
                    </button>
                    ${window.youtubeLiveStreamId ? `
                    <a href="https://youtube.com/live/${window.youtubeLiveStreamId}" target="_blank" style="background: rgba(226, 184, 89, 0.1); color: #E2B859; border: 2px solid #E2B859; padding: 10px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; font-family: inherit; text-decoration: none;">
                        <i class="fa-solid fa-tv"></i> ZOBACZ WERSJĘ TV
                    </a>
                    ` : ''}
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

        // Populate homepage
        if (hTitleBox) hTitleBox.textContent = title;
        if (hDateBox) hDateBox.textContent = dateStr;
        if (hContentBox) {
            hContentBox.innerHTML = `
                <div class="dzj-text-content" style="color: #e0e0e0; line-height: 1.8; font-weight: 300;">
                    <p>${formattedContent}</p>
                </div>
            `;
        }
    };

    const loadReflectionData = async () => {
        try {
            const q = query(collection(db, "web_inspirations"), orderBy("date", "desc"), limit(1));
            const snap = await getDocs(q);

            if (!snap.empty) {
                const doc = snap.docs[0].data();
                
                let dateStr = "Dzisiaj";
                if (doc.timestamp && doc.timestamp.toDate) {
                    const date = doc.timestamp.toDate();
                    dateStr = date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
                }

                const title = doc.title || "Codzienna Inspiracja";
                const rawContent = doc.contentWeb || doc.content || "Brak treści na dziś.";
                window.currentDzjTitle = title;
                window.currentDzjText = rawContent;

                let formattedContent = rawContent
                    .replace(/((?:https?:\/\/|www\.)[^\s\n<]+)/g, (url) => {
                        const href = url.startsWith('http') ? url : 'https://' + url;
                        let label = url;
                        if (url.includes('chat.whatsapp.com')) {
                            label = 'Dołącz do grupy WhatsApp';
                        } else if (url.includes('play.google.com')) {
                            label = 'Nasze Aplikacje w Google Play';
                        } else if (url.includes('polskieradio.cc')) {
                            label = 'Polskie Radio CC';
                        } else if (url.includes('cclite.pl')) {
                            label = 'Portal CC Lite';
                        } else {
                            try {
                                const urlObj = new URL(href);
                                label = urlObj.hostname;
                            } catch (e) {
                                label = 'Otwórz odnośnik';
                            }
                        }
                        return `<a href="${href}" target="_blank" style="color: #E2B859; text-decoration: underline; font-weight: bold;">${label}</a>`;
                    })
                    .replace(/\n\n/g, '</p><p class="mt-4">')
                    .replace(/\n/g, '<br/>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

                populateContent(title, formattedContent, dateStr);
            } else {
                throw new Error("No reflection found in Firestore query.");
            }
        } catch (e) {
            console.error("Błąd pobierania rozważania z Firestore:", e);
            const defaultTitle = "☀️ Lato ku Bożej chwale";
            const defaultDate = new Date().toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
            const rawContent = `☀️ Lato ku Bożej chwale
Dzień 26 – Taktyka Synowskiej Śmiałości i Dotyku Ojcowskiej Miłości.

Zwycięstwo na duchowym froncie wymaga dziś przełamania wstydu i fałszywego dystansu wobec Boga. Wróg próbuje wykorzystać Twoje słabości i potknięcia, wmawiając Ci, że jesteś zbyt nieczysty, by stanąć przed obliczem Stwórcy. Oddanie Bogu chwały polega na radykalnym odrzuceniu tego oskarżenia. Twój Niebiański Ojciec nie brzydzi się Twoimi ranami – On wyciąga rękę, by dotknąć Twojej codzienności i przynieść Ci natychmiastowe oczyszczenie. Jako Jego syn i córka masz pełne prawo przychodzić do bazy dowodzenia w każdym stanie, szukając ratunku i odnowienia sił.

Jezus mówi dziś do Ciebie:
„A oto zbliżył się trędowaty, upadł przed Nim i prosił Go: Panie, jeśli chcesz, możesz mnie oczyścić. Jezus wyciągnął rękę, dotknął go i rzekł: Chcę, bądź oczyszczony! I natychmiast został oczyszczony z trądu." (Mateusza 8,2-3)

Zadanie Taktyczne:
Zdemaskuj dziś wszelkie mechanizmy duchowej ucieczki i ukrywania się przed Bogiem. Jeśli odczuwasz ciężar w sumieniu, stań natychmiast w prawdzie przed Ojcem na modlitwie. Przyjmij Jego przebaczenie i realizuj swoje obowiązki zawodowe, społeczne oraz rodzinne z pozycji człowieka wolnego, podniesionego przez Bożą miłość.

W Christian Culture subskrypcje i aplikacje są zawsze BEZPŁATNE.

Modlitwa Bojowa:
„Ojcze Niebieski, dziękuję, że Twoja miłość jest większa niż moje słabości. Odrzucam potępienie podsuwane przez nieprzyjaciela. Upadam przed Tobą z ufnością dziecka i proszę o Twój oczyszczający dotyk. Napełnij mnie siłą i mądrością, by moje dzisiejsze działania były wolne od strachu i przynosiły Ci pełną chwałę."

Baza i wzrost: https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0 – Wejdź do zespołu ludzi z pasją!

PODAJ DALEJ 🔴
www.polskieradio.cc | www.cclite.pl
Apps: https://play.google.com/store/apps/dev?id=5215448773598149938`;

            window.currentDzjTitle = defaultTitle;
            window.currentDzjText = rawContent;

            let formattedContent = rawContent
                .replace(/((?:https?:\/\/|www\.)[^\s\n<]+)/g, (url) => {
                    const href = url.startsWith('http') ? url : 'https://' + url;
                    let label = url;
                    if (url.includes('chat.whatsapp.com')) {
                        label = 'Dołącz do grupy WhatsApp';
                    } else if (url.includes('play.google.com')) {
                        label = 'Nasze Aplikacje w Google Play';
                    } else if (url.includes('polskieradio.cc')) {
                        label = 'Polskie Radio CC';
                    } else if (url.includes('cclite.pl')) {
                        label = 'Portal CC Lite';
                    } else {
                        try {
                            const urlObj = new URL(href);
                            label = urlObj.hostname;
                        } catch (e) {
                            label = 'Otwórz odnośnik';
                        }
                    }
                    return `<a href="${href}" target="_blank" style="color: #E2B859; text-decoration: underline; font-weight: bold;">${label}</a>`;
                })
                .replace(/\n\n/g, '</p><p class="mt-4">')
                .replace(/\n/g, '<br/>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

            populateContent(defaultTitle, formattedContent, defaultDate);
        }
    };

    const scrollToSection = () => {
        // Close side drawer if open
        const drawer = document.getElementById("sideDrawer");
        const drawerOverlay = document.getElementById("drawerOverlay");
        if (drawer) drawer.classList.remove("open");
        if (drawerOverlay) drawerOverlay.classList.remove("visible");

        const section = document.getElementById("dailyReflectionSection");
        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
        }
    };

    const openModal = () => {
        // Close side drawer if open
        const drawer = document.getElementById("sideDrawer");
        const drawerOverlay = document.getElementById("drawerOverlay");
        if (drawer) drawer.classList.remove("open");
        if (drawerOverlay) drawerOverlay.classList.remove("visible");

        if (modal) {
            modal.classList.add("open");
            document.body.style.overflow = "hidden"; // Prevent scrolling
        }
    };

    const closeModal = () => {
        if (modal) {
            modal.classList.remove("open");
            document.body.style.overflow = "";
        }
    };

    if (dzjBtn) dzjBtn.addEventListener("click", (e) => { e.preventDefault(); scrollToSection(); });
    if (dzjIconBtn) dzjIconBtn.addEventListener("click", (e) => { e.preventDefault(); scrollToSection(); });
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (closeFooterBtn) closeFooterBtn.addEventListener("click", closeModal);
    if (modalOverlay) modalOverlay.addEventListener("click", closeModal);

    // Initial fetch to load page reflection
    loadReflectionData().then(() => {
        // Auto-scroll to section if URL contains ?dzj=true
        if (window.location.search.includes('dzj=true')) {
            setTimeout(scrollToSection, 300);
        } else if (window.location.hash) {
            // Re-apply hash scroll after dynamic content shifted the layout
            setTimeout(() => {
                const target = document.querySelector(window.location.hash);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }, 300);
        }
    });
});
