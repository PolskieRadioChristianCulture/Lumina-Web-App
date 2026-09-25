const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'projektant.html');
let content = fs.readFileSync(filePath, { encoding: 'utf8' });

// ── 1. PODMIANA STEP-PANE-10 NA KARTĘ PROJEKTU YIS DESIGN STUDIO ──────────────

const oldStepPane10 = `        <!-- STEP 10 (Krok 11): Kumulacja, Wycena i Realizacja -->
        <div id="step-pane-10" class="step-pane hidden">
          <div class="py-2 max-w-xl mx-auto">
            <div class="text-center mb-5">
              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 text-gold text-[10px] font-extrabold uppercase tracking-wider mb-2">
                <i class="fa-solid fa-check-double"></i> GOTOWY PROJEKT
              </div>
              <h2 class="text-lg sm:text-xl font-bold text-gold tracking-wide uppercase">KUMULACJA I REALIZACJA</h2>
              <p class="text-xs text-gray-400 mt-1">Weryfikacja techniczna grafika i kosztorys przed drukiem</p>
            </div>

            <!-- WARNING CHECKBOX FOR LOW DPI (Etap 3 Truthful UI) -->
            <div id="summary-low-dpi-warning" class="hidden bg-rose-950/40 border-2 border-rose-500/50 rounded-2xl p-4 sm:p-5 mb-5 shadow-xl">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center text-lg flex-shrink-0 mt-0.5">
                  <i class="fa-solid fa-triangle-exclamation"></i>
                </div>
                <div class="flex-1 text-xs text-gray-200">
                  <div class="flex items-center gap-2 mb-1">
                    <strong class="text-sm font-bold text-rose-300">Wykryto Niską Rozdzielczość Grafiki</strong>
                    <span id="summary-low-dpi-tag" class="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500 text-white uppercase">&lt; 150 DPI</span>
                  </div>
                  <p class="text-gray-300 leading-relaxed mb-3">
                    Twoja grafika przy wybranym rozmiarze nadruku ma mniej niż 150 DPI. W gotowym druku drobne detale mogą być nieostre. Możesz zmniejszyć rozmiar grafiki na makiecie w Kroku 8 lub przekazać plik do bezpłatnej weryfikacji przez grafika YIS.
                  </p>
                  <label class="flex items-start gap-2.5 cursor-pointer bg-black/40 p-3 rounded-xl border border-rose-500/30 hover:border-rose-400 transition-colors">
                    <input type="checkbox" id="ack-low-dpi-checkbox" class="accent-rose-500 w-4 h-4 mt-0.5 cursor-pointer flex-shrink-0" />
                    <span class="text-xs text-gray-200 leading-tight">
                      Świadomie przekazuję grafikę o niższej rozdzielczości — proszę grafika YIS o bezpłatną weryfikację i pomoc techniczną przed drukiem.
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Dedicated Verification Notice Box -->
            <div class="bg-gradient-to-r from-gold/15 via-black/50 to-gold/10 border border-gold/40 rounded-2xl p-4 sm:p-5 mb-5 shadow-lg">
              <div class="flex items-start gap-3.5">
                <div class="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center text-gold text-lg flex-shrink-0">
                  <i class="fa-solid fa-paper-plane"></i>
                </div>
                <div class="text-xs text-gray-200 leading-relaxed">
                  <div class="flex items-center gap-2 mb-1">
                    <strong class="text-sm font-bold text-white">Bezpłatna Weryfikacja i Wycena Projektu</strong>
                    <span class="px-2 py-0.5 rounded text-[10px] font-black bg-gold text-black uppercase">Standard YIS</span>
                  </div>
                  Twój kompletny projekt trafia bezpośrednio do studia Your Imagination Studio na adres:
                  <a href="mailto:yourimaginationstudio@gmail.com" class="text-gold font-extrabold underline">yourimaginationstudio@gmail.com</a>.
                  Grafik zweryfikuje format, rozdzielczość i przygotuje finalną wizualizację do Twojej akceptacji przed płatnością i produkcją.
                </div>
              </div>
            </div>

            <!-- Receipt Breakdown Card -->
            <div class="bg-black/50 border border-white/15 rounded-2xl p-5 mb-5 shadow-inner">
              <div class="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                <div>
                  <span class="text-xs font-bold uppercase tracking-wider text-gray-300">Szacowana Wycena</span>
                  <div class="text-[10px] text-gray-400 mt-0.5">Orientacyjny kosztorys przed drukiem</div>
                </div>
                <span id="summary-total-price" class="text-2xl font-black text-gold">~0,00 zł</span>
              </div>

              <div class="space-y-2 text-xs text-gray-300">
                <div class="flex justify-between">
                  <span id="sum-product-line">• Baza (Koszulka) x 1:</span>
                  <span id="sum-product-val" class="font-bold text-white">0 zł</span>
                </div>
                <div class="flex justify-between">
                  <span id="sum-print-line">• Nadruk (Przód) x 1:</span>
                  <span id="sum-print-val" class="font-bold text-white">0 zł</span>
                </div>
                <div id="sum-design-row" class="flex justify-between text-gold">
                  <span id="sum-design-line">• Pakiet projektowy YIS:</span>
                  <span id="sum-design-val" class="font-bold">1 koncepcja (GRATIS)</span>
                </div>
                <div class="flex justify-between">
                  <span id="sum-shipping-line">• Wysyłka (Paczkomat InPost):</span>
                  <span id="sum-shipping-val" class="font-bold text-white">17 zł</span>
                </div>
              </div>

              <!-- Quick Recap Specs -->
              <div class="mt-4 pt-3 border-t border-white/10 text-[11px] text-gray-400 space-y-1">
                <div><strong class="text-gray-200">Kolor i Rozmiar:</strong> <span id="sum-color-size">36 (Czarny) | M</span></div>
                <div><strong class="text-gray-200">Format nadruku:</strong> <span id="sum-format">Średni (~80mm)</span></div>
                <div id="sum-text-row"><strong class="text-gray-200">Tekst:</strong> <span id="sum-text">„Dobrze, że jesteś”</span></div>
                <div><strong class="text-gray-200">Zamawiający:</strong> <span id="sum-customer">Jan Kowalski, tel. +48...</span></div>
                <div id="sum-membership-row" class="text-gold font-bold"><i class="fa-solid fa-certificate text-[10px]"></i> <span id="sum-membership">Zalogowany Użytkownik LUMINA</span></div>
              </div>

              <!-- Honest Truthful UI Pricing Notice -->
              <div class="mt-3 pt-2.5 border-t border-white/5 text-[10px] text-gray-400 leading-tight">
                * Ostateczna cena oraz termin realizacji zostaną potwierdzone po bezpłatnej weryfikacji technicznej projektu przez studio YIS.
              </div>
            </div>

            <!-- Notice on attachments -->
            <div class="bg-white/5 border border-white/10 rounded-xl p-3.5 mb-5 flex items-start gap-2.5 text-xs text-gray-300">
              <i class="fa-solid fa-paperclip text-gold mt-0.5"></i>
              <span>
                <strong>Pamiętaj:</strong> Jeśli posiadasz plik graficzny (logo/grafikę w pełnej rozdzielczości), dołącz go jako załącznik do tworzonej wiadomości e-mail do <strong>yourimaginationstudio@gmail.com</strong>.
              </span>
            </div>

            <!-- Action Buttons for Verification & Submission -->
            <div class="space-y-3">
              <button type="button" onclick="submitProjectForVerification('email')" class="w-full py-4 px-4 rounded-xl bg-gold hover:bg-gold-hover text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-gold/25 transition-all transform hover:scale-[1.01]">
                <i class="fa-solid fa-envelope-circle-check text-base"></i>
                <span>WYŚLIJ SPECYFIKACJĘ DO BEZPŁATNEJ WERYFIKACJI (E-MAIL)</span>
              </button>

              <button type="button" onclick="copyProjectSpecification()" id="copy-spec-btn" class="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white/15 transition-all">
                <i class="fa-regular fa-copy text-gold"></i>
                <span id="copy-spec-text">SKOPIUJ SPECYFIKACJĘ DO SCHOWKA</span>
              </button>

              <button type="button" onclick="submitProjectForVerification('whatsapp')" class="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all">
                <i class="fa-brands fa-whatsapp text-base"></i>
                <span>OTWÓRZ KONSULTACJĘ YIS NA WHATSAPP</span>
              </button>
            </div>
          </div>
        </div>`;

