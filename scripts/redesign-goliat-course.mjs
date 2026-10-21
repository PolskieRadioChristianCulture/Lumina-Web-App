import fs from 'fs';
import path from 'path';

const repoDir = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const targetHtmlPath = path.join(repoDir, 'kursy/pokonac-goliata.html');
const mirrorHtmlPath = path.join(repoDir, 'kursy/pokonac-goliata/index.html');

// Read existing file to extract exact MODULES JSON
const existing = fs.readFileSync(targetHtmlPath, 'utf8');
const match = existing.match(/const MODULES = (\[.*?\]);/s);
if (!match) {
  console.error('Failed to match MODULES from', targetHtmlPath);
  process.exit(1);
}
const modulesJson = match[1];

const newHtml = `<!DOCTYPE html>
<html lang="pl" class="dark scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover" />
  <title>Pokonać Goliata — Interaktywny Kurs 8 Kroków | Cezary Rogowski</title>
  <meta name="description" content="Chrześcijańsko-psychologiczny, interaktywny i nowoczesny kurs inspiracji i motywacji w 8 krokach na podstawie książki Cezarego Rogowskiego. Pokonaj nałogi, lęk i własne słabości." />
  <link rel="canonical" href="https://polskieradio.cc/kursy/pokonac-goliata" />
  <link rel="icon" type="image/png" href="/ccn-logo-square.png" />
  <meta name="theme-color" content="#07090E" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Pokonać Goliata — Interaktywny Kurs 8 Kroków | Cezary Rogowski" />
  <meta property="og:description" content="Nowoczesny kurs biblijno-psychologiczny w 8 krokach. Interaktywna karta pracy, zero oceny wiary, pełna prywatność lokalna." />
  <meta property="og:url" content="https://polskieradio.cc/kursy/pokonac-goliata" />
  <meta property="og:image" content="https://polskieradio.cc/assets/pokonac-goliata-og.jpg" />
  <meta property="og:locale" content="pl_PL" />

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Inter:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,600;1,700&family=Lora:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />

  <style>
    :root {
      --cc-gold: #C4A35A;
      --cc-gold-hover: #D4B578;
      --cc-gold-light: #E2CC9A;
      --cc-gold-dark: #A08040;
      --cc-bg: #07090E;
      --cc-surface: #0E121A;
      --cc-surface-elevated: #141824;
      --cc-border: rgba(196, 163, 90, 0.28);
      --cc-border-subtle: rgba(255, 255, 255, 0.08);
      --cc-text: #F3F4F6;
      --cc-muted: #9CA3AF;
      --touch-target: 48px;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
    }

    body {
      background-color: var(--cc-bg);
      color: var(--cc-text);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
      line-height: 1.6;
    }

    /* Ambient atmospheric glows */
    .ambient-glow-left {
      position: fixed;
      width: 550px;
      height: 550px;
      background: radial-gradient(circle, rgba(196, 163, 90, 0.12) 0%, rgba(226, 204, 154, 0.03) 50%, transparent 70%);
      left: -120px;
      top: 60px;
      filter: blur(80px);
      pointer-events: none;
      z-index: 0;
    }

    .ambient-glow-right {
      position: fixed;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(196, 163, 90, 0.09) 0%, rgba(14, 18, 26, 0.05) 50%, transparent 70%);
      right: -150px;
      top: 240px;
      filter: blur(90px);
      pointer-events: none;
      z-index: 0;
    }

    /* Top Sticky Header */
    .top-header {
      background: rgba(7, 9, 14, 0.88);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--cc-border);
      position: sticky;
      top: 0;
      z-index: 50;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 14px;
      text-decoration: none;
      color: inherit;
    }

    .book-thumb {
      width: 42px;
      height: 56px;
      border-radius: 6px;
      object-fit: cover;
      box-shadow: 0 4px 16px rgba(196, 163, 90, 0.25);
      border: 1.5px solid var(--cc-gold);
      flex-shrink: 0;
      transition: transform 0.2s ease;
    }

    .brand-wrap:hover .book-thumb {
      transform: scale(1.04);
    }

    .brand-info h1 {
      font-family: 'Cinzel', serif;
      font-size: 17px;
      font-weight: 800;
      background: linear-gradient(135deg, #FFFFFF 0%, #E2CC9A 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: 2px;
      line-height: 1.2;
    }

    .brand-info p {
      font-size: 10px;
      color: var(--cc-gold);
      letter-spacing: 1.5px;
      font-weight: 700;
      text-transform: uppercase;
      margin-top: 2px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .btn-header {
      min-height: 44px;
      padding: 0 16px;
      border-radius: 99px;
      background: rgba(196, 163, 90, 0.1);
      border: 1px solid var(--cc-border);
      color: var(--cc-gold-light);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.04em;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .btn-header:hover, .btn-header:active {
      background: rgba(196, 163, 90, 0.22);
      border-color: var(--cc-gold);
      color: #FFFFFF;
      transform: translateY(-1px);
      box-shadow: 0 4px 14px rgba(196, 163, 90, 0.25);
    }

    .btn-icon-only {
      width: 44px;
      height: 44px;
      padding: 0;
      border-radius: 12px;
    }

    /* Layout Grid */
    .app-container {
      display: grid;
      grid-template-columns: 360px 1fr;
      gap: 32px;
      flex: 1;
      max-width: 1440px;
      margin: 0 auto;
      width: 100%;
      padding: 28px 24px 60px;
      position: relative;
      z-index: 1;
    }

    @media (max-width: 1024px) {
      .app-container {
        grid-template-columns: 1fr;
        padding: 16px 14px 40px;
      }
    }

    /* Sidebar Navigation Panel */
    .sidebar {
      background: rgba(14, 18, 26, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--cc-border);
      border-radius: 20px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      height: calc(100vh - 105px);
      position: sticky;
      top: 85px;
      overflow-y: auto;
      box-shadow: 0 12px 36px rgba(0,0,0,0.5);
    }

    /* Sleek scrollbar */
    .sidebar::-webkit-scrollbar {
      width: 6px;
    }
    .sidebar::-webkit-scrollbar-track {
      background: transparent;
    }
    .sidebar::-webkit-scrollbar-thumb {
      background: rgba(196, 163, 90, 0.25);
      border-radius: 3px;
    }
    .sidebar::-webkit-scrollbar-thumb:hover {
      background: var(--cc-gold);
    }

    @media (max-width: 1024px) {
      .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        height: 100vh;
        width: 320px;
        z-index: 60;
        border-radius: 0;
        transform: translateX(-100%);
        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: 8px 0 32px rgba(0,0,0,0.85);
      }
      .sidebar.open {
        transform: translateX(0);
      }
      .sidebar-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.75);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        z-index: 55;
        display: none;
      }
      .sidebar-backdrop.show {
        display: block;
      }
    }

    /* Progress Box */
    .progress-box {
      background: linear-gradient(135deg, rgba(20, 24, 36, 0.95) 0%, rgba(7, 9, 14, 0.98) 100%);
      border: 1px solid var(--cc-border);
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 4px 18px rgba(0,0,0,0.4);
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      font-weight: 800;
      color: var(--cc-gold-light);
      margin-bottom: 8px;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .progress-track {
      width: 100%;
      height: 8px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 99px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #C4A35A 0%, #F5D792 50%, #C4A35A 100%);
      width: 0%;
      transition: width 0.4s ease;
      box-shadow: 0 0 12px rgba(196, 163, 90, 0.5);
    }

    .progress-sub {
      font-size: 10px;
      color: var(--cc-muted);
      margin-top: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* Section divider in sidebar */
    .sidebar-section-title {
      font-size: 10px;
      font-weight: 800;
      color: var(--cc-gold);
      letter-spacing: 1.5px;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
    }

    .sidebar-section-title::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--cc-border-subtle);
    }

    /* Navigation list */
    .nav-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      list-style: none;
    }

    .nav-item-btn {
      width: 100%;
      min-height: 52px;
      padding: 10px 14px;
      border-radius: 12px;
      background: rgba(20, 24, 36, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.06);
      color: var(--cc-muted);
      display: flex;
      align-items: center;
      gap: 12px;
      text-align: left;
      cursor: pointer;
      transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .nav-item-btn:hover {
      background: rgba(196, 163, 90, 0.08);
      border-color: rgba(196, 163, 90, 0.3);
      color: #FFFFFF;
      transform: translateX(2px);
    }

    .nav-item-btn.active {
      background: linear-gradient(90deg, rgba(196, 163, 90, 0.22) 0%, rgba(20, 24, 36, 0.85) 100%);
      border-color: var(--cc-gold);
      color: #FFFFFF;
      box-shadow: 0 4px 18px rgba(196, 163, 90, 0.15);
    }

    .nav-check {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      border: 1.5px solid rgba(255, 255, 255, 0.15);
      background: rgba(7, 9, 14, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 800;
      color: var(--cc-gold);
      flex-shrink: 0;
      transition: all 0.2s ease;
    }

    .nav-item-btn.active .nav-check {
      background: var(--cc-gold);
      border-color: var(--cc-gold);
      color: #07090E;
      box-shadow: 0 0 12px rgba(196, 163, 90, 0.5);
    }

    .nav-item-btn.completed .nav-check {
      border-color: #10B981;
      background: #10B981;
      color: #07090E;
      font-weight: 800;
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
    }

    .nav-text-wrap {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      line-height: 1.3;
    }

    .nav-step-badge {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 1px;
      color: var(--cc-gold);
      text-transform: uppercase;
      margin-bottom: 2px;
    }

    .nav-step-title {
      font-size: 12px;
      font-weight: 600;
      color: #F3F4F6;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Content Area */
    .content-area {
      max-width: 920px;
      width: 100%;
    }

    /* Privacy Banner */
    .privacy-badge {
      background: linear-gradient(135deg, rgba(14, 18, 26, 0.95) 0%, rgba(20, 24, 36, 0.95) 100%);
      border: 1px solid var(--cc-border);
      border-radius: 16px;
      padding: 16px 20px;
      font-size: 12px;
      line-height: 1.6;
      color: #E2CC9A;
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 24px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.35);
    }

    .privacy-badge i {
      font-size: 20px;
      color: var(--cc-gold);
      flex-shrink: 0;
    }

    /* Module Hero */
    .mod-hero {
      background: linear-gradient(135deg, rgba(20, 24, 36, 0.98) 0%, rgba(14, 18, 26, 0.98) 100%);
      border: 1px solid var(--cc-border);
      border-top: 3px solid var(--cc-gold);
      border-radius: 20px;
      padding: 32px 36px;
      margin-bottom: 28px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 16px 40px rgba(0,0,0,0.5), 0 0 30px rgba(196, 163, 90, 0.08);
    }

    @media (max-width: 768px) {
      .mod-hero {
        padding: 24px 20px;
      }
    }

    .mod-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 99px;
      background: rgba(196, 163, 90, 0.15);
      border: 1px solid var(--cc-gold);
      color: var(--cc-gold-light);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 16px;
    }

    .mod-title {
      font-family: 'Cinzel', serif;
      font-size: clamp(24px, 3.2vw, 34px);
      color: #FFFFFF;
      font-weight: 800;
      line-height: 1.25;
      margin-bottom: 16px;
      letter-spacing: 0.5px;
    }

    .mod-motto {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: clamp(16px, 1.8vw, 18px);
      font-style: italic;
      color: var(--cc-gold-light);
      line-height: 1.6;
      border-left: 3px solid var(--cc-gold);
      padding-left: 18px;
      margin: 16px 0 20px;
    }

    .mod-scripture-ref {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 8px 18px;
      border-radius: 99px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      font-size: 13px;
      font-weight: 600;
      color: #D1D5DB;
      font-family: 'Lora', serif;
    }

    /* Pillar Cards */
    .pillar-card {
      background: linear-gradient(180deg, #101522 0%, #0c0f17 100%);
      border: 1px solid var(--cc-border);
      border-radius: 18px;
      padding: 28px 32px;
      margin-bottom: 24px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4);
      transition: all 0.25s ease;
    }

    @media (max-width: 768px) {
      .pillar-card {
        padding: 22px 18px;
      }
    }

    .pillar-card:hover {
      border-color: rgba(196, 163, 90, 0.45);
      transform: translateY(-1px);
    }

    .pillar-tag {
      font-family: 'Cinzel', serif;
      font-size: 11px;
      font-weight: 800;
      color: var(--cc-gold);
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .pillar-title {
      font-family: 'Cinzel', serif;
      font-size: 20px;
      color: #FFFFFF;
      font-weight: 700;
      margin-bottom: 14px;
      letter-spacing: 0.3px;
    }

    .pillar-text {
      font-size: 15px;
      line-height: 1.8;
      color: #D1D5DB;
      font-weight: 400;
    }

    .pillar-text p {
      margin-bottom: 14px;
    }
    .pillar-text p:last-child {
      margin-bottom: 0;
    }

    /* Form & Interactivity */
    .question-group {
      margin-top: 22px;
    }

    .q-label {
      font-size: 14px;
      font-weight: 600;
      color: #F3F4F6;
      margin-bottom: 8px;
      display: block;
    }

    .q-textarea {
      width: 100%;
      min-height: 100px;
      background: #07090E;
      border: 1.5px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      padding: 14px 16px;
      color: #FFFFFF;
      font-family: inherit;
      font-size: 14px;
      line-height: 1.6;
      resize: vertical;
      transition: all 0.2s ease;
    }

    .q-textarea:focus {
      outline: none;
      border-color: var(--cc-gold);
      box-shadow: 0 0 0 3px rgba(196, 163, 90, 0.25);
      background: #090C12;
    }

    .save-indicator {
      font-size: 12px;
      color: #34D399;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: 6px;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .save-indicator.active {
      opacity: 1;
    }

    /* Quiz Cards */
    .quiz-card {
      background: rgba(196, 163, 90, 0.05);
      border: 1px solid var(--cc-border);
      border-radius: 16px;
      padding: 22px;
      margin-top: 18px;
    }

    .quiz-q-title {
      font-size: 15px;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 14px;
      line-height: 1.5;
    }

    .quiz-options {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .quiz-opt-btn {
      width: 100%;
      min-height: 48px;
      padding: 12px 16px;
      border-radius: 10px;
      background: #141824;
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #E5E7EB;
      text-align: left;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: all 0.2s ease;
    }

    .quiz-opt-btn:hover {
      background: #1A2132;
      border-color: var(--cc-gold);
      color: #FFFFFF;
    }

    .quiz-opt-btn.correct {
      background: rgba(16, 185, 129, 0.2) !important;
      border-color: #10B981 !important;
      color: #6EE7B7 !important;
      font-weight: 700;
      box-shadow: 0 0 16px rgba(16, 185, 129, 0.25);
    }

    .quiz-opt-btn.wrong {
      background: rgba(239, 68, 68, 0.2) !important;
      border-color: #EF4444 !important;
      color: #FCA5A5 !important;
    }

    .quiz-explanation {
      margin-top: 12px;
      padding: 12px 16px;
      border-radius: 10px;
      background: rgba(16, 185, 129, 0.1);
      border-left: 3px solid #10B981;
      font-size: 13px;
      color: #D1D5DB;
      line-height: 1.6;
      display: none;
    }

    .quiz-explanation.show {
      display: block;
    }

    /* Declaration Box */
    .declaration-card {
      background: linear-gradient(135deg, rgba(196, 163, 90, 0.12) 0%, rgba(14, 18, 26, 0.98) 100%);
      border: 1px solid rgba(196, 163, 90, 0.4);
      border-radius: 18px;
      padding: 28px 32px;
      margin-bottom: 28px;
      box-shadow: 0 10px 30px rgba(196, 163, 90, 0.08);
    }

    @media (max-width: 768px) {
      .declaration-card {
        padding: 22px 18px;
      }
    }

    .dec-title {
      font-family: 'Cinzel', serif;
      font-size: 13px;
      font-weight: 800;
      color: var(--cc-gold);
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .dec-text {
      font-family: 'Lora', Georgia, serif;
      font-size: 16px;
      line-height: 1.8;
      color: #FFFFFF;
      font-style: italic;
    }

    /* Bottom Action Bar */
    .step-actions-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-top: 36px;
      padding-top: 24px;
      border-top: 1px solid var(--cc-border);
      flex-wrap: wrap;
    }

    .btn-step {
      min-height: 48px;
      padding: 0 24px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      border: none;
    }

    .btn-step-gold {
      background: linear-gradient(135deg, #C4A35A 0%, #E2CC9A 100%);
      color: #07090E;
      font-weight: 800;
      box-shadow: 0 4px 18px rgba(196, 163, 90, 0.35);
    }

    .btn-step-gold:hover {
      box-shadow: 0 6px 24px rgba(196, 163, 90, 0.5);
      transform: translateY(-1px);
    }

    .btn-step-prev {
      background: rgba(255, 255, 255, 0.08);
      color: #E5E7EB;
      border: 1px solid rgba(255, 255, 255, 0.15);
    }

    .btn-step-prev:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #FFFFFF;
      border-color: rgba(255, 255, 255, 0.3);
    }

    .btn-step-done {
      background: rgba(16, 185, 129, 0.15);
      color: #34D399;
      border: 1.5px solid #10B981;
    }

    .btn-step-done:hover {
      background: #10B981;
      color: #07090E;
    }

    /* Print View */
    @media print {
      body {
        background: #fff !important;
        color: #000 !important;
      }
      .top-header, .sidebar, .step-actions-bar, .privacy-badge, .header-actions, .ambient-glow-left, .ambient-glow-right {
        display: none !important;
      }
      .app-container {
        display: block !important;
        padding: 0 !important;
      }
      .pillar-card, .mod-hero, .quiz-card, .declaration-card {
        border: 1px solid #ccc !important;
        background: #fff !important;
        color: #000 !important;
        box-shadow: none !important;
        page-break-inside: avoid;
        margin-bottom: 20px !important;
      }
      .mod-title, .pillar-title, .q-label {
        color: #000 !important;
      }
      .q-textarea {
        border: 1px solid #aaa !important;
        color: #000 !important;
        background: #fafafa !important;
      }
    }
  </style>
</head>
<body>

  <!-- Ambient Glow Orbs -->
  <div class="ambient-glow-left"></div>
  <div class="ambient-glow-right"></div>

  <!-- Top Sticky Header -->
  <header class="top-header">
    <div style="display: flex; align-items: center; gap: 10px;">
      <button type="button" class="btn-header btn-icon-only lg:hidden" id="mobileDrawerBtn" aria-label="Spis kroków">
        <i class="fas fa-bars"></i>
      </button>
      <a href="/pokonac-goliata" class="brand-wrap">
        <img src="/assets/pokonac-goliata-book-3d.png" alt="Pokonać Goliata" class="book-thumb" />
        <div class="brand-info">
          <h1>POKONAĆ GOLIATA</h1>
          <p>INTERAKTYWNY KURS 8 KROKÓW • CEZARY ROGOWSKI</p>
        </div>
      </a>
    </div>

    <div class="header-actions">
      <button type="button" class="btn-header hidden sm:inline-flex" onclick="exportJSON()" title="Pobierz kartę pracy na dysk">
        <i class="fas fa-download"></i> <span>Pobierz kartę</span>
      </button>
      <label class="btn-header hidden sm:inline-flex" style="cursor: pointer;" title="Wczytaj wcześniej zapisaną kartę">
        <i class="fas fa-upload"></i> <span>Wczytaj</span>
        <input type="file" id="importFileInput" accept=".json" style="display: none;" onchange="importJSON(event)" />
      </label>
      <button type="button" class="btn-header btn-icon-only" onclick="window.print()" title="Drukuj lub zapisz jako PDF">
        <i class="fas fa-print"></i>
      </button>
      <a href="/kursy" class="btn-header" title="Wszystkie kursy CC">
        <i class="fas fa-arrow-left"></i> <span class="hidden md:inline">Kursy CC</span>
      </a>
    </div>
  </header>

  <!-- Main Container -->
  <div class="app-container">
    <div class="sidebar-backdrop" id="sidebarBackdrop" onclick="toggleSidebar()"></div>

    <!-- Sidebar Navigation -->
    <aside class="sidebar" id="sidebar">
      <div class="progress-box">
        <div class="progress-header">
          <span><i class="fas fa-trophy" style="color: var(--cc-gold);"></i> TWÓJ POSTĘP</span>
          <span id="progressPercent" style="color: var(--cc-gold-light);">0% (0/10)</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" id="progressFill"></div>
        </div>
        <div class="progress-sub">
          <i class="fas fa-shield-halved" style="color: var(--cc-gold);"></i> 100% Prywatności • Zapis lokalny
        </div>
      </div>

      <div class="sidebar-section-title">SPIS KROKÓW KURSU</div>
      <ul class="nav-list" id="navList">
        <!-- Dynamically rendered navigation items -->
      </ul>

      <div style="margin-top: auto; padding-top: 16px; border-top: 1px solid var(--cc-border-subtle); display: flex; flex-direction: column; gap: 8px;">
        <button type="button" class="btn-header" style="width: 100%; justify-content: flex-start; border-radius: 10px;" onclick="exportMarkdown()">
          <i class="fas fa-file-alt"></i> Raport tekstowy (.md)
        </button>
        <button type="button" class="btn-header" style="width: 100%; justify-content: flex-start; border-radius: 10px; color: #EF4444; border-color: rgba(239, 68, 68, 0.3);" onclick="resetWorksheet()">
          <i class="fas fa-trash-alt"></i> Wyczyść moje odpowiedzi
        </button>
      </div>
    </aside>

    <!-- Main Content Panel -->
    <main class="content-area">
      <div class="privacy-badge">
        <i class="fas fa-shield-halved"></i>
        <span><strong>Gwarancja 100% Prywatności:</strong> Twoje osobiste refleksje i odpowiedzi są zapisywane wyłącznie w bezpiecznej pamięci Twojej przeglądarki (localStorage). Żadne dane nie trafiają do chmury. Możesz w każdej chwili pobrać swoją kartę pracy (JSON / Markdown) i wczytać ją na dowolnym innym urządzeniu.</span>
      </div>

      <div id="moduleContentMount">
        <!-- Active module will be injected here -->
      </div>
    </main>
  </div>

  <script>
    const MODULES = ${modulesJson};
    const STORAGE_KEY = 'cc_pokonac_goliata_worksheet_v1';
    let currentModuleIndex = 0;
    let worksheetData = {};

    function loadWorksheet() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          worksheetData = JSON.parse(raw);
        }
      } catch (e) {
        worksheetData = {};
      }
      if (!worksheetData.answers) worksheetData.answers = {};
      if (!worksheetData.completed) worksheetData.completed = {};
      if (!worksheetData.quizScore) worksheetData.quizScore = {};
    }

    function saveWorksheet() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(worksheetData));
        updateProgress();
      } catch (e) {}
    }

    function updateProgress() {
      const completedCount = Object.keys(worksheetData.completed || {}).filter(k => worksheetData.completed[k]).length;
      const total = MODULES.length;
      const percent = Math.round((completedCount / total) * 100);

      const percentEl = document.getElementById('progressPercent');
      const fillEl = document.getElementById('progressFill');
      if (percentEl) percentEl.textContent = percent + '% (' + completedCount + '/' + total + ')';
      if (fillEl) fillEl.style.width = percent + '%';

      renderNavigation();
    }

    function renderNavigation() {
      const navList = document.getElementById('navList');
      if (!navList) return;
      navList.innerHTML = '';

      MODULES.forEach((mod, idx) => {
        const li = document.createElement('li');
        const isDone = worksheetData.completed && worksheetData.completed[mod.id];
        const isActive = idx === currentModuleIndex;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'nav-item-btn' + (isActive ? ' active' : '') + (isDone ? ' completed' : '');
        btn.onclick = () => selectModule(idx);

        let badgeText = mod.badge;
        let stepNum = idx === 0 ? '0' : (idx === 9 ? '★' : idx);

        btn.innerHTML = \`
          <span class="nav-check">\${isDone ? '<i class="fas fa-check"></i>' : stepNum}</span>
          <div class="nav-text-wrap">
            <span class="nav-step-badge">\${badgeText}</span>
            <span class="nav-step-title">\${mod.title}</span>
          </div>
        \`;

        li.appendChild(btn);
        navList.appendChild(li);
      });
    }

    function selectModule(index) {
      if (index < 0 || index >= MODULES.length) return;
      currentModuleIndex = index;
      renderNavigation();
      renderCurrentModule();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      closeSidebar();
    }

    function renderCurrentModule() {
      const mount = document.getElementById('moduleContentMount');
      if (!mount) return;
      const mod = MODULES[currentModuleIndex];
      const isDone = worksheetData.completed && worksheetData.completed[mod.id];

      let questionsHtml = '';
      mod.questions.forEach(q => {
        const val = (worksheetData.answers && worksheetData.answers[q.id]) || '';
        questionsHtml += \`
          <div class="question-group">
            <label class="q-label" for="\${q.id}">\${q.label}</label>
            <textarea class="q-textarea" id="\${q.id}" placeholder="\${q.placeholder}" oninput="handleAnswerInput('\${q.id}', this.value)">\${val}</textarea>
            <div class="save-indicator" id="save-ind-\${q.id}"><i class="fas fa-check"></i> Zapisano automatycznie w Twojej przeglądarce</div>
          </div>
        \`;
      });

      let quizHtml = '';
      mod.quiz.forEach((qz, qIdx) => {
        const selectedOpt = worksheetData.answers && worksheetData.answers['quiz_' + mod.id + '_' + qIdx];
        let optionsHtml = '';
        qz.options.forEach((opt, optIdx) => {
          let btnClass = 'quiz-opt-btn';
          if (selectedOpt !== undefined) {
            if (optIdx === qz.correct) btnClass += ' correct';
            else if (optIdx === selectedOpt) btnClass += ' wrong';
          }
          optionsHtml += \`
            <button type="button" class="\${btnClass}" onclick="handleQuizAnswer(\${mod.id}, \${qIdx}, \${optIdx})">
              <span style="font-weight: 800; color: var(--cc-gold);">\${String.fromCharCode(65 + optIdx)})</span> \${opt}
            </button>
          \`;
        });

        quizHtml += \`
          <div class="quiz-card">
            <div class="quiz-q-title">\${qIdx + 1}. \${qz.q}</div>
            <div class="quiz-options">\${optionsHtml}</div>
            <div class="quiz-explanation \${selectedOpt !== undefined ? 'show' : ''}" id="quiz-exp-\${mod.id}-\${qIdx}">
              <strong>\${selectedOpt === qz.correct ? '✅ Doskonale!' : '💡 Wyjaśnienie:'}</strong> \${qz.explanation}
            </div>
          </div>
        \`;
      });

      mount.innerHTML = \`
        <div class="mod-hero">
          <div class="mod-badge"><i class="fas fa-shield-halved"></i> \${mod.badge}</div>
          <h2 class="mod-title">\${mod.title}</h2>
          <div class="mod-motto">\${mod.motto}</div>
          <div class="mod-scripture-ref"><i class="fas fa-book-bible" style="color: var(--cc-gold);"></i> \${mod.scripture}</div>
        </div>

        <div class="pillar-card">
          <div class="pillar-tag"><i class="fas fa-cross"></i> Filar 1: Fundament Biblijny i Teologia Wolności</div>
          <h3 class="pillar-title">Prawda Słowa Bożego</h3>
          <div class="pillar-text">\${mod.theology}</div>
        </div>

        <div class="pillar-card">
          <div class="pillar-tag"><i class="fas fa-brain"></i> Filar 2: Wymiar Psychologiczny & Mechanizm Umysłu</div>
          <h3 class="pillar-title">Zrozumienie emocji i nawyków</h3>
          <div class="pillar-text">\${mod.psychology}</div>
        </div>

        <div class="pillar-card">
          <div class="pillar-tag"><i class="fas fa-pen-to-square"></i> Filar 3: Warsztat Interaktywny & Karta Pracy</div>
          <h3 class="pillar-title">Ćwiczenia do wykonania tu i teraz</h3>
          <p class="pillar-text" style="color: var(--cc-muted); margin-bottom: 8px;">Wypełnij poniższe pola. Twoje zapiski pozostają w 100% prywatne i zostaną zachowane w Twojej przeglądarce.</p>
          \${questionsHtml}
        </div>

        <div class="pillar-card">
          <div class="pillar-tag"><i class="fas fa-graduation-cap"></i> Sprawdzian Zrozumienia (Krótki Quiz)</div>
          <h3 class="pillar-title">Sprawdź kluczowe zasady tego kroku</h3>
          \${quizHtml}
        </div>

        <div class="declaration-card">
          <div class="dec-title"><i class="fas fa-dove"></i> Filar 4: Deklaracja Wolności & Modlitwa Przełomu</div>
          <div class="dec-text">\${mod.declaration}</div>
        </div>

        <div class="step-actions-bar">
          <button type="button" class="btn-step btn-step-prev \${currentModuleIndex === 0 ? 'opacity-40 pointer-events-none' : ''}" onclick="selectModule(\${currentModuleIndex - 1})">
            <i class="fas fa-chevron-left"></i> Poprzedni krok
          </button>
          
          <button type="button" class="btn-step \${isDone ? 'btn-step-done' : 'btn-step-gold'}" onclick="toggleModuleDone(\${mod.id})">
            <i class="fas \${isDone ? 'fa-check-double' : 'fa-check'}"></i> \${isDone ? 'Krok ukończony ✓' : 'Oznacz ten krok jako ukończony'}
          </button>

          <button type="button" class="btn-step btn-step-prev \${currentModuleIndex === MODULES.length - 1 ? 'opacity-40 pointer-events-none' : ''}" onclick="selectModule(\${currentModuleIndex + 1})">
            Następny krok <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      \`;
    }

    function handleAnswerInput(qId, val) {
      if (!worksheetData.answers) worksheetData.answers = {};
      worksheetData.answers[qId] = val;
      saveWorksheet();

      const ind = document.getElementById('save-ind-' + qId);
      if (ind) {
        ind.classList.add('active');
        clearTimeout(ind.timer);
        ind.timer = setTimeout(() => ind.classList.remove('active'), 2000);
      }
    }

    function handleQuizAnswer(modId, qIdx, optIdx) {
      if (!worksheetData.answers) worksheetData.answers = {};
      worksheetData.answers['quiz_' + modId + '_' + qIdx] = optIdx;
      saveWorksheet();
      renderCurrentModule();
    }

    function toggleModuleDone(modId) {
      if (!worksheetData.completed) worksheetData.completed = {};
      worksheetData.completed[modId] = !worksheetData.completed[modId];
      saveWorksheet();
      renderCurrentModule();
    }

    function exportJSON() {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(worksheetData, null, 2));
      const a = document.createElement('a');
      a.setAttribute('href', dataStr);
      a.setAttribute('download', 'Karta_Pracy_Pokonac_Goliata_' + new Date().toISOString().slice(0, 10) + '.json');
      document.body.appendChild(a);
      a.click();
      a.remove();
    }

    function exportMarkdown() {
      let md = '# ⚔️ KARTA PRACY: POKONAĆ GOLIATA (8 KROKÓW)\\n\\n';
      md += '**Autor:** Cezary Rogowski (Christian Culture 2026)\\n';
      md += '**Data wygenerowania:** ' + new Date().toLocaleString('pl-PL') + '\\n\\n---\\n\\n';

      MODULES.forEach(mod => {
        md += '## ' + mod.badge + ': ' + mod.title + '\\n\\n';
        mod.questions.forEach(q => {
          const ans = (worksheetData.answers && worksheetData.answers[q.id]) || '[Brak wpisu]';
          md += '### ' + q.label + '\\n' + ans + '\\n\\n';
        });
        md += '---\\n\\n';
      });

      const dataStr = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(md);
      const a = document.createElement('a');
      a.setAttribute('href', dataStr);
      a.setAttribute('download', 'Raport_Pokonac_Goliata_' + new Date().toISOString().slice(0, 10) + '.md');
      document.body.appendChild(a);
      a.click();
      a.remove();
    }

    function importJSON(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const parsed = JSON.parse(e.target.result);
          if (parsed && (parsed.answers || parsed.completed)) {
            worksheetData = parsed;
            saveWorksheet();
            renderNavigation();
            renderCurrentModule();
            alert('✅ Pomyślnie wczytano Twoją kartę pracy!');
          } else {
            alert('❌ Nieprawidłowy format pliku JSON.');
          }
        } catch (err) {
          alert('❌ Błąd podczas odczytu pliku.');
        }
      };
      reader.readAsText(file);
    }

    function resetWorksheet() {
      if (confirm('Czy na pewno chcesz usunąć wszystkie swoje zapiski z pamięci tej przeglądarki? Ta operacja jest nieodwracalna.')) {
        worksheetData = { answers: {}, completed: {}, quizScore: {} };
        saveWorksheet();
        renderNavigation();
        renderCurrentModule();
      }
    }

    function toggleSidebar() {
      const sb = document.getElementById('sidebar');
      const bdrop = document.getElementById('sidebarBackdrop');
      if (sb) sb.classList.toggle('open');
      if (bdrop) bdrop.classList.toggle('show');
    }

    function closeSidebar() {
      const sb = document.getElementById('sidebar');
      const bdrop = document.getElementById('sidebarBackdrop');
      if (sb) sb.classList.remove('open');
      if (bdrop) bdrop.classList.remove('show');
    }

    document.addEventListener('DOMContentLoaded', () => {
      loadWorksheet();
      const mobileBtn = document.getElementById('mobileDrawerBtn');
      if (mobileBtn) mobileBtn.addEventListener('click', toggleSidebar);
      renderNavigation();
      renderCurrentModule();
    });
  </script>
</body>
</html>
`;

fs.writeFileSync(targetHtmlPath, newHtml, 'utf8');
fs.writeFileSync(mirrorHtmlPath, newHtml, 'utf8');
console.log('Successfully written redesign to:');
console.log(' -', targetHtmlPath);
console.log(' -', mirrorHtmlPath);
