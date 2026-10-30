#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const targetFile = path.join(ROOT, 'scripts/build-ccn-static-pages.mjs');

let content = fs.readFileSync(targetFile, 'utf8');

// 1. Dodaj CSS
const cssTarget = '/* Related Section */';
if (content.includes(cssTarget) && !content.includes('ccn-search-promo-box')) {
  const promoCss = `/* Omni Search Autopromotion Box */
      .ccn-search-promo-box {
        margin: 2.25rem 0;
        padding: 1.5rem 1.75rem;
        background: linear-gradient(135deg, rgba(10, 14, 24, 0.96), rgba(18, 25, 40, 0.96));
        border: 1.5px solid rgba(196, 163, 90, 0.4);
        border-radius: 16px;
        box-shadow: 0 8px 28px rgba(0, 0, 0, 0.35);
        color: #ffffff;
      }
      .ccn-search-promo-content {
        display: flex;
        align-items: center;
        gap: 1.25rem;
        flex-wrap: wrap;
      }
      .ccn-search-promo-icon {
        width: 48px;
        height: 48px;
        min-width: 48px;
        border-radius: 12px;
        background: linear-gradient(135deg, rgba(255, 122, 0, 0.2), rgba(196, 163, 90, 0.3));
        border: 1.5px solid rgba(255, 122, 0, 0.5);
        color: #FF7A00;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }
      .ccn-search-promo-text {
        flex: 1;
        min-width: 240px;
      }
      .ccn-search-promo-title {
        font-family: 'Cinzel', serif;
        font-size: 1.12rem;
        font-weight: 700;
        color: #C4A35A;
        margin: 0 0 0.35rem 0;
      }
      .ccn-search-promo-desc {
        font-size: 0.88rem;
        line-height: 1.45;
        color: rgba(244, 244, 245, 0.85);
        margin: 0;
      }
      .ccn-search-promo-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.75rem 1.4rem;
        border-radius: 10px;
        background: #FF7A00;
        color: #ffffff !important;
        font-weight: 700;
        font-size: 0.92rem;
        text-decoration: none;
        border: 1px solid #FF8C33;
        min-height: 44px;
        box-shadow: 0 4px 14px rgba(255, 122, 0, 0.35);
        transition: background 0.2s ease, transform 0.15s ease;
        flex-shrink: 0;
      }
      .ccn-search-promo-btn:hover {
        background: #FF8C33;
        transform: translateY(-2px);
      }
      .ccn-search-promo-btn kbd {
        display: inline-block;
        padding: 2px 6px;
        border-radius: 4px;
        background: rgba(0, 0, 0, 0.35);
        border: 1px solid rgba(255, 255, 255, 0.3);
        font-family: inherit;
        font-size: 0.72rem;
        color: #fff;
      }

      `;
  content = content.replace(cssTarget, promoCss + cssTarget);
}

// 2. Dodaj HTML sekcji
const promoHtml = `</section>

        <!-- CC Omni Search Promotion Box -->
        <section class="ccn-search-promo-box" aria-labelledby="ccnSearchPromoHeading">
          <div class="ccn-search-promo-content">
            <div class="ccn-search-promo-icon" aria-hidden="true">
              <i class="fa-solid fa-magnifying-glass"></i>
            </div>
            <div class="ccn-search-promo-text">
              <h3 id="ccnSearchPromoHeading" class="ccn-search-promo-title">Szukasz konkretnego tematu, wersetu lub audycji?</h3>
              <p class="ccn-search-promo-desc">
                Skorzystaj z inteligentnej wyszukiwarki ekosystemu Christian Culture. Przeszukuj Pismo Święte (UBG), audycje radiowe, lekcje Akademii Biblijnej i artykuły — natychmiast od 1. litery.
              </p>
            </div>
            <a href="https://polskieradio.cc/wyszukiwarka" class="ccn-search-promo-btn" aria-label="Otwórz Wyszukiwarkę Ekosystemu Christian Culture">
              <span>Szukaj w EkoCC</span>
              <kbd>Ctrl+K</kbd>
            </a>
          </div>
        </section>

        <!-- Related Articles Grid -->`;

const htmlTarget1 = '</section>\n\n        <!-- Related Articles Grid -->';
const htmlTarget2 = '</section>\r\n\r\n        <!-- Related Articles Grid -->';

if (content.includes(htmlTarget1)) {
  content = content.replace(htmlTarget1, promoHtml);
} else if (content.includes(htmlTarget2)) {
  content = content.replace(htmlTarget2, promoHtml);
} else {
  // Regex fallback
  content = content.replace(/<\/section>[\r\n\s]*<!-- Related Articles Grid -->/, promoHtml);
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('✅ Pomyślnie zintegrowano boks autopromocji /wyszukiwarka w scripts/build-ccn-static-pages.mjs');