const newStepPane10 = `        <!-- STEP 10 (Krok 11): Kumulacja, Karta Projektu i Realizacja (Etap 4) -->
        <div id="step-pane-10" class="step-pane hidden">
          <div class="py-2 max-w-xl mx-auto space-y-5">
            <!-- Header Karty -->
            <div class="text-center">
              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 text-gold text-[10px] font-extrabold uppercase tracking-wider mb-2">
                <i class="fa-solid fa-file-shield"></i> DOKUMENT SPECYFIKACJI TECHNICZNEJ
              </div>
              <h2 class="text-lg sm:text-xl font-bold text-gold tracking-wide uppercase">KARTA PROJEKTU YIS DESIGN STUDIO</h2>
              <p class="text-xs text-gray-400 mt-1">Zestawienie technologiczne przed drukiem i bezpłatną weryfikacją</p>
            </div>

            <!-- WARNING CHECKBOX FOR LOW DPI (Etap 3 Truthful UI) -->
            <div id="summary-low-dpi-warning" class="hidden bg-rose-950/40 border-2 border-rose-500/50 rounded-2xl p-4 sm:p-5 shadow-xl">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center text-lg flex-shrink-0 mt-0.5">
                  <i class="fa-solid fa-triangle-exclamation"></i>
                </div>
                <div class="flex-1 text-xs text-gray-200">
                  <div class="flex items-center gap-2 mb-1">
                    <strong class="text-sm font-bold text-rose-300">Wykryto Niską Rozdzielczość Grafiki</strong>
                    <span id="summary-low-dpi-tag" class="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500 text-white uppercase">&lt; 150 DPI</span>
                  </div>
                  <p class="text-gray-300 leading-relaxed mb-3">
                    Twoja grafika przy wybranym rozmiarze nadruku ma mniej niż 150 DPI. W gotowym druku drobne detale mogą być nieostre. Możesz zmniejszyć rozmiar grafiki na makiecie w Kroku 8 lub przekazać plik do bezpłatnej weryfikacji przez grafika YIS.
                  </p>
                  <label class="flex items-start gap-2.5 cursor-pointer bg-black/40 p-3 rounded-xl border border-rose-500/30 hover:border-rose-400 transition-colors">
                    <input type="checkbox" id="ack-low-dpi-checkbox" class="accent-rose-500 w-4 h-4 mt-0.5 cursor-pointer flex-shrink-0" />
                    <span class="text-xs text-gray-200 leading-tight">
                      Świadomie przekazuję grafikę o niższej rozdzielczości — proszę grafika YIS o bezpłatną weryfikację i pomoc techniczną przed drukiem.
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <!-- GŁÓWNA KARTA PROJEKTU (KARTA SPECYFIKACJI YIS DESIGN STUDIO) -->
            <div class="bg-black/60 border border-gold/40 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
              <div class="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl pointer-events-none"></div>

              <!-- Belka Identyfikacyjna Projektu -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4">
                <div>
                  <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Numer Projektu:</div>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span id="card-project-id" class="font-mono text-base sm:text-lg font-black text-gold tracking-wider">YIS-2026-XXXXX</span>
                    <button type="button" onclick="copyFriendlyId()" title="Skopiuj numer projektu" class="text-gray-400 hover:text-gold transition-colors text-xs p-1">
                      <i class="fa-regular fa-copy"></i>
                    </button>
                  </div>
                </div>

                <div class="flex items-center gap-2 flex-wrap">
                  <span id="card-project-revision" class="px-2.5 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-[10px] font-extrabold uppercase tracking-wide">
                    Rewizja v1
                  </span>
                  <span id="card-project-status" class="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-extrabold uppercase tracking-wide">
                    DO WERYFIKACJI
                  </span>
                </div>
              </div>

              <!-- Prawdziwy Wskaźnik Synchronizacji (Truthful UI) -->
              <div id="card-sync-indicator" class="mb-4 py-2 px-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-[11px] text-gray-300">
                <div class="flex items-center gap-2">
                  <i id="card-sync-icon" class="fa-solid fa-hard-drive text-gold"></i>
                  <span id="card-sync-text">Projekt zapisany na tym urządzeniu (tryb gościa)</span>
                </div>
                <span id="card-sync-time" class="text-[10px] text-gray-500 font-mono">przed chwilą</span>
              </div>

              <!-- Miniatury Makiet: Przód i Tył -->
              <div class="grid grid-cols-2 gap-3 mb-5">
                <div class="bg-black/40 border border-white/10 rounded-2xl p-2.5 flex flex-col items-center">
                  <span class="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Widok Przód</span>
                  <div id="card-preview-front" class="w-full h-36 flex items-center justify-center overflow-hidden">
                    <!-- SVG Przód -->
                  </div>
                </div>

                <div class="bg-black/40 border border-white/10 rounded-2xl p-2.5 flex flex-col items-center">
                  <span class="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Widok Tył</span>
                  <div id="card-preview-back" class="w-full h-36 flex items-center justify-center overflow-hidden">
                    <!-- SVG Tył -->
                  </div>
                </div>
              </div>

              <!-- Specyfikacja Techniczna i Nadruk -->
              <div class="space-y-2 text-xs border-t border-white/10 pt-4 mb-4">
                <div class="flex items-start justify-between gap-2">
                  <span class="text-gray-400">Produkt bazowy:</span>
                  <span id="card-prod-title" class="font-bold text-white text-right">Koszulka • 36 (Czarny) • Rozmiar M</span>
                </div>
                <div class="flex items-start justify-between gap-2">
                  <span class="text-gray-400">Nakład produkcyjny:</span>
                  <span id="card-prod-qty" class="font-bold text-white text-right">1 szt.</span>
                </div>
                <div class="flex items-start justify-between gap-2">
                  <span class="text-gray-400">Umiejscowienie nadruku:</span>
                  <span id="card-prod-placement" class="font-bold text-gold text-right">Przód (Standard)</span>
                </div>
                <div class="flex items-start justify-between gap-2">
                  <span class="text-gray-400">Technologia znakowania:</span>
                  <span id="card-prod-tech" class="font-semibold text-gray-200 text-right">DTF / Sitodruk Premium</span>
                </div>
                <div class="flex items-start justify-between gap-2">
                  <span class="text-gray-400">Wymiary strefy druku:</span>
                  <span id="card-prod-dims" class="font-semibold text-gray-200 text-right">Ok. 24 × 30 cm</span>
                </div>
                <div id="card-prod-text-row" class="flex items-start justify-between gap-2">
                  <span class="text-gray-400">Personalizacja tekstem:</span>
                  <span id="card-prod-text" class="font-medium text-gray-200 italic text-right">„Tekst”</span>
                </div>
              </div>

              <!-- Raport Jakości Pliku (Print Quality Engine) -->
              <div class="bg-white/5 border border-white/10 rounded-2xl p-3.5 mb-4 text-xs space-y-1.5">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <i class="fa-solid fa-gauge-high text-gold"></i> Raport Jakości Grafiki (PQE):
                  </span>
                  <span id="card-pq-tier-badge" class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400">
                    300 DPI
                  </span>
                </div>
                <div class="flex justify-between text-gray-300">
                  <span class="text-gray-400">Rozdzielczość pliku:</span>
                  <span id="card-pq-px" class="font-mono">1200 × 1200 px</span>
                </div>
                <div class="flex justify-between text-gray-300">
                  <span class="text-gray-400">Efektywne DPI przy druku:</span>
                  <span id="card-pq-dpi" class="font-bold text-white">300 DPI (Bardzo dobra jakość)</span>
                </div>
                <div class="flex justify-between text-gray-300">
                  <span class="text-gray-400">Przezroczystość (kanał alfa):</span>
                  <span id="card-pq-alpha">Wykryto przezroczystość (PNG)</span>
                </div>
              </div>

              <!-- Pakiet Projektowy YIS -->
              <div class="flex items-center justify-between p-3 rounded-2xl bg-gold/10 border border-gold/30 text-xs mb-4">
                <div class="flex items-center gap-2">
                  <i class="fa-solid fa-compass-drafting text-gold text-sm"></i>
                  <div>
                    <span class="font-bold text-white block">Pakiet Projektowy YIS:</span>
                    <span id="card-pkg-name" class="text-gold font-bold">1 koncepcja (GRATIS)</span>
                  </div>
                </div>
                <span id="card-pkg-cost" class="font-extrabold text-gold text-sm">0 zł</span>
              </div>

              <!-- Szacunkowy Kosztorys Zlecenia -->
              <div class="border-t border-white/10 pt-4 mb-4">
                <div class="flex items-center justify-between mb-3">
                  <div>
                    <span class="text-xs font-bold uppercase tracking-wider text-gray-300">Szacowana Wycena</span>
                    <div class="text-[10px] text-gray-400">Orientacyjny kosztorys przed produkcją</div>
                  </div>
                  <span id="card-total-price" class="text-2xl font-black text-gold">~0,00 zł</span>
                </div>

                <div class="space-y-1.5 text-xs text-gray-300">
                  <div class="flex justify-between">
                    <span id="card-sum-product-line">• Baza (Koszulka) x 1:</span>
                    <span id="card-sum-product-val" class="font-bold text-white">0 zł</span>
                  </div>
                  <div class="flex justify-between">
                    <span id="card-sum-print-line">• Nadruk (Przód) x 1:</span>
                    <span id="card-sum-print-val" class="font-bold text-white">0 zł</span>
                  </div>
                  <div class="flex justify-between text-gold">
                    <span>• Pakiet projektowy YIS:</span>
                    <span id="card-sum-pkg-val" class="font-bold">0 zł</span>
                  </div>
                  <div class="flex justify-between">
                    <span id="card-sum-shipping-line">• Wysyłka (Paczkomat InPost):</span>
                    <span id="card-sum-shipping-val" class="font-bold text-white">17 zł</span>
                  </div>
                </div>
              </div>

              <!-- Dane Zamawiającego i Dostawy -->
              <div class="border-t border-white/10 pt-3 text-[11px] text-gray-400 space-y-1">
                <div><strong class="text-gray-200">Zamawiający:</strong> <span id="card-cust-name">Jan Kowalski</span></div>
                <div><strong class="text-gray-200">Kontakt:</strong> <span id="card-cust-contact">jan@example.com | tel. +48...</span></div>
                <div><strong class="text-gray-200">Adres / Paczkomat:</strong> <span id="card-cust-address">Paczkomat WAW01M</span></div>
                <div id="card-membership-row" class="text-gold font-bold"><i class="fa-solid fa-certificate text-[10px]"></i> <span id="card-membership">Zalogowany Użytkownik LUMINA</span></div>
              </div>

              <!-- Obowiązkowe Klauzule Truthful UI -->
              <div class="mt-4 pt-3 border-t border-white/5 space-y-1 text-[10px] text-gray-400 leading-tight">
                <p>
                  * <strong>Charakter dokumentu:</strong> Karta Projektu stanowi dokument techniczno-ofertowy specyfikacji zlecenia YIS Design Studio. Nie jest rachunkiem ani fakturą fiskalną.
                </p>
                <p>
                  * Ostateczna cena oraz termin realizacji zostaną potwierdzone po bezpłatnej weryfikacji technicznej projektu przez studio YIS.
                </p>
              </div>
            </div>

            <!-- Notice on attachments -->
            <div class="bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-gray-300">
              <i class="fa-solid fa-paperclip text-gold mt-0.5"></i>
              <span>
                <strong>Pamiętaj:</strong> Jeśli posiadasz plik graficzny (logo/grafikę w pełnej rozdzielczości), dołącz go jako załącznik do tworzonej wiadomości e-mail do <strong>yourimaginationstudio@gmail.com</strong>.
              </span>
            </div>

            <!-- Action Buttons for Verification & Submission (Truthful UI) -->
            <div class="space-y-3">
              <button type="button" onclick="submitProjectForVerification('email')" class="w-full py-4 px-4 rounded-xl bg-gold hover:bg-gold-hover text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-gold/25 transition-all transform hover:scale-[1.01]">
                <i class="fa-solid fa-envelope-circle-check text-base"></i>
                <span>WYŚLIJ SPECYFIKACJĘ DO BEZPŁATNEJ WERYFIKACJI (E-MAIL)</span>
              </button>

              <button type="button" onclick="copyProjectSpecification()" id="copy-spec-btn" class="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white/15 transition-all">
                <i class="fa-regular fa-copy text-gold"></i>
                <span id="copy-spec-text">SKOPIUJ SPECYFIKACJĘ DO SCHOWKA</span>
              </button>

              <button type="button" onclick="submitProjectForVerification('whatsapp')" class="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all">
                <i class="fa-brands fa-whatsapp text-base"></i>
                <span>OTWÓRZ KONSULTACJĘ YIS NA WHATSAPP</span>
              </button>
            </div>
          </div>
        </div>`;

