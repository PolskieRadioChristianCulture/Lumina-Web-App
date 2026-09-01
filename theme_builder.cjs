const fs = require('fs');

const cssPart1 = `    <!-- CSS STYLES (LUXURY BLACK, BRUSHED SILVER & 3D GLASSMORPHISM) -->
    <style>
        :root {
            /* ── Pure Luxury Black & Deep Obsidian ── */
            --bg-deep: #010204;
            --bg-obsidian: #07080c;
            --bg-surface-glass: rgba(10, 12, 18, 0.75);
            --bg-card-glass: rgba(13, 16, 24, 0.68);
            --bg-card-hover: rgba(22, 27, 40, 0.88);
            --bg-drawer-glass: rgba(5, 7, 12, 0.96);

            /* ── Brushed Silver, Platinum & Chrome ── */
            --silver-100: #ffffff;
            --silver-200: #f8fafc;
            --silver-300: #e2e8f0;
            --silver-400: #cbd5e1;
            --silver-500: #94a3b8;
            --silver-600: #64748b;
            --silver-glow: rgba(226, 232, 240, 0.45);
            --silver-glow-subtle: rgba(226, 232, 240, 0.18);
            --silver-glow-intense: rgba(255, 255, 255, 0.65);
            --silver-brushed: linear-gradient(135deg, #ffffff 0%, #cbd5e1 25%, #94a3b8 50%, #e2e8f0 75%, #ffffff 100%);
            --silver-metallic-btn: linear-gradient(180deg, #ffffff 0%, #e2e8f0 40%, #cbd5e1 55%, #94a3b8 100%);
            --silver-badge-gradient: linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #64748b 100%);
            --silver-border: rgba(226, 232, 240, 0.28);
            --silver-border-bright: rgba(255, 255, 255, 0.45);

            /* ── Crystal Glassmorphism & Borders ── */
            --border-glass: rgba(255, 255, 255, 0.12);
            --border-glass-bright: rgba(255, 255, 255, 0.24);
            --glass-blur: blur(24px);
            --glass-specular: inset 0 1px 1px 0 rgba(255, 255, 255, 0.35);

            /* ── Accents & Typography ── */
            --accent-cyan: #38bdf8;
            --accent-silver: #e2e8f0;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --text-silver: #e2e8f0;
            --font-display: 'Cinzel', serif;
            --font-body: 'Outfit', sans-serif;
            --radius-xl: 22px;
            --radius-lg: 16px;
            --radius-md: 12px;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
        }

        html {
            -webkit-text-size-adjust: 100%;
            scroll-behavior: smooth;
        }

        body {
            background-color: var(--bg-deep);
            background-image: 
                radial-gradient(circle at 50% -10%, rgba(226, 232, 240, 0.12) 0%, transparent 65%),
                radial-gradient(circle at 10% 35%, rgba(148, 163, 184, 0.05) 0%, transparent 50%),
                radial-gradient(circle at 90% 75%, rgba(255, 255, 255, 0.04) 0%, transparent 50%),
                radial-gradient(circle at 50% 110%, rgba(56, 189, 248, 0.03) 0%, transparent 50%);
            background-attachment: fixed;
            color: var(--text-main);
            font-family: var(--font-body);
            min-height: 100vh;
            overflow-x: hidden;
            line-height: 1.5;
            padding-bottom: 0;
        }

        /* ── 3D & METALLIC SHIMMER KEYFRAMES ── */
        @keyframes silverShimmer {
            0% { background-position: -200% 0%; }
            100% { background-position: 200% 0%; }
        }

        @keyframes metallicBeamFlow {
            0% { background-position: 0% 0%; }
            100% { background-position: 200% 0%; }
        }

        @keyframes dotPulseSilver {
            0%, 100% { transform: scale(1); opacity: 1; box-shadow: 0 0 8px rgba(255,255,255,0.9); }
            50% { transform: scale(1.35); opacity: 0.7; box-shadow: 0 0 16px rgba(226,232,240,1); }
        }

        /* ── TOP NAV BAR (FROSTED GLASS & BRUSHED PLATINUM) ── */
        .vod-header {
            position: sticky;
            top: 0;
            z-index: 100;
            background: rgba(3, 4, 8, 0.86);
            backdrop-filter: blur(28px) saturate(190%);
            -webkit-backdrop-filter: blur(28px) saturate(190%);
            border-bottom: 1px solid var(--silver-border);
            box-shadow: 0 1px 0 0 rgba(255, 255, 255, 0.12), 0 10px 30px rgba(0, 0, 0, 0.85);
            padding: max(12px, env(safe-area-inset-top)) 24px 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
        }

        .vod-brand {
            display: flex;
            align-items: center;
            gap: 14px;
            text-decoration: none;
            color: inherit;
            min-width: 0;
            position: relative;
        }

        .vod-logo-img {
            width: 48px;
            height: 48px;
            border-radius: 14px;
            object-fit: cover;
            border: 1.5px solid var(--silver-300);
            box-shadow: 0 0 20px var(--silver-glow-subtle), inset 0 0 10px rgba(255,255,255,0.3);
            flex-shrink: 0;
            transition: all 0.3s ease;
        }

        .vod-brand:hover .vod-logo-img {
            transform: scale(1.05) rotate(1deg);
            border-color: #ffffff;
            box-shadow: 0 0 25px var(--silver-glow);
        }

        .vod-brand-text {
            min-width: 0;
        }

        .vod-brand-title {
            font-family: var(--font-display);
            font-size: clamp(1rem, 2.5vw, 1.32rem);
            font-weight: 900;
            letter-spacing: 1.2px;
            background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 35%, #94a3b8 70%, #f8fafc 100%);
            background-size: 200% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            display: flex;
            align-items: center;
            gap: 8px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            text-shadow: 0 0 20px rgba(255,255,255,0.25);
        }

        .vod-brand-title i {
            color: var(--silver-200);
            text-shadow: 0 0 12px var(--silver-glow);
        }

        .vod-brand-sub {
            font-size: 0.72rem;
            color: var(--silver-500);
            letter-spacing: 0.8px;
            text-transform: uppercase;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-weight: 500;
        }

        .vod-nav-links {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-shrink: 0;
        }

        .nav-btn-link {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 8px 16px;
            border-radius: 24px;
            font-size: 0.84rem;
            font-weight: 700;
            text-decoration: none;
            color: var(--silver-300);
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.12);
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15);
            min-height: 42px;
            transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .nav-btn-link:hover, .nav-btn-link:active {
            background: rgba(255, 255, 255, 0.12);
            border-color: var(--silver-300);
            color: #ffffff;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), 0 0 16px var(--silver-glow-subtle);
        }

        .nav-btn-lumina {
            background: linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(226, 232, 240, 0.12));
            border-color: rgba(56, 189, 248, 0.35);
            color: #7dd3fc;
        }

        .nav-btn-lumina:hover, .nav-btn-lumina:active {
            border-color: #38bdf8;
            color: #ffffff;
            box-shadow: 0 0 20px rgba(56, 189, 248, 0.35);
        }

        /* ── TICKER (OBSIDIAN GLASS & BRUSHED SILVER) ── */
        .vod-ticker-bar {
            background: linear-gradient(90deg, #020306 0%, #080a12 50%, #020306 100%);
            border-bottom: 1.5px solid var(--silver-border);
            padding: 11px 22px;
            display: flex;
            align-items: center;
            gap: 18px;
            overflow: hidden;
            position: relative;
            z-index: 50;
            box-shadow: 0 6px 24px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.06);
        }

        .ticker-badge {
            background: var(--silver-metallic-btn);
            color: #050608;
            font-weight: 900;
            font-size: 0.82rem;
            padding: 6px 14px;
            border-radius: 14px;
            display: inline-flex;
            align-items: center;
            gap: 7px;
            flex-shrink: 0;
            letter-spacing: 0.6px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.5), 0 0 16px var(--silver-glow);
            z-index: 10;
            position: relative;
            text-transform: uppercase;
            border: 1px solid rgba(255, 255, 255, 0.8);
        }

        .ticker-viewport {
            flex: 1;
            overflow: hidden;
            position: relative;
            display: flex;
            align-items: center;
            mask-image: linear-gradient(to right, transparent 0%, black 20px, black calc(100% - 20px), transparent 100%);
            -webkit-mask-image: linear-gradient(to right, transparent 0%, black 20px, black calc(100% - 20px), transparent 100%);
        }

        .ticker-content-track {
            display: inline-flex;
            align-items: center;
            gap: 55px;
            white-space: nowrap;
            animation: tickerScroll 130s linear infinite;
            will-change: transform;
            padding-left: 100%;
        }

        .vod-ticker-bar:hover .ticker-content-track {
            animation-play-state: paused;
        }

        @keyframes tickerScroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-100%); }
        }

        .ticker-item {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            color: var(--silver-200);
            font-size: 0.98rem;
            font-weight: 600;
            letter-spacing: 0.3px;
            text-shadow: 0 2px 6px rgba(0, 0, 0, 0.8);
        }

        .ticker-item i {
            color: #ffffff;
            font-size: 1.05rem;
            text-shadow: 0 0 10px var(--silver-glow);
        }
`;
const cssPart2 = `
        /* ── MAIN CONTAINER ── */
        .vod-container {
            max-width: 1380px;
            margin: 0 auto;
            padding: 28px 20px 70px;
        }

        /* ── CINEMA STAGE (3D THEATER HERO & BRUSHED TITANIUM SHELL) ── */
        .cinema-stage-card {
            background: var(--bg-surface-glass);
            backdrop-filter: var(--glass-blur);
            -webkit-backdrop-filter: var(--glass-blur);
            border: 1.5px solid var(--silver-border);
            border-radius: var(--radius-xl);
            overflow: hidden;
            box-shadow: 
                0 25px 65px rgba(0, 0, 0, 0.95), 
                0 0 40px var(--silver-glow-subtle),
                inset 0 1px 1px 0 rgba(255, 255, 255, 0.35);
            margin-bottom: 36px;
            position: relative;
            transform-style: preserve-3d;
            transition: all 0.35s ease;
        }

        .cinema-stage-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #ffffff 0%, #94a3b8 25%, #e2e8f0 50%, #ffffff 75%, #94a3b8 100%);
            background-size: 200% 100%;
            animation: metallicBeamFlow 5s linear infinite;
            z-index: 5;
        }

        /* 16:9 Video Wrapper */
        .cinema-player-wrapper {
            position: relative;
            width: 100%;
            padding-top: 56.25%; /* 16:9 */
            background: #000;
            box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.9);
        }

        .cinema-player-wrapper iframe,
        .cinema-player-wrapper #ytPlayerContainer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
        }

        /* Pre-roll Banner Overlay (3D Platinum Pill) */
        .preroll-overlay-pill {
            position: absolute;
            top: 16px;
            left: 16px;
            z-index: 10;
            background: rgba(5, 7, 12, 0.92);
            border: 1px solid var(--silver-border-bright);
            color: #ffffff;
            font-size: 0.78rem;
            font-weight: 800;
            padding: 7px 16px;
            border-radius: 24px;
            display: none;
            align-items: center;
            gap: 8px;
            backdrop-filter: blur(14px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.8), 0 0 15px var(--silver-glow-subtle);
            letter-spacing: 0.5px;
        }

        .preroll-overlay-pill.show {
            display: inline-flex;
        }

        .preroll-overlay-pill i {
            color: #ffffff;
            text-shadow: 0 0 10px var(--silver-glow);
        }

        /* Skip Pre-roll Button (Brushed Silver Metal 3D) */
        .btn-skip-preroll {
            position: absolute;
            bottom: 18px;
            right: 18px;
            z-index: 10;
            background: var(--silver-metallic-btn);
            border: 1.5px solid #ffffff;
            color: #050608;
            font-size: 0.86rem;
            font-weight: 900;
            padding: 9px 22px;
            border-radius: 28px;
            cursor: pointer;
            display: none;
            align-items: center;
            gap: 8px;
            backdrop-filter: blur(14px);
            box-shadow: 0 6px 25px rgba(0, 0, 0, 0.9), 0 0 20px var(--silver-glow);
            transition: all 0.25s ease;
            min-height: 44px;
            letter-spacing: 0.4px;
        }

        .btn-skip-preroll.show {
            display: inline-flex;
        }

        .btn-skip-preroll:hover, .btn-skip-preroll:active {
            transform: scale(1.05) translateY(-2px);
            background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 50%, #e2e8f0 100%);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.9), 0 0 25px var(--silver-glow-intense);
        }

        /* Cinema Control Bar (Frosted Obsidian Glass) */
        .cinema-controls-bar {
            padding: 16px 24px;
            background: rgba(6, 8, 14, 0.94);
            border-top: 1px solid var(--border-glass-bright);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            flex-wrap: wrap;
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .now-playing-box {
            display: flex;
            align-items: center;
            gap: 14px;
            min-width: 0;
            flex: 1;
        }

        .live-pulse-badge {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            background: rgba(226, 232, 240, 0.12);
            border: 1px solid var(--silver-border-bright);
            color: #ffffff;
            font-size: 0.74rem;
            font-weight: 900;
            padding: 6px 12px;
            border-radius: 14px;
            letter-spacing: 0.6px;
            flex-shrink: 0;
            box-shadow: 0 0 14px var(--silver-glow-subtle);
        }

        .pulse-dot {
            width: 7px;
            height: 7px;
            background: #ffffff;
            border-radius: 50%;
            animation: dotPulseSilver 1.4s infinite;
        }

        .now-playing-info {
            min-width: 0;
            flex: 1;
        }

        .now-playing-title {
            font-size: 1.18rem;
            font-weight: 800;
            color: #ffffff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            display: flex;
            align-items: center;
            gap: 8px;
            letter-spacing: 0.3px;
        }

        .now-playing-meta {
            font-size: 0.80rem;
            color: var(--silver-400);
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 2px;
            flex-wrap: wrap;
        }

        .cinema-buttons-group {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-shrink: 0;
        }

        /* Brushed Silver 3D Push-Buttons */
        .btn-cinema-action {
            background: linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.04) 100%);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: var(--silver-200);
            font-size: 0.84rem;
            font-weight: 700;
            padding: 9px 16px;
            border-radius: var(--radius-md);
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 7px;
            min-height: 44px;
            transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            user-select: none;
            box-shadow: 0 4px 14px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.25);
        }

        .btn-cinema-action:hover, .btn-cinema-action:active {
            background: linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, rgba(226, 232, 240, 0.12) 100%);
            border-color: #ffffff;
            color: #ffffff;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.7), 0 0 18px var(--silver-glow-subtle);
        }

        .btn-cinema-action.active {
            background: linear-gradient(180deg, rgba(56, 189, 248, 0.25) 0%, rgba(56, 189, 248, 0.12) 100%);
            border-color: var(--accent-cyan);
            color: #ffffff;
            box-shadow: 0 0 20px rgba(56, 189, 248, 0.35);
        }

        /* Movie Details Summary Drawer (Smoked Crystal Glass) */
        .cinema-synopsis-drawer {
            padding: 20px 26px 24px;
            background: var(--bg-drawer-glass);
            border-top: 1px solid var(--border-glass);
            display: flex;
            gap: 24px;
            font-size: 0.90rem;
            color: var(--silver-300);
            line-height: 1.65;
        }

        .synopsis-text {
            flex: 1;
        }

        .synopsis-side-info {
            width: 300px;
            flex-shrink: 0;
            border-left: 1px solid var(--border-glass);
            padding-left: 24px;
            font-size: 0.82rem;
        }

        .side-info-item {
            margin-bottom: 9px;
        }

        .side-info-label {
            color: var(--silver-500);
            font-weight: 600;
        }

        .side-info-val {
            color: #ffffff;
            font-weight: 700;
        }
`;
