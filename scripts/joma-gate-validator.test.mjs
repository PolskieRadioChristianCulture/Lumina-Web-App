import { validateAgentTask } from './joma-gate-validator.mjs';

function runTests() {
  console.log('--- Test 1: Pusty pakiet (Brak dowodu) ---');
  const invalidTask = {
    taskId: 'TASK-001',
    agentId: 'CC-A05-01',
    description: 'Tylko wpis do tablicy'
  };
  const res1 = validateAgentTask(invalidTask);
  console.log('Status:', res1.status, '| Valid:', res1.isValid);
  if (res1.isValid !== false || res1.status !== 'UNVERIFIED') {
    throw new Error('Test 1 FAIL: Powinno być UNVERIFIED');
  }

  console.log('--- Test 2: Fałszywy sukces z samą domeną główną ---');
  const genericUrlTask = {
    taskId: 'TASK-002',
    agentId: 'CC-A05-01',
    evidenceUrl: 'https://polskieradio.cc/'
  };
  const res2 = validateAgentTask(genericUrlTask);
  console.log('Status:', res2.status, '| Brakujące bramki:', res2.missingGates);
  if (!res2.missingGates.includes('T09')) {
    throw new Error('Test 2 FAIL: Powinno odrzucić samą domenę główną bez ścieżki zasobu');
  }

  console.log('--- Test 3: Prawidłowy pakiet z twardym dowodem i ACK ---');
  const validTask = {
    taskId: 'TASK-003',
    agentId: 'CC-A05-01',
    evidenceUrl: 'https://polskieradio.cc/akademia/kurscodzienny/dzien-19',
    checkedAt: '2026-10-19T06:05:00Z',
    missionControlAck: true,
    requiresNotification: true,
    notificationStatus: 'CONFIRMED'
  };
  const res3 = validateAgentTask(validTask);
  console.log('Status:', res3.status, '| Valid:', res3.isValid);
  if (res3.isValid !== true || res3.status !== 'VERIFIED') {
    throw new Error('Test 3 FAIL: Prawidłowy pakiet powinien uzyskać status VERIFIED');
  }

  console.log('✅ Wszystkie testy walidatora bramek przeszły pomyślnie (3/3 PASS).');
}

runTests();