if (content.includes(oldStepPane10)) {
  content = content.replace(oldStepPane10, newStepPane10);
  console.log('✅ Zastąpiono step-pane-10 nową Kartą Projektu YIS');
} else {
  console.error('❌ Nie znaleziono starego bloku step-pane-10!');
  process.exit(1);
}

// ── 2. AKTUALIZACJA LOGIKI JS: updateSummaryRecap, submitProjectForVerification, copyFriendlyId, renderCardMockupSvg ──

// Zastąpmy updateSummaryRecap() nową implementacją zasilającą Kartę Projektu
const oldUpdateSummary = `    function updateSummaryRecap() {
      const { total, itemBase, printTotal, designFee, singlePrintCost, shipping } = updatePricing();
      
      document.getElementById('sum-product-line').textContent = \`• Baza (\${state.selectedProductType || 'Koszulka'}) x \${state.quantity}:\`;
      document.getElementById('sum-product-val').textContent = \`\${itemBase} zł\`;

      const placementDesc = state.selectedPrintPlacement === 'Oba' ? ' (Przód + Tył)' : (state.selectedPrintPlacement !== 'N/D' ? \` (\${state.selectedPrintPlacement})\` : '');
      document.getElementById('sum-print-line').textContent = \`• Nadruk [\${singlePrintCost} zł/szt.] x \${state.quantity}\${placementDesc}:\`;
      document.getElementById('sum-print-val').textContent = \`\${printTotal} zł\`;

      // Pakiet projektowy YIS
      const pkgLabel = (window.YisPricing && window.YisPricing.formatPackageLabel)
        ? window.YisPricing.formatPackageLabel(state.designPackage || 1)
        : (state.designPackage === 1 ? '1 koncepcja (GRATIS)' : (state.designPackage === 2 ? '2 koncepcje (+30 zł)' : '3 koncepcje (+50 zł)'));

      const designRow = document.getElementById('sum-design-row');
      if (designRow) {
        designRow.classList.remove('hidden');
        designRow.classList.add('flex');
        const designVal = document.getElementById('sum-design-val');
        if (designVal) designVal.textContent = pkgLabel;
      }

      document.getElementById('sum-shipping-line').textContent = \`• Wysyłka (\${state.selectedShippingMethod}):\`;
      document.getElementById('sum-shipping-val').textContent = \`\${shipping} zł\`;

      document.getElementById('sum-color-size').textContent = \`\${state.selectedColor} | \${state.selectedSize}\`;
      document.getElementById('sum-format').textContent = \`\${state.selectedFormat} \${placementDesc}\`;

      const textRow = document.getElementById('sum-text-row');
      if (state.personalizedText.trim()) {
        textRow.classList.remove('hidden');
        document.getElementById('sum-text').textContent = \`„\${state.personalizedText.trim()}”\`;
      } else {
        textRow.classList.add('hidden');
      }

      const custName = \`\${state.firstName} \${state.lastName}\`.trim() || '(nie podano)';
      const custPhone = state.phoneNumber.trim() || '';
      const custEmail = state.email.trim() || '';
      document.getElementById('sum-customer').textContent = \`\${custName}\${custPhone ? ', tel. ' + custPhone : ''}\${custEmail ? ', ' + custEmail : ''}\`;

      const memRow = document.getElementById('sum-membership-row');
      if (memRow) {
        if (state.isLuminaMember) {
          memRow.classList.remove('hidden');
        } else {
          memRow.classList.add('hidden');
        }
      }
    }`;

