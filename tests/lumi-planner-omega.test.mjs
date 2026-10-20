import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Window } from 'happy-dom';
import { MissionPlannerOmega51015 } from '../components/lumi-planner-omega.js';

test('MissionPlannerOmega51015 renders eternity vision, time ladder, and manages 5.10.15 tasks', () => {
    const w = new Window();
    const container = w.document.createElement('div');
    container.id = 'omega-planner-mount-51015';
    w.document.body.append(container);

    const storage = new Map();
    const mockStorage = {
        getItem: k => storage.get(k) || null,
        setItem: (k, v) => storage.set(k, String(v)),
        removeItem: k => storage.delete(k)
    };
    global.localStorage = mockStorage;
    global.sessionStorage = mockStorage;

    // 1. Initial locked state: biometric gate is rendered
    const lockedPlanner = new MissionPlannerOmega51015(container);
    assert.ok(container.innerHTML.includes('STREFA CHRONIONA L0'));
    assert.ok(container.innerHTML.includes('WEJDŹ PRZEZ BIOMETRIĘ 🧬'));
    assert.ok(container.innerHTML.includes('id="bio-auth-btn"'));
    assert.ok(container.innerHTML.includes('id="bio-status"'));

    // 2. Authenticated state: full planner is rendered
    mockStorage.setItem('cc_biometric_auth', 'true');
    const planner = new MissionPlannerOmega51015(container);
    assert.ok(container.innerHTML.includes('PLANER MISYJNY OMEGA 5.10.15'));
    assert.ok(container.innerHTML.includes('Wieczne Królestwo Boże'));
    assert.ok(container.innerHTML.includes('Drabina Czasu (30 lat'));
    assert.ok(container.innerHTML.includes('Tier 5'));
    assert.ok(container.innerHTML.includes('Tier 10'));
    assert.ok(container.innerHTML.includes('Tier 15'));

    // Add a test task directly
    planner.state.tasks.push({
        title: 'Audyt transmisji live',
        cycle: 'daily',
        tier: '15',
        status: 'PENDING',
        timestamp: new Date().toISOString()
    });
    planner.save();
    planner.render();

    assert.ok(container.innerHTML.includes('Audyt transmisji live'));
    assert.ok(container.innerHTML.includes('PENDING'));

    // Toggle status
    planner.toggleStatus(0);
    assert.equal(planner.state.tasks[0].status, 'IN_PROGRESS');

    planner.toggleStatus(0);
    assert.equal(planner.state.tasks[0].status, 'DONE');

    // Remove task
    planner.removeTask(0);
    assert.equal(planner.state.tasks.length, 0);

    // Lock room
    planner.lockRoom();
    assert.equal(planner.isAuthenticated, false);
    assert.ok(container.innerHTML.includes('STREFA CHRONIONA L0'));

    w.happyDOM.abort();
});

test('all six canonical Lumina surfaces include biometric fingerprint lock overlay and planner mount', () => {
    const pages = [
        'lumina.html',
        'lumina-profile.html',
        'lumina-tablica.html',
        'lumina-tablica-light.html',
        'lumina.cezaryrgowski.html',
        'lumina.wiolettarogowska.html'
    ];

    for (const page of pages) {
        const html = readFileSync(page, 'utf8');

        // Biometric fingerprint overlay elements
        assert.ok(html.includes('id="commanderBiometricOverlay"'), `${page}: missing commanderBiometricOverlay`);
        assert.ok(html.includes('id="commanderFingerprintPad"'), `${page}: missing commanderFingerprintPad`);
        assert.ok(html.includes('id="commanderBiometricStatus"'), `${page}: missing commanderBiometricStatus`);
        assert.ok(html.includes('id="bio-auth-btn"'), `${page}: missing bio-auth-btn`);
        assert.ok(html.includes('id="bio-status"'), `${page}: missing bio-status`);
        assert.ok(html.includes('STREFA CHRONIONA L0'), `${page}: missing STREFA CHRONIONA L0`);
        assert.ok(html.includes('fa-fingerprint'), `${page}: missing fingerprint icon`);
        assert.ok(html.includes('verifyCommanderBiometric()'), `${page}: missing verifyCommanderBiometric call`);

        // Unlocked room and sub-tabs
        assert.ok(html.includes('id="commanderRoomContent"'), `${page}: missing commanderRoomContent`);
        assert.ok(html.includes('id="btnCommanderSubTabChat"'), `${page}: missing btnCommanderSubTabChat`);
        assert.ok(html.includes('id="btnCommanderSubTabPlanner"'), `${page}: missing btnCommanderSubTabPlanner`);
        assert.ok(html.includes('id="omega-planner-mount-51015"'), `${page}: missing omega-planner-mount-51015`);
        assert.ok(html.includes('id="omega-planner-mount-bio"'), `${page}: missing omega-planner-mount-bio`);
        assert.ok(html.includes('lockCommanderBiometric()'), `${page}: missing lockCommanderBiometric`);

        // Functions defined & WebAuthn create call
        assert.ok(html.includes('function verifyCommanderBiometric()'), `${page}: missing verifyCommanderBiometric function`);
        assert.ok(html.includes('navigator.credentials?.create'), `${page}: missing navigator.credentials create`);
        assert.ok(html.includes('function lockCommanderBiometric()'), `${page}: missing lockCommanderBiometric function`);
        assert.ok(html.includes('function switchCommanderSubTab('), `${page}: missing switchCommanderSubTab function`);
        assert.ok(html.includes('function initCommanderPlanner()'), `${page}: missing initCommanderPlanner function`);
    }
});
