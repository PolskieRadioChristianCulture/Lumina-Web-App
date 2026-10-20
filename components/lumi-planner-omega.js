/**
 * ==============================================================================
 * 🏛️ CHRISTIAN CULTURE | LUMI MESS — PLANER MISYJNY OMEGA (v3.0 - 5.10.15)
 * ==============================================================================
 * Architektura czasu: Od Wieczności do Godziny + Ścisła Metodologia 5.10.15
 * Stylistyka: Luksusowy Black & Gold (#000000, #0B0B0B, #D4AF37)
 */

function escapePlannerHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export class MissionPlannerOmega51015 {
    constructor(containerId) {
        this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
        this.state = this.loadState();
        this.init();
    }

    loadState() {
        try {
            const saved = localStorage.getItem('cc_planner_omega_51015');
            if (saved) return JSON.parse(saved);
        } catch(e) {}
        return {
            eternityVision: "Wieczne Królestwo Boże i zbawienie dusz w Jezusie Chrystusie.",
            horizons: {
                y30: "Utrwalenie ekosystemu Christian Culture jako globalnej opoki Słowa.",
                y20: "Pełne pokoleniowe przekazanie dziedzictwa wiary (Lumi Kids -> Dorosłość).",
                y15: "Instytucjonalna i cyfrowa niezależność technologiczna sieci CCN.",
                y10: "Milion aktywnych domostw zakorzenionych w Słowie przez polskieradio.cc.",
                y5: "Stabilna sieć stacji, aplikacji (PWA) i akademii biblijnych w wielu językach.",
                y3: "Rozwój portalu Lumina, audycje 24/7 i spójność Orkiestry 777.",
                y1: "Wdrożenie zaawansowanych agentów AI (JOMA) i stabilizacja finansowa misji.",
                months2026: "Zamknięcie cykli wydawniczych, optymalizacja Cloudflare i ekspansja Słowa."
            },
            tasks: []
        };
    }

    init() {
        if (!this.container) return;
        this.render();
        this.attachEvents();
    }

    render() {
        if (!this.container) return;
        this.container.innerHTML = `
            <div class="omega-planner-51015" style="background: #0B0B0B; border: 1.5px solid #D4AF37; border-radius: 16px; padding: 18px; color: #fff; font-family: 'Cinzel', serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; width: 100%; box-sizing: border-box; box-shadow: 0 8px 30px rgba(212, 175, 55, 0.2); margin: 0 auto;">
                
                <!-- NAGŁÓWEK -->
                <div style="border-bottom: 2px solid #D4AF37; padding-bottom: 12px; margin-bottom: 16px; text-align: center;">
                    <div style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 4px;">
                        <span style="font-size: 1.2rem;">🏛️</span>
                        <h2 style="margin: 0; color: #D4AF37; font-size: 16px; letter-spacing: 2px; font-weight: 800;">PLANER MISYJNY OMEGA 5.10.15</h2>
                    </div>
                    <p style="margin: 4px 0 0 0; color: #aaa; font-size: 11px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Od Wieczności do Godziny | System 5.10.15 | ACK System</p>
                </div>

                <!-- WIZJA WIECZNOŚCI -->
                <div style="background: #141414; border: 1px solid #333; border-left: 4px solid #D4AF37; padding: 10px 12px; border-radius: 6px; margin-bottom: 14px;">
                    <strong style="color: #D4AF37; font-size: 11px; display: block; margin-bottom: 4px; letter-spacing: 1px;">🌌 CEL OSTATECZNY (WIECZNOŚĆ):</strong>
                    <p style="margin: 0; font-size: 12px; font-style: italic; color: #eee; line-height: 1.45;">${escapePlannerHtml(this.state.eternityVision)}</p>
                </div>

                <!-- HORYZONTY CZASOWE (DRABINA) -->
                <details style="background: #121212; border: 1px solid #333; border-radius: 6px; padding: 10px 12px; margin-bottom: 14px;">
                    <summary style="color: #D4AF37; font-size: 12px; cursor: pointer; font-weight: bold; user-select: none;">⏳ Drabina Czasu (30 lat &rarr; Końcówka 2026)</summary>
                    <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 6px; font-size: 11px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.4;">
                        <div><strong style="color: #D4AF37;">30 lat:</strong> ${escapePlannerHtml(this.state.horizons.y30)}</div>
                        <div><strong style="color: #D4AF37;">20 lat:</strong> ${escapePlannerHtml(this.state.horizons.y20)}</div>
                        <div><strong style="color: #D4AF37;">15 lat:</strong> ${escapePlannerHtml(this.state.horizons.y15)}</div>
                        <div><strong style="color: #D4AF37;">10 lat:</strong> ${escapePlannerHtml(this.state.horizons.y10)}</div>
                        <div><strong style="color: #D4AF37;">5 lat:</strong> ${escapePlannerHtml(this.state.horizons.y5)}</div>
                        <div><strong style="color: #D4AF37;">Najbliższe 3 lata:</strong> ${escapePlannerHtml(this.state.horizons.y3)}</div>
                        <div><strong style="color: #D4AF37;">Najbliższy rok:</strong> ${escapePlannerHtml(this.state.horizons.y1)}</div>
                        <div><strong style="color: #D4AF37;">Ostatnie miesiące 2026:</strong> ${escapePlannerHtml(this.state.horizons.months2026)}</div>
                    </div>
                </details>

                <!-- FORMULARZ DODAWANIA ZADANIA (METODA 5.10.15) -->
                <form id="omega-form-51015" style="background: #141414; padding: 12px; border-radius: 8px; border: 1px solid #333; display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px;">
                    <input type="text" id="om-title" placeholder="Nazwa misji / zadania..." required style="background: #1a1a1a; border: 1px solid #444; border-radius: 6px; padding: 9px 12px; color: #fff; font-size: 12px; outline: none; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <select id="om-cycle" style="flex: 1; min-width: 140px; background: #1a1a1a; border: 1px solid #444; border-radius: 6px; padding: 8px 10px; color: #D4AF37; font-size: 11px; outline: none;">
                            <option value="hourly">Cykl: Godzinowy</option>
                            <option value="daily" selected>Cykl: Dzienne</option>
                            <option value="weekly">Cykl: Tygodniowe</option>
                            <option value="monthly">Cykl: Miesięczne</option>
                        </select>
                        <select id="om-tier" style="background: #1a1a1a; border: 1px solid #444; border-radius: 6px; padding: 8px 10px; color: #fff; font-size: 11px; outline: none;">
                            <option value="5">Tier 5 (Natychmiast - 5 min)</option>
                            <option value="10">Tier 10 (Krótkie - 10 min)</option>
                            <option value="15" selected>Tier 15 (Głęboka sesja - 15 min)</option>
                        </select>
                    </div>
                    <button type="submit" style="background: linear-gradient(135deg, #D4AF37, #AA771C); color: #000; border: none; border-radius: 6px; padding: 10px 14px; font-weight: 800; cursor: pointer; font-size: 11px; letter-spacing: 1px; min-height: 44px; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 2px 10px rgba(212,175,55,0.3); touch-action: manipulation;">DODAJ DO PLANERA 5.10.15</button>
                </form>

                <!-- LISTA ZADAŃ (STATUSY: W TRAKCIE / NIEZREALIZOWANE / ACK) -->
                <div style="font-size: 12px; color: #D4AF37; margin-bottom: 6px; font-weight: bold; display: flex; justify-content: space-between; align-items: center;">
                    <span>📋 REJESTR ZADAŃ 5.10.15:</span>
                    <span style="font-size: 10px; color: #888; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Łącznie: ${this.state.tasks.length}</span>
                </div>
                <div id="om-task-list" style="max-height: 280px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; padding-right: 2px;">
                    ${this.state.tasks.length === 0 ? '<p style="color: #777; font-size: 11px; text-align: center; margin: 16px 0; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif;">Brak aktywnych misji w rejestrze 5.10.15.<br>Dodaj pierwsze zadanie powyżej.</p>' : ''}
                    ${this.state.tasks.map((t, idx) => `
                        <div style="background: #141414; border-left: 3px solid ${t.status === 'DONE' ? '#2ecc71' : t.status === 'IN_PROGRESS' ? '#f1c40f' : '#e74c3c'}; padding: 8px 10px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; font-size: 11px; gap: 8px;">
                            <div style="flex: 1; min-width: 0;">
                                <strong style="color: #fff; display: block; overflow-wrap: anywhere; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${escapePlannerHtml(t.title)}</strong>
                                <div style="color: #888; font-size: 9px; margin-top: 3px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Cykl: [${escapePlannerHtml(t.cycle.toUpperCase())}] | Blok: ${escapePlannerHtml(t.tier)} min | Status: <span style="font-weight: 700; color: ${t.status === 'DONE' ? '#2ecc71' : t.status === 'IN_PROGRESS' ? '#f1c40f' : '#e74c3c'}">${t.status}</span></div>
                            </div>
                            <div style="display: flex; gap: 4px; align-items: center; flex-shrink: 0;">
                                <button type="button" onclick="window.omegaPlanner51015?.toggleStatus(${idx})" title="Zmień status (PENDING &rarr; IN_PROGRESS &rarr; DONE)" style="background: #222; border: 1px solid #444; color: #D4AF37; border-radius: 4px; min-width: 44px; min-height: 44px; cursor: pointer; font-size: 14px; display: inline-flex; align-items: center; justify-content: center; touch-action: manipulation;">🔄</button>
                                <button type="button" onclick="window.omegaPlanner51015?.removeTask(${idx})" title="Usuń zadanie" style="background: #222; border: 1px solid #444; color: #e74c3c; border-radius: 4px; min-width: 44px; min-height: 44px; cursor: pointer; font-size: 16px; display: inline-flex; align-items: center; justify-content: center; touch-action: manipulation;">&times;</button>
                            </div>
                        </div>
                    `).join('')}
                </div>

            </div>
        `;
    }

    attachEvents() {
        const form = this.container?.querySelector('#omega-form-51015');
        if (!form) return;
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const titleInput = this.container.querySelector('#om-title');
            const cycleSelect = this.container.querySelector('#om-cycle');
            const tierSelect = this.container.querySelector('#om-tier');

            if (titleInput && titleInput.value.trim()) {
                this.state.tasks.push({
                    title: titleInput.value.trim(),
                    cycle: cycleSelect?.value || 'daily',
                    tier: tierSelect?.value || '15', // Ściśle 5, 10 lub 15 minut
                    status: 'PENDING', // PENDING, IN_PROGRESS, DONE
                    timestamp: new Date().toISOString()
                });
                this.save();
                this.render();
                this.attachEvents();
            }
        });
    }

    toggleStatus(index) {
        if (!this.state.tasks[index]) return;
        const statuses = ['PENDING', 'IN_PROGRESS', 'DONE'];
        const current = this.state.tasks[index].status;
        const nextIdx = (statuses.indexOf(current) + 1) % statuses.length;
        this.state.tasks[index].status = statuses[nextIdx];
        this.save();
        this.render();
        this.attachEvents();
    }

    removeTask(index) {
        if (!this.state.tasks[index]) return;
        this.state.tasks.splice(index, 1);
        this.save();
        this.render();
        this.attachEvents();
    }

    save() {
        try {
            localStorage.setItem('cc_planner_omega_51015', JSON.stringify(this.state));
        } catch(e) {}
    }
}

export function mountOmegaPlanner(containerId = 'omega-planner-mount-51015') {
    const el = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    if (!el) return null;
    const planner = new MissionPlannerOmega51015(el);
    if (typeof window !== 'undefined') {
        window.omegaPlanner51015 = planner;
        window.MissionPlannerOmega51015 = MissionPlannerOmega51015;
    }
    return planner;
}

if (typeof window !== 'undefined') {
    window.MissionPlannerOmega51015 = MissionPlannerOmega51015;
    window.mountOmegaPlanner = mountOmegaPlanner;
    window.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('omega-planner-mount-51015')) {
            window.omegaPlanner51015 = new MissionPlannerOmega51015('omega-planner-mount-51015');
        }
    });
}