const newUpdateSummary = `    function copyFriendlyId() {
      if (!state.activeProject || !state.activeProject.projectId) return;
      const id = state.activeProject.projectId;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(id).then(() => {
          alert('Skopiowano numer projektu: ' + id);
        }).catch(() => {});
      }
    }

    function renderCardMockupSvg(side) {
      const isLightBg = ['#FFFFFF', '#C0C0C0', '#FBDF0A', '#88C9EE'].includes(state.selectedColorHex);
      const strokeColor = isLightBg ? '#333333' : '#666666';
      const bodyColor = state.selectedColorHex || '#1A1A1A';

      let printWidth = 44;
      let printHeight = 44;
      let printY = 37;
      let printLeft = 'calc(50% - 22px)';

      let showPrint = true;
      if (state.selectedProductType === 'Koszulka' || state.selectedProductType === 'Bluza') {
        if (state.selectedPrintPlacement === 'Przód' && side === 'back') showPrint = false;
        else if (state.selectedPrintPlacement === 'Tył' && side === 'front') showPrint = false;
      }

      let svg = '';
      if (state.selectedProductType === 'Koszulka') {
        const isBack = side === 'back';
        svg = \`<svg viewBox="0 0 240 280" class="w-full h-full drop-shadow" xmlns="http://www.w3.org/2000/svg">
          <path d="M 80 30 Q 120 \${isBack ? 38 : 50} 160 30 L 215 70 L 185 110 L 165 95 L 165 240 L 75 240 L 75 95 L 55 110 L 25 70 Z" fill="\${bodyColor}" stroke="\${strokeColor}" stroke-width="2.5" stroke-linejoin="round"/>
          <path d="M 80 30 Q 120 \${isBack ? 42 : 55} 160 30" fill="none" stroke="\${strokeColor}" stroke-width="2"/>
        </svg>\`;
      } else if (state.selectedProductType === 'Bluza') {
        const isBack = side === 'back';
        svg = \`<svg viewBox="0 0 240 280" class="w-full h-full drop-shadow" xmlns="http://www.w3.org/2000/svg">
          <path d="M 85 45 C 70 20 170 20 155 45 Z" fill="\${bodyColor}" stroke="\${strokeColor}" stroke-width="2"/>
          <path d="M 85 45 L 60 50 L 20 100 L 45 125 L 70 105 L 70 245 L 170 245 L 170 105 L 195 125 L 220 100 L 180 50 L 155 45 Z" fill="\${bodyColor}" stroke="\${strokeColor}" stroke-width="2.5" stroke-linejoin="round"/>
        </svg>\`;
      } else if (state.selectedProductType === 'Kubek') {
        svg = \`<svg viewBox="0 0 240 240" class="w-full h-full drop-shadow" xmlns="http://www.w3.org/2000/svg">
          <path d="M 160 80 C 205 80 205 160 160 160" fill="none" stroke="\${bodyColor}" stroke-width="16" stroke-linecap="round"/>
          <path d="M 160 80 C 205 80 205 160 160 160" fill="none" stroke="\${strokeColor}" stroke-width="2" stroke-linecap="round"/>
          <rect x="65" y="60" width="100" height="120" rx="8" fill="\${bodyColor}" stroke="\${strokeColor}" stroke-width="2.5"/>
          <ellipse cx="115" cy="60" rx="50" ry="10" fill="\${bodyColor}" stroke="\${strokeColor}" stroke-width="2"/>
        </svg>\`;
      } else {
        svg = \`<svg viewBox="0 0 240 240" class="w-full h-full drop-shadow" xmlns="http://www.w3.org/2000/svg">
          <path d="M 45 155 Q 120 185 205 145 Q 160 135 145 135 Z" fill="\${bodyColor}" stroke="\${strokeColor}" stroke-width="2.5" stroke-linejoin="round"/>
          <path d="M 65 145 C 65 80 175 80 175 145 Z" fill="\${bodyColor}" stroke="\${strokeColor}" stroke-width="2.5"/>
          <circle cx="120" cy="85" r="4" fill="#C4A35A" stroke="\${strokeColor}" stroke-width="1"/>
        </svg>\`;
      }

      let overlay = '';
      if (showPrint && state.uploadedImageBase64) {
        let filter = '';
        if (state.uploadedImageBase64 === PRESET_SAMPLE_GRAPHIC || (typeof state.uploadedImageBase64 === 'string' && state.uploadedImageBase64.includes('jezus_jest_droga'))) {
          filter = !isLightBg ? 'filter: brightness(0) invert(1);' : '';
        }
        overlay = \`<div class="absolute pointer-events-none flex items-center justify-center" style="top: 36px; width: 44px; height: 44px; left: calc(50% - 22px);">
          <img src="\${state.uploadedImageBase64}" class="w-full h-full object-contain" style="\${filter}" alt="preview">
        </div>\`;
      }

      return \`<div class="relative w-28 h-28 flex items-center justify-center">\${svg}\${overlay}</div>\`;
    }

    function updateSummaryRecap() {
      // 1. Zbuduj lub zaktualizuj kanoniczny obiekt YIS Project (Schema v2)
      if (window.YisProjectStore && window.YisProjectStore.createCanonicalProject) {
        state.activeProject = window.YisProjectStore.createCanonicalProject(state, state.activeProject);
      }

      const p = state.activeProject || {};
      const { total, itemBase, printTotal, designFee, singlePrintCost, shipping } = updatePricing();

      // Belka Identyfikacyjna Karty
      const cardIdElem = document.getElementById('card-project-id');
      if (cardIdElem) cardIdElem.textContent = p.projectId || 'YIS-2026-XXXXX';
      const cardRevElem = document.getElementById('card-project-revision');
      if (cardRevElem) cardRevElem.textContent = \`Rewizja v\${p.revision || 1}\`;
      const cardStatusElem = document.getElementById('card-project-status');
      if (cardStatusElem) cardStatusElem.textContent = p.status || 'DO WERYFIKACJI';

      // Miniatury Przód / Tył
      const prevFront = document.getElementById('card-preview-front');
      const prevBack = document.getElementById('card-preview-back');
      if (prevFront) prevFront.innerHTML = renderCardMockupSvg('front');
      if (prevBack) prevBack.innerHTML = renderCardMockupSvg('back');

      // Specyfikacja Produktu
      const prodTitleElem = document.getElementById('card-prod-title');
      if (prodTitleElem) prodTitleElem.textContent = \`\${state.selectedProductType || 'Koszulka'} • \${state.selectedColor} • Rozmiar \${state.selectedSize}\`;
      const prodQtyElem = document.getElementById('card-prod-qty');
      if (prodQtyElem) prodQtyElem.textContent = \`\${state.quantity || 1} szt.\`;
      const placementDesc = state.selectedPrintPlacement === 'Oba' ? ' (Przód + Tył)' : (state.selectedPrintPlacement !== 'N/D' ? \` (\${state.selectedPrintPlacement})\` : '');
      const prodPlacementElem = document.getElementById('card-prod-placement');
      if (prodPlacementElem) prodPlacementElem.textContent = \`\${state.selectedPrintPlacement || 'Przód'}\${placementDesc}\`;
      const prodTechElem = document.getElementById('card-prod-tech');
      if (prodTechElem) prodTechElem.textContent = (state.selectedProductType === 'Kubek' || state.selectedProductType === 'Czapka') ? 'Termotransfer / Sitodruk' : 'DTF / Sitodruk Premium';
      const prodDimsElem = document.getElementById('card-prod-dims');
      if (prodDimsElem) prodDimsElem.textContent = state.imageQualityReport?.printDimensions || 'Ok. 24 × 30 cm';

      const prodTextRow = document.getElementById('card-prod-text-row');
      const prodTextElem = document.getElementById('card-prod-text');
      if (state.personalizedText.trim()) {
        if (prodTextRow) prodTextRow.classList.remove('hidden');
        if (prodTextElem) prodTextElem.textContent = \`„\${state.personalizedText.trim()}”\`;
      } else {
        if (prodTextRow) prodTextRow.classList.add('hidden');
      }

      // Raport Print Quality Engine
      const rep = state.imageQualityReport || {};
      const img = state.imageAnalysis || {};
      const pqBadge = document.getElementById('card-pq-tier-badge');
      if (pqBadge) {
        const dpiVal = rep.dpi || (state.graphicMode === 'preset' ? 300 : null);
        pqBadge.textContent = dpiVal ? \`\${dpiVal} DPI\` : 'Standard';
        if (dpiVal && dpiVal >= 250) {
          pqBadge.className = 'px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400';
        } else if (dpiVal && dpiVal >= 150) {
          pqBadge.className = 'px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300';
        } else {
          pqBadge.className = 'px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-500/20 text-rose-300';
        }
      }
      const pqPxElem = document.getElementById('card-pq-px');
      if (pqPxElem) pqPxElem.textContent = img.width && img.height ? \`\${img.width} × \${img.height} px (\${img.fileSizeFormatted || ''})\` : (state.graphicMode === 'preset' ? 'Wektor YIS (300 DPI)' : 'Brak pliku');
      const pqDpiElem = document.getElementById('card-pq-dpi');
      if (pqDpiElem) pqDpiElem.textContent = rep.title ? \`\${rep.dpi} DPI (\${rep.title})\` : (state.graphicMode === 'preset' ? '300 DPI (Wzorcowa autorska grafika YIS)' : 'Brak danych');
      const pqAlphaElem = document.getElementById('card-pq-alpha');
      if (pqAlphaElem) {
        if (img.hasTransparency) pqAlphaElem.textContent = 'Wykryto przezroczystość (kanał alfa)';
        else if (state.graphicMode === 'preset') pqAlphaElem.textContent = 'Autorska przezroczysta typografia YIS';
        else pqAlphaElem.textContent = 'Grafika z jednolitym tłem (brak alfa)';
      }

      // Pakiet Projektowy
      const pkgLabel = (window.YisPricing && window.YisPricing.formatPackageLabel)
        ? window.YisPricing.formatPackageLabel(state.designPackage || 1)
        : (state.designPackage === 1 ? '1 koncepcja (GRATIS)' : (state.designPackage === 2 ? '2 koncepcje (+30 zł)' : '3 koncepcje (+50 zł)'));
      const pkgCost = state.designPackage === 2 ? '30 zł' : (state.designPackage === 3 ? '50 zł' : '0 zł');
      const cardPkgName = document.getElementById('card-pkg-name');
      if (cardPkgName) cardPkgName.textContent = pkgLabel;
      const cardPkgCost = document.getElementById('card-pkg-cost');
      if (cardPkgCost) cardPkgCost.textContent = pkgCost;

      // Szacunkowy Kosztorys
      const cardTotal = document.getElementById('card-total-price');
      if (cardTotal) cardTotal.textContent = \`~\${total.toFixed(2).replace('.', ',')} zł\`;
      const cardProdLine = document.getElementById('card-sum-product-line');
      if (cardProdLine) cardProdLine.textContent = \`• Baza (\${state.selectedProductType || 'Koszulka'}) x \${state.quantity}:\`;
      const cardProdVal = document.getElementById('card-sum-product-val');
      if (cardProdVal) cardProdVal.textContent = \`\${itemBase} zł\`;
      const cardPrintLine = document.getElementById('card-sum-print-line');
      if (cardPrintLine) cardPrintLine.textContent = \`• Nadruk [\${singlePrintCost} zł/szt.] x \${state.quantity}\${placementDesc}:\`;
      const cardPrintVal = document.getElementById('card-sum-print-val');
      if (cardPrintVal) cardPrintVal.textContent = \`\${printTotal} zł\`;
      const cardPkgVal = document.getElementById('card-sum-pkg-val');
      if (cardPkgVal) cardPkgVal.textContent = \`\${designFee} zł\`;
      const cardShipLine = document.getElementById('card-sum-shipping-line');
      if (cardShipLine) cardShipLine.textContent = \`• Wysyłka (\${state.selectedShippingMethod}):\`;
      const cardShipVal = document.getElementById('card-sum-shipping-val');
      if (cardShipVal) cardShipVal.textContent = \`\${shipping} zł\`;

      // Dane Zamawiającego
      const custName = \`\${state.firstName} \${state.lastName}\`.trim() || '(nie podano)';
      const custPhone = state.phoneNumber.trim() || '';
      const custEmail = state.email.trim() || '';
      const cardCustName = document.getElementById('card-cust-name');
      if (cardCustName) cardCustName.textContent = custName;
      const cardCustContact = document.getElementById('card-cust-contact');
      if (cardCustContact) cardCustContact.textContent = \`\${custEmail || '(brak e-mail)'}\${custPhone ? ' | tel. ' + custPhone : ''}\`;
      const cardCustAddr = document.getElementById('card-cust-address');
      if (cardCustAddr) cardCustAddr.textContent = state.address.trim() || '(brak adresu)';

      const cardMemRow = document.getElementById('card-membership-row');
      if (cardMemRow) {
        if (state.isLuminaMember) cardMemRow.classList.remove('hidden');
        else cardMemRow.classList.add('hidden');
      }

      // Synchronizacja chmurowa z Truthful UI
      if (window.YisProjectStore && window.YisProjectStore.syncToLuminaCloud) {
        window.YisProjectStore.syncToLuminaCloud(state.activeProject).then(res => {
          const syncText = document.getElementById('card-sync-text');
          const syncIcon = document.getElementById('card-sync-icon');
          if (syncText && syncIcon) {
            syncText.textContent = res.message;
            if (res.status === 'CLOUD_SYNCED') {
              syncIcon.className = 'fa-solid fa-cloud-arrow-up text-emerald-400';
            } else {
              syncIcon.className = 'fa-solid fa-hard-drive text-gold';
            }
          }
        }).catch(err => {
          console.warn('Sync attempt caught:', err);
        });
      }
    }`;

