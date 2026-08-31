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
            const now = new Date();
            const pad = (n) => n < 10 ? '0' + n : n;
            const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

            const q = query(collection(db, "web_inspirations"), orderBy("date", "desc"), limit(10));
            const snap = await getDocs(q);

            if (!snap.empty) {
                const validDocs = snap.docs.map(d => d.data()).filter(d => d.date && d.date <= todayStr);
                const doc = validDocs.find(d => d.date === todayStr) || validDocs[0];
                if (!doc) throw new Error("No valid reflection found for today or past dates.");
                
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
                        let label = 'Otwórz odnośnik';
                        if (url.includes('chat.whatsapp.com')) {
                            label = 'Wejdź do zespołu ludzi z pasją! (Grupa WhatsApp)';
                        } else if (url.includes('play.google.com')) {
                            label = 'Pobierz bezpłatne aplikacje w Google Play';
                        } else if (url.includes('polskieradio.cc')) {
                            label = 'Polskie Radio Christian Culture';
                        } else if (url.includes('cclite.pl')) {
                            label = 'Telewizja CC Lite';
                        } else {
                            try {
                                const urlObj = new URL(href);
                                label = urlObj.hostname;
                            } catch (e) {
                                label = 'Otwórz odnośnik';
                            }
                        }
                        return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color: #facc15; text-decoration: underline; font-weight: bold;">${label}</a>`;
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
            const defaultTitle = "☀️ Lato z Jezusem — Wielkie Pytania";
            const defaultDate = "22 sierpnia 2026";
            const rawContent = `☀️ Lato z Jezusem — Wielkie Pytania
Dzień 22 — 31 bardzo osobistych pytań Syna/Córki do Ojca: Dlaczego tak łatwo ulegam lękowi przed odrzuceniem moich granic?

W dwudziestym drugim dniu cyklu „Lato z Jezusem — Wielkie Pytania” rozbrajamy pułapkę toksycznej uległości oraz nieumiejętności wyznaczania zdrowych, dojrzałych granic.

W psychologii relacyjnej zjawisko „syndromu zadowalacza ludzi” (people-pleasing syndrome) opisuje wzorzec zachowania, w którym jednostka rezygnuje z własnych granic i potrzeb ze strachu przed odrzuceniem lub konfliktem. Wróg bezwzględnie wykorzystuje tę słabość, prowadząc nas do chronicznego wypalenia. Słowo Ewangelii pokazuje nam postawę Jezusa, który potrafił usunąć się na miejsce pustynne wbrew oczekiwaniom tłumów. Chrześcijański lider najwyższej klasy dba o swoje zasoby i stawia jasne granice z nienaganną, królewską klasą, wiedząc, że nieprzemyślana uległość niszczy potencjał oddania.

Jezus mówi dziś do Ciebie:
„On jednak usunie się na miejsca pustynne i modlił się.” (Łukasza 5,16)

Zadanie Taktyczne:
Zmiażdż dziś lęk przed postawieniem granicy na swoim polu bitwy. Zidentyfikuj relację lub obszar, w którym z powodu uległości pozwaliasz nadwyrężać swój czas i energię. Wyznacz zdrową, jasną granicę z pełnym spokojem i szacunkiem. Wnieś do swojego domu i środowiska standard dojrzałości, ochrony zasobów i niezachwianego autorytetu.

W Christian Culture aplikacje i portale są zawsze BEZPŁATNE.

Modlitwa Bojowa:
„Ojcze, odrzucam kłamstwa nieprzyjaciela i lęk przed odrzuceniem z powodu stawiania granic. Przepraszam, że zaniedbywałem swoje zasoby przez źle pojętą uległość. Daj mi odwagę, rygor i wyrazisty charakter, bym z nienaganną klasą i mądrością zarządzał moim czasem i energią, zdobywając ten świat dla Twojej chwały.”

Baza i wzrost: https://chat.whatsapp.com/DBTRDxQWamZDWaOkjupSt0 – Wejdź do zespołu ludzi z pasją!

PODAJ DALEJ 🔴
www.polskieradio.cc | www.cclite.pl
Apps: https://play.google.com/store/apps/dev?id=5215448773598149938`;

            window.currentDzjTitle = defaultTitle;
            window.currentDzjText = rawContent;

            let formattedContent = rawContent
                .replace(/((?:https?:\/\/|www\.)[^\s\n<]+)/g, (url) => {
                    const href = url.startsWith('http') ? url : 'https://' + url;
                    let label = 'Otwórz odnośnik';
                    if (url.includes('chat.whatsapp.com')) {
                        label = 'Wejdź do zespołu ludzi z pasją! (Grupa WhatsApp)';
                    } else if (url.includes('play.google.com')) {
                        label = 'Pobierz bezpłatne aplikacje w Google Play';
                    } else if (url.includes('polskieradio.cc')) {
                        label = 'Polskie Radio Christian Culture';
                    } else if (url.includes('cclite.pl')) {
                        label = 'Telewizja CC Lite';
                    } else {
                        try {
                            const urlObj = new URL(href);
                            label = urlObj.hostname;
                        } catch (e) {
                            label = 'Otwórz odnośnik';
                        }
                    }
                    return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color: #facc15; text-decoration: underline; font-weight: bold;">${label}</a>`;
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
