/**
 * ==============================================================================
 * 🏛️ CHRISTIAN CULTURE | LUMI MESS — PLANER OMEGA + WEBCRYPTO / WEBAUTHN BIOMETRY
 * ==============================================================================
 * Architektura bezpieczeństwa: Autoryzacja biometryczna wejścia do Pokoju Agentów
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

export class MissionPlannerOmegaBiometric {
    constructor(containerId) {
        this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
        this.isAuthenticated = (typeof sessionStorage !== 'undefined') &&
            (sessionStorage.getItem('cc_biometric_auth') === 'true' || sessionStorage.getItem('cc_commander_biometric_unlocked') === 'true');
        this.state = this.loadState();
        this.init();
    }

    loadState() {
        try {
            if (typeof localStorage !== 'undefined') {
                const saved = localStorage.getItem('cc_planner_omega_51015');
                if (saved) return JSON.parse(saved);
            }
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

        if (!this.isAuthenticated) {
            // EKRAN BRAMY BIOMETRYCZNEJ
            this.container.innerHTML = `
                <div style="background: #0B0B0B; border: 2px solid #D4AF37; border-radius: 16px; padding: 30px; color: #fff; font-family: 'Cinzel', serif, sans-serif; max-width: 450px; text-align: center; box-shadow: 0 8px 30px rgba(212, 175, 55, 0.3); margin: auto;">
                    <div style="font-size: 36px; margin-bottom: 12px;">🛡️</div>
                    <h2 style="color: #D4AF37; font-size: 16px; letter-spacing: 2px; margin-bottom: 8px;">STREFA CHRONIONA L0</h2>
                    <p style="color: #aaa; font-size: 12px; font-family: sans-serif; margin-bottom: 20px;">Wejście do Pokoju Agentów wymaga uwierzytelnienia biometrycznego (Passkey / WebAuthn).</p>
                    <button id="bio-auth-btn" type="button" style="background: #D4AF37; color: #000; border: none; border-radius: 8px; padding: 12px 20px; font-weight: bold; cursor: pointer; font-size: 12px; letter-spacing: 1px; width: 100%; min-height: 44px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; touch-action: manipulation;">WEJDŹ PRZEZ BIOMETRIĘ 🧬</button>
                    <div id="bio-status" style="margin-top: 12px; font-size: 11px; min-height: 18px; color: #e74c3c; font-family: sans-serif;"></div>
                </div>
            `;
            return;
        }

        // GŁÓWNY INTERFEJS PLANERA PO AUTORYZACJI
        this.container.innerHTML = `
            <div class="omega-planner-bio" style="background: #0B0B0B; border: 2px solid #D4AF37; border-radius: 16px; padding: 20px; color: #fff; font-family: 'Cinzel', serif, sans-serif; max-width: 600px; width: 100%; box-sizing: border-box; box-shadow: 0 8px 30px rgba(212, 175, 55, 0.2); margin: 0 auto;">
                
                <!-- NAGŁÓWEK -->
                <div style="border-bottom: 2px solid #D4AF37; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                    <div>
                        <h2 style="margin: 0; color: #D4AF37; font-size: 16px; letter-spacing: 2px; font-weight: 800;">🏛️ POKÓJ AGENTÓW &amp; PLANER MISYJNY OMEGA 5.10.15</h2>
                        <p style="margin: 4px 0 0 0; color: #2ecc71; font-size: 10px; font-family: sans-serif; font-weight: 600;">🔒 Biometria Zweryfikowana (Sesja Bezpieczna)</p>
                    </div>
                    <button type="button" onclick="window.omegaPlannerBio?.lockRoom() || window.omegaPlanner51015?.lockRoom()" style="background: #222; border: 1px solid #444; color: #e74c3c; border-radius: 6px; padding: 6px 12px; cursor: pointer; font-size: 11px; font-weight: 700; min-height: 36px; touch-action: manipulation;">ZABLOKUJ 🔒</button>
                </div>

                <!-- WIZJA WIECZNOŚCI -->
                <div style="background: #141414; border: 1px solid #333; border-left: 4px solid #D4AF37; padding: 10px 12px; border-radius: 6px; margin-bottom: 16px;">
                    <strong style="color: #D4AF37; font-size: 11px; display: block; margin-bottom: 4px;">🌌 CEL OSTATECZNY (WIECZNOŚĆ):</strong>
                    <p style="margin: 0; font-size: 12px; font-style: italic; color: #ddd; line-height: 1.45;">${escapePlannerHtml(this.state.eternityVision)}</p>
                </div>

                <!-- HORYZONTY CZASOWE (DRABINA) -->
                <details style="background: #121212; border: 1px solid #333; border-radius: 6px; padding: 10px 12px; margin-bottom: 16px;">
                    <summary style="color: #D4AF37; font-size: 12px; cursor: pointer; font-weight: bold; user-select: none;">⏳ Drabina Czasu (30 lat -> Końcówka 2026)</summary>
                    <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 6px; font-size: 11px; font-family: sans-serif; line-height: 1.4;">
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
                <form id="omega-form-bio" style="background: #141414; padding: 12px; border-radius: 8px; border: 1px solid #333; display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
                    <input type="text" id="om-title" placeholder="Nazwa misji / zadania..." required style="background: #1a1a1a; border: 1px solid #444; border-radius: 4px; padding: 9px 12px; color: #fff; font-size: 12px; outline: none; font-family: sans-serif;">
                    
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <select id="om-cycle" style="flex: 1; min-width: 140px; background: #1a1a1a; border: 1px solid #444; border-radius: 4px; padding: 8px 10px; color: #D4AF37; font-size: 11px; outline: none;">
                            <option value="hourly">Cykl: Godzinowy</option>
                            <option value="daily" selected>Cykl: Dzienne</option>
                            <option value="weekly">Cykl: Tygodniowe</option>
                            <option value="monthly">Cykl: Miesięczne</option>
                        </select>
                        <select id="om-tier" style="background: #1a1a1a; border: 1px solid #444; border-radius: 4px; padding: 8px 10px; color: #fff; font-size: 11px; outline: none;">
                            <option value="5">Tier 5 (Natychmiast)</option>
                            <option value="10">Tier 10 (Krótkie)</option>
                            <option value="15" selected>Tier 15 (Głęboka sesja)</option>
                        </select>
                    </div>
                    <button type="submit" style="background: #D4AF37; color: #000; border: none; border-radius: 4px; padding: 10px 14px; font-weight: bold; cursor: pointer; font-size: 11px; letter-spacing: 1px; min-height: 44px; touch-action: manipulation;">DODAJ DO PLANERA 5.10.15</button>
                </form>

                <!-- LISTA ZADAŃ (STATUSY: W TRAKCIE / NIEZREALIZOWANE / ACK) -->
                <div style="font-size: 12px; color: #D4AF37; margin-bottom: 6px; font-weight: bold; display: flex; justify-content: space-between; align-items: center;">
                    <span>📋 REJESTR ZADAŃ 5.10.15:</span>
                    <span style="font-size: 10px; color: #888; font-family: sans-serif;">Łącznie: ${this.state.tasks.length}</span>
                </div>
                <div id="om-task-list" style="max-height: 220px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px;">
                    ${this.state.tasks.length === 0 ? '<p style="color: #666; font-size: 11px; text-align: center; margin: 10px 0; font-family: sans-serif;">Brak aktywnych misji w rejestrze.</p>' : ''}
                    ${this.state.tasks.map((t, idx) => `
                        <div style="background: #141414; border-left: 3px solid ${t.status === 'DONE' ? '#2ecc71' : t.status === 'IN_PROGRESS' ? '#f1c40f' : '#e74c3c'}; padding: 8px 10px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; font-size: 11px; gap: 8px;">
                            <div style="flex: 1; min-width: 0;">
                                <strong style="color: #fff; display: block; overflow-wrap: anywhere; font-family: sans-serif;">${escapePlannerHtml(t.title)}</strong>
                                <div style="color: #888; font-size: 9px; margin-top: 2px; font-family: sans-serif;">Cykl: [${escapePlannerHtml(t.cycle.toUpperCase())}] | Blok: ${escapePlannerHtml(t.tier)} min | Status: <span style="font-weight: 700; color: ${t.status === 'DONE' ? '#2ecc71' : t.status === 'IN_PROGRESS' ? '#f1c40f' : '#e74c3c'}">${t.status}</span></div>
                            </div>
                            <div style="display: flex; gap: 4px; align-items: center; flex-shrink: 0;">
                                <button type="button" onclick="window.omegaPlannerBio?.toggleStatus(${idx}) || window.omegaPlanner51015?.toggleStatus(${idx})" title="Zmień status" style="background: #222; border: 1px solid #444; color: #D4AF37; border-radius: 4px; min-width: 44px; min-height: 44px; cursor: pointer; font-size: 12px; display: inline-flex; align-items: center; justify-content: center; touch-action: manipulation;">🔄</button>
                                <button type="button" onclick="window.omegaPlannerBio?.removeTask(${idx}) || window.omegaPlanner51015?.removeTask(${idx})" title="Usuń" style="background: #222; border: 1px solid #444; color: #e74c3c; border-radius: 4px; min-width: 44px; min-height: 44px; cursor: pointer; font-size: 16px; display: inline-flex; align-items: center; justify-content: center; touch-action: manipulation;">&times;</button>
                            </div>
                        </div>
                    `).join('')}
                </div>

            </div>
        `;
    }

    attachEvents() {
        if (!this.container) return;

        if (!this.isAuthenticated) {
            const btn = this.container.querySelector('#bio-auth-btn');
            if (btn) {
                btn.addEventListener('click', () => this.authenticateBiometric());
            }
            return;
        }

        const form = this.container.querySelector('#omega-form-bio') || this.container.querySelector('#omega-form-51015');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const titleInput = this.container.querySelector('#om-title');
                const cycleSelect = this.container.querySelector('#om-cycle');
                const tierSelect = this.container.querySelector('#om-tier');

                if (titleInput && titleInput.value.trim()) {
                    this.state.tasks.push({
                        title: titleInput.value.trim(),
                        cycle: cycleSelect?.value || 'daily',
                        tier: tierSelect?.value || '15',
                        status: 'PENDING',
                        timestamp: new Date().toISOString()
                    });
                    this.save();
                    this.render();
                    this.attachEvents();
                }
            });
        }
    }

    async authenticateBiometric() {
        const statusEl = this.container ? this.container.querySelector('#bio-status') : null;
        try {
            if (typeof window === 'undefined' || !window.PublicKeyCredential) {
                throw new Error("Twoja przeglądarka nie wspiera standardu WebAuthn / Passkeys.");
            }

            if (statusEl) {
                statusEl.style.color = "#D4AF37";
                statusEl.textContent = "Trwa weryfikacja biometryczna (odcisk palca / FaceID / Windows Hello)...";
            }

            // WebAuthn Passkey Challenge (Gabinet L0)
            const publicKey = {
                challenge: new Uint8Array([21, 31, 105, 34, 45, 67, 89, 90]),
                rp: { name: "Christian Culture - Pokój Agentów" },
                user: {
                    id: new Uint8Array([1, 2, 3, 4]),
                    name: "Cezary Rogowski (L0)",
                    displayName: "L0"
                },
                pubKeyCredParams: [{ alg: -7, type: "public-key" }, { alg: -257, type: "public-key" }],
                authenticatorSelection: {
                    authenticatorAttachment: "platform",
                    userVerification: "preferred"
                },
                timeout: 60000,
                attestation: "direct"
            };

            // Wywołanie autentykacji biometrycznej urządzenia z płynną obsługą istniejącego poświadczenia
            try {
                await navigator.credentials.create({ publicKey });
            } catch (createErr) {
                if ((createErr.name === 'InvalidStateError' || createErr.name === 'ConstraintError') && navigator.credentials?.get) {
                    await navigator.credentials.get({
                        publicKey: {
                            challenge: publicKey.challenge,
                            timeout: 60000,
                            userVerification: "preferred"
                        }
                    });
                } else {
                    throw createErr;
                }
            }

            this.isAuthenticated = true;
            try {
                sessionStorage.setItem('cc_biometric_auth', 'true');
                sessionStorage.setItem('cc_commander_biometric_unlocked', 'true');
            } catch(e) {}
            this.render();
            this.attachEvents();

            // Synchronizacja widoku głównego Pokoju Agentów jeśli otwarty
            if (typeof window !== 'undefined' && typeof window.updateCommanderBiometricView === 'function') {
                window.updateCommanderBiometricView();
            }
        } catch (err) {
            console.error('WebAuthn biometric error:', err);
            if (statusEl) {
                statusEl.style.color = "#e74c3c";
                if (err.name === 'NotAllowedError') {
                    statusEl.textContent = "Autoryzacja biometryczna anulowana przez użytkownika.";
                } else {
                    statusEl.textContent = err.message || "Autoryzacja biometryczna anulowana lub nieobsługiwana na tym urządzeniu.";
                }
            }
        }
    }

    lockRoom() {
        this.isAuthenticated = false;
        try {
            sessionStorage.removeItem('cc_biometric_auth');
            sessionStorage.removeItem('cc_commander_biometric_unlocked');
        } catch(e) {}
        this.render();
        this.attachEvents();
        if (typeof window !== 'undefined' && typeof window.updateCommanderBiometricView === 'function') {
            window.updateCommanderBiometricView();
        }
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
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('cc_planner_omega_51015', JSON.stringify(this.state));
            }
        } catch(e) {}
    }
}

// Alias dla zgodności
export const MissionPlannerOmega51015 = MissionPlannerOmegaBiometric;

export function mountOmegaPlanner(containerId = 'omega-planner-mount-bio') {
    let el = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    if (!el) {
        el = document.getElementById('omega-planner-mount-51015');
    }
    if (!el) return null;
    const planner = new MissionPlannerOmegaBiometric(el);
    if (typeof window !== 'undefined') {
        window.omegaPlannerBio = planner;
        window.omegaPlanner51015 = planner;
        window.MissionPlannerOmegaBiometric = MissionPlannerOmegaBiometric;
        window.MissionPlannerOmega51015 = MissionPlannerOmegaBiometric;
    }
    return planner;
}

if (typeof window !== 'undefined') {
    window.MissionPlannerOmegaBiometric = MissionPlannerOmegaBiometric;
    window.MissionPlannerOmega51015 = MissionPlannerOmegaBiometric;
    window.mountOmegaPlanner = mountOmegaPlanner;
    window.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('omega-planner-mount-bio')) {
            window.omegaPlannerBio = new MissionPlannerOmegaBiometric('omega-planner-mount-bio');
            window.omegaPlanner51015 = window.omegaPlannerBio;
        } else if (document.getElementById('omega-planner-mount-51015')) {
            window.omegaPlannerBio = new MissionPlannerOmegaBiometric('omega-planner-mount-51015');
            window.omegaPlanner51015 = window.omegaPlannerBio;
        }
    });
}