if (content.includes(oldUpdateSummary)) {
  content = content.replace(oldUpdateSummary, newUpdateSummary);
  console.log('✅ Zaktualizowano funkcję updateSummaryRecap()');
} else {
  console.error('❌ Nie znaleziono starej funkcji updateSummaryRecap()!');
  process.exit(1);
}

// ── 3. AKTUALIZACJA submitProjectForVerification ORAZ buildOrderEmailBody ─────

const oldSubmitProject = `    function submitProjectForVerification(channel) {
      // Weryfikacja akceptacji niskiego DPI (Etap 3 Truthful UI)
      const ackBox = document.getElementById('summary-low-dpi-warning');
      const ackCheck = document.getElementById('ack-low-dpi-checkbox');
      if (ackBox && !ackBox.classList.contains('hidden') && ackCheck && !ackCheck.checked) {
        alert('UWAGA DOTYCZĄCA JAKOŚCI DRUKU:\\n\\nTwoja grafika ma niską rozdzielczość (< 150 DPI). Zaznacz pole świadomej akceptacji lub zmniejsz rozmiar grafiki na makiecie, aby uzyskać lepszą ostrość.');
        ackCheck.focus();
        return;
      }
      if (channel === 'whatsapp') {
        submitOrderViaWhatsApp();
      } else {
        submitOrderViaEmail();
      }
    }`;

const newSubmitProject = `    function submitProjectForVerification(channel) {
      // 1. Walidacja danych klienta
      if (!validateForm()) return;

      // 2. Weryfikacja akceptacji niskiego DPI (Etap 3 Truthful UI)
      const ackBox = document.getElementById('summary-low-dpi-warning');
      const ackCheck = document.getElementById('ack-low-dpi-checkbox');
      if (ackBox && !ackBox.classList.contains('hidden') && ackCheck && !ackCheck.checked) {
        alert('UWAGA DOTYCZĄCA JAKOŚCI DRUKU:\\n\\nTwoja grafika ma niską rozdzielczość (< 150 DPI). Zaznacz pole świadomej akceptacji w Karcie Projektu, aby przekazać plik do weryfikacji grafika.');
        ackCheck.focus();
        return;
      }

      state.lowDpiAccepted = ackCheck ? ackCheck.checked : false;

      // 3. Utworzenie kanonicznego projektu i utrwalenie snapshotu rewizji (Etap 4)
      if (window.YisProjectStore) {
        state.activeProject = window.YisProjectStore.createCanonicalProject(state, state.activeProject);
        const snapshot = window.YisProjectStore.createRevisionSnapshot(state.activeProject, channel);
        state.lastSubmittedRevision = snapshot.revision;
      }

      if (channel === 'whatsapp') {
        submitOrderViaWhatsApp();
      } else {
        submitOrderViaEmail();
      }
    }`;

if (content.includes(oldSubmitProject)) {
  content = content.replace(oldSubmitProject, newSubmitProject);
  console.log('✅ Zaktualizowano funkcję submitProjectForVerification()');
} else {
  console.error('❌ Nie znaleziono starej funkcji submitProjectForVerification()!');
  process.exit(1);
}

// Zaktualizujmy buildOrderEmailBody() aby korzystało z YisProjectStore.buildHandoffText
const oldBuildOrderEmail = `    function buildOrderEmailBody() {
      const { total } = updatePricing();
      let graphicInfo = 'Standardowy monogram YIS / tylko treść typograficzna';
      if (state.uploadedImageBase64 === PRESET_SAMPLE_GRAPHIC || (typeof state.uploadedImageBase64 === 'string' && state.uploadedImageBase64.includes('jezus_jest_droga'))) {
        graphicInfo = 'Oficjalna autorska grafika YIS: "Jezus jest Drogą, Prawdą i Życiem" (Gratis w projekcie • Auto-kalibracja)';
      } else if (state.uploadedImageBase64) {
        graphicInfo = 'Własny plik graficzny użytkownika (dołączony w załączniku wiadomości)';
      }

      const pkgLabel = (window.YisPricing && window.YisPricing.formatPackageLabel)
        ? window.YisPricing.formatPackageLabel(state.designPackage || 1)
        : (state.designPackage === 1 ? '1 koncepcja (GRATIS — 0 zł)' : (state.designPackage === 2 ? '2 koncepcje (+30 zł)' : '3 koncepcje (+50 zł)'));

      return \`Dzień dobry,

Chciał(a)bym przekazać gotowy projekt chrześcijańskiej grafiki użytkowej do bezpłatnej weryfikacji technicznej i wyceny w Your Imagination Studio (YIS).

--- USŁUGA: BEZPŁATNA WERYFIKACJA TECHNICZNA PLIKÓW ---
• Weryfikacja parametrów druku: Zlecona (100% BEZPŁATNIE)

--- PROJEKT: CHRZEŚCIJAŃSKA GRAFIKA UŻYTKOWA ---
• Produkt bazowy: \${state.selectedProductType || 'Koszulka'}
• Kolor produktu: \${state.selectedColor}
• Rozmiar: \${state.selectedSize}
• Format nadruku: \${state.selectedFormat}
• Umiejscowienie nadruku: \${state.selectedPrintPlacement}
• Ilość sztuk: \${state.quantity}
• Wybrana grafika: \${graphicInfo}
• Spersonalizowany tekst / cytat: \${state.personalizedText.trim() ? \`"\${state.personalizedText.trim()}"\` : '(brak)'}
• Pakiet projektowy YIS: \${pkgLabel}

--- DANE KONTAKTOWE I DOSTAWA ---
• Zamawiający: \${state.firstName} \${state.lastName}
• Adres e-mail: \${state.email}
• Numer telefonu: \${state.phoneNumber}
• Adres dostawy / Paczkomat: \${state.address}
• Preferowana metoda wysyłki: \${state.selectedShippingMethod} (\${state.shippingCost} zł)
• Status w Społeczności LUMINA: \${state.isLuminaMember ? 'Zalogowany Użytkownik Społeczności LUMINA' : 'Użytkownik Gość'}

--- WSTĘPNA SZACUNKOWA KALKULACJA KOSZTÓW ---
• Szacowana kwota łączna: ~\${total} PLN
* Ostateczna cena i termin realizacji zostaną potwierdzone po bezpłatnej weryfikacji technicznej przez studio YIS.

(W załączniku przesyłam ewentualne pliki graficzne / inspiracje w wysokiej rozdzielczości do weryfikacji przez grafika).
Proszę o sprawdzenie plików pod kątem druku oraz przesłanie ostatecznego potwierdzenia na adres e-mail: \${state.email || 'nadawcy'}.

Z poważaniem,
\${state.firstName} \${state.lastName}
E-mail: \${state.email}
Tel: \${state.phoneNumber}\`;
    }`;

const newBuildOrderEmail = `    function buildOrderEmailBody() {
      if (window.YisProjectStore && window.YisProjectStore.buildHandoffText) {
        if (!state.activeProject) {
          state.activeProject = window.YisProjectStore.createCanonicalProject(state);
        }
        return window.YisProjectStore.buildHandoffText(state.activeProject);
      }
      const { total } = updatePricing();
      return \`Karta Projektu YIS Design Studio\\nProdukt: \${state.selectedProductType || 'Koszulka'}\\nSzacunkowa kwota: ~\${total} PLN\\nZamawiający: \${state.firstName} \${state.lastName}\`;
    }`;

if (content.includes(oldBuildOrderEmail)) {
  content = content.replace(oldBuildOrderEmail, newBuildOrderEmail);
  console.log('✅ Zaktualizowano funkcję buildOrderEmailBody()');
} else {
  console.error('❌ Nie znaleziono starej funkcji buildOrderEmailBody()!');
  process.exit(1);
}

// ── 4. AKTUALIZACJA renderHistory ORAZ loadRevisionToCreator ──────────────────
const oldRenderHistory = `    function renderHistory() {
      const container = document.getElementById('history-items-list');
      const emptyState = document.getElementById('history-empty-state');
      const badge = document.getElementById('history-badge');
      if (!container) return;

      try {
        const raw = localStorage.getItem('yis_orders_history') || '[]';
        const orders = JSON.parse(raw);

        if (orders.length === 0) {
          container.innerHTML = '';
          emptyState.classList.remove('hidden');
          if (badge) badge.classList.add('hidden');
          return;
        }

        emptyState.classList.add('hidden');
        if (badge) badge.classList.remove('hidden');
        container.innerHTML = '';

        orders.forEach((o, index) => {
          const card = document.createElement('div');
          card.className = 'bg-black/40 border border-white/10 hover:border-gold/30 rounded-2xl p-4 transition-all text-xs';
          card.innerHTML = \`
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="font-extrabold text-white text-sm uppercase">\${o.productType} (\${o.size})</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold \${o.status.includes('MAIL') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gold/20 text-gold'}">
                  \${o.status}
                </span>
              </div>
              <span class="text-xs font-black text-gold">~\${o.totalPrice} zł</span>
            </div>

            <div class="grid grid-cols-2 gap-2 text-gray-400 mb-2">
              <div>Kolor: <span class="text-gray-200 font-medium">\${o.color}</span></div>
              <div>Ilość: <span class="text-gray-200 font-medium">\${o.quantity} szt.</span></div>
              <div>Format: <span class="text-gray-200 font-medium">\${o.format} (\${o.placement})</span></div>
              <div>Data: <span class="text-gray-200 font-medium">\${o.date}</span></div>
            </div>

            \${o.personalizedText ? \`
              <div class="bg-white/5 p-2 rounded-lg text-gray-300 italic mb-3">
                „\${o.personalizedText}”
              </div>
            \` : ''}

            <div class="flex items-center justify-between pt-2 border-t border-white/5">
              <span class="text-gray-400 truncate max-w-[200px]">\${o.firstName} \${o.lastName}</span>
              <div class="flex items-center gap-2">
                <button type="button" onclick="loadOrderToCreator(\${index})" class="px-2.5 py-1 rounded bg-white/10 hover:bg-gold hover:text-black font-semibold text-[11px] transition-all">
                  Wczytaj do kreatora
                </button>
                <button type="button" onclick="deleteHistoryItem(\${index})" class="text-gray-500 hover:text-brandRed px-1 transition-colors" title="Usuń z historii">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          \`;
          container.appendChild(card);
        });
      } catch (err) {
        console.warn('Render history error:', err);
      }
    }`;

const newRenderHistory = `    function renderHistory() {
      const container = document.getElementById('history-items-list');
      const emptyState = document.getElementById('history-empty-state');
      const badge = document.getElementById('history-badge');
      if (!container) return;

      try {
        const revisions = window.YisProjectStore ? window.YisProjectStore.getRevisions() : [];
        const raw = localStorage.getItem('yis_orders_history') || '[]';
        const orders = JSON.parse(raw);

        if (revisions.length === 0 && orders.length === 0) {
          container.innerHTML = '';
          emptyState.classList.remove('hidden');
          if (badge) badge.classList.add('hidden');
          return;
        }

        emptyState.classList.add('hidden');
        if (badge) badge.classList.remove('hidden');
        container.innerHTML = '';

        // 1. Wyświetl rewizje kanoniczne (Schema v2)
        revisions.forEach((rev, revIdx) => {
          const card = document.createElement('div');
          card.className = 'bg-black/50 border border-gold/40 hover:border-gold rounded-2xl p-4 transition-all text-xs shadow-lg mb-3';
          card.innerHTML = \`
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="font-mono font-black text-gold text-sm">\${rev.projectId}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-gold/20 text-gold">Rewizja v\${rev.revision}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">\${rev.status}</span>
              </div>
              <span class="text-xs font-black text-white">~\${rev.pricing?.formattedTotal || '0,00 zł'}</span>
            </div>

            <div class="grid grid-cols-2 gap-2 text-gray-400 mb-2">
              <div>Produkt: <span class="text-gray-200 font-medium">\${rev.product?.type} (\${rev.product?.size})</span></div>
              <div>Kolor: <span class="text-gray-200 font-medium">\${rev.product?.color}</span></div>
              <div>Nakład: <span class="text-gray-200 font-medium">\${rev.product?.quantity} szt.</span></div>
              <div>Data: <span class="text-gray-200 font-medium">\${new Date(rev.updatedAt).toLocaleDateString('pl-PL')}</span></div>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-white/10">
              <span class="text-gray-400 truncate max-w-[200px]">\${rev.customer?.firstName} \${rev.customer?.lastName}</span>
              <button type="button" onclick="loadRevisionToCreator(\${revIdx})" class="px-3 py-1.5 rounded-lg bg-gold hover:bg-gold-hover text-black font-extrabold text-[11px] uppercase tracking-wider transition-all">
                Wczytaj tę rewizję
              </button>
            </div>
          \`;
          container.appendChild(card);
        });

        // 2. Starsze archiwa
        orders.forEach((o, index) => {
          const card = document.createElement('div');
          card.className = 'bg-black/30 border border-white/10 hover:border-gold/30 rounded-2xl p-4 transition-all text-xs mb-3';
          card.innerHTML = \`
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="font-extrabold text-white text-sm uppercase">\${o.productType} (\${o.size})</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold \${o.status.includes('MAIL') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gold/20 text-gold'}">
                  \${o.status}
                </span>
              </div>
              <span class="text-xs font-black text-gold">~\${o.totalPrice} zł</span>
            </div>
            <div class="flex items-center justify-between pt-2 border-t border-white/5">
              <span class="text-gray-400 truncate max-w-[200px]">\${o.firstName} \${o.lastName}</span>
              <div class="flex items-center gap-2">
                <button type="button" onclick="loadOrderToCreator(\${index})" class="px-2.5 py-1 rounded bg-white/10 hover:bg-gold hover:text-black font-semibold text-[11px] transition-all">
                  Wczytaj do kreatora
                </button>
                <button type="button" onclick="deleteHistoryItem(\${index})" class="text-gray-500 hover:text-brandRed px-1 transition-colors" title="Usuń z historii">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          \`;
          container.appendChild(card);
        });
      } catch (err) {
        console.warn('Render history error:', err);
      }
    }

    function loadRevisionToCreator(revIdx) {
      try {
        const revisions = window.YisProjectStore ? window.YisProjectStore.getRevisions() : [];
        const rev = revisions[revIdx];
        if (!rev) return;

        state.activeProject = rev;
        selectProductType(rev.product.type, rev.product.basePrice || 45);
        const colObj = YIS_COLORS.find(c => c.name === rev.product.color) || YIS_COLORS[0];
        selectColor(colObj);
        state.selectedSize = rev.product.size;
        selectFormat(rev.print.format || 'Standard');
        if (rev.print.placement) selectPlacement(rev.print.placement);
        state.quantity = rev.product.quantity || 1;
        document.getElementById('quantity-display').textContent = state.quantity;

        if (rev.design?.personalizedText) {
          state.personalizedText = rev.design.personalizedText;
          const txtIn = document.getElementById('custom-text-input');
          if (txtIn) txtIn.value = state.personalizedText;
        }

        if (rev.designPackage) {
          selectDesignPackage(rev.designPackage.tier || 1);
        }

        if (rev.customer) {
          state.firstName = rev.customer.firstName || '';
          state.lastName = rev.customer.lastName || '';
          state.email = rev.customer.email || '';
          state.phoneNumber = rev.customer.phone || '';
          state.address = rev.customer.deliveryAddress || '';

          const fn = document.getElementById('input-first-name'); if (fn) fn.value = state.firstName;
          const ln = document.getElementById('input-last-name'); if (ln) ln.value = state.lastName;
          const em = document.getElementById('input-email'); if (em) em.value = state.email;
          const ph = document.getElementById('input-phone'); if (ph) ph.value = state.phoneNumber;
          const ad = document.getElementById('input-address'); if (ad) ad.value = state.address;
        }

        state.currentStep = 7; // Przejdź do wizualizacji
        updateStepUI();
        switchTab('creator');
        alert(\`Wczytano rewizję v\${rev.revision} projektu \${rev.projectId} do Kreatora!\`);
      } catch (e) {
        console.warn('loadRevisionToCreator error:', e);
      }
    }`;

if (content.includes(oldRenderHistory)) {
  content = content.replace(oldRenderHistory, newRenderHistory);
  console.log('✅ Zaktualizowano renderHistory() i dodano loadRevisionToCreator()');
} else {
  console.error('❌ Nie znaleziono starej funkcji renderHistory()!');
  process.exit(1);
}

fs.writeFileSync(filePath, content, { encoding: 'utf8' });
console.log('🎉 Pomyślnie zaktualizowano projektant.html (ETAP 4: Karta Projektu + Truthful UI Handoff)');
