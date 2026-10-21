import assert from 'node:assert';

// Migration function to be embedded into the course runtime
export function migrateLocalStorage(rawOldData, rawNewData) {
  const MODULE_ID_MAP = [
    'start', 'awareness', 'faith', 'prayer', 'scripture',
    'perseverance', 'prevention', 'love', 'reward', 'master'
  ];

  let oldData = {};
  if (rawOldData) {
    try {
      oldData = typeof rawOldData === 'string' ? JSON.parse(rawOldData) : rawOldData;
    } catch (e) {
      oldData = {};
    }
  }

  let newData = {};
  if (rawNewData) {
    try {
      newData = typeof rawNewData === 'string' ? JSON.parse(rawNewData) : rawNewData;
    } catch (e) {
      newData = {};
    }
  }

  // Ensure newData has an object structure for each module
  MODULE_ID_MAP.forEach((modId, idx) => {
    if (!newData[modId]) {
      newData[modId] = { notes: '', completed: false };
    }
  });

  // Migrate completion status from old data
  if (oldData.completed && typeof oldData.completed === 'object') {
    Object.entries(oldData.completed).forEach(([idxStr, isDone]) => {
      const idx = parseInt(idxStr, 10);
      if (!isNaN(idx) && idx >= 0 && idx < MODULE_ID_MAP.length && isDone) {
        const modId = MODULE_ID_MAP[idx];
        newData[modId].completed = true;
      }
    });
  }

  // Migrate questions answers from old data
  if (oldData.answers && typeof oldData.answers === 'object') {
    MODULE_ID_MAP.forEach((modId, idx) => {
      const notesParts = [];
      // If new data already has notes, keep them
      if (newData[modId].notes && newData[modId].notes.trim()) {
        notesParts.push(newData[modId].notes.trim());
      }

      // Check for m{idx}_q1, m{idx}_q2, m{idx}_q3
      for (let q = 1; q <= 5; q++) {
        const key = `m${idx}_q${q}`;
        if (oldData.answers[key] && typeof oldData.answers[key] === 'string' && oldData.answers[key].trim()) {
          const ans = oldData.answers[key].trim();
          if (!notesParts.some(p => p.includes(ans))) {
            notesParts.push(`[Odpowiedź ${q}]: ${ans}`);
          }
        }
      }

      // Also check if notes were directly keyed by modId
      if (oldData.answers[modId] && typeof oldData.answers[modId] === 'string' && oldData.answers[modId].trim()) {
        const directNote = oldData.answers[modId].trim();
        if (!notesParts.some(p => p.includes(directNote))) {
          notesParts.push(directNote);
        }
      }

      if (notesParts.length > 0) {
        newData[modId].notes = notesParts.join('\n\n');
      }
    });
  }

  return newData;
}

// Run unit tests
console.log('Testing localStorage migration...');

// Test Case 1: Empty old data -> defaults initialized
const res1 = migrateLocalStorage(null, null);
assert.strictEqual(Object.keys(res1).length, 10);
assert.strictEqual(res1.start.completed, false);
assert.strictEqual(res1.start.notes, '');
console.log('✔ Test 1: Empty state initialized successfully');

// Test Case 2: Old data with completion & answers
const oldSample = {
  answers: {
    m0_q1: 'Mój problem to przewlekły stres',
    m0_q2: 'Odbiera mi sen i spokój',
    m1_q1: 'Wymówka 1: brak czasu',
    quiz_0_0: 1
  },
  completed: {
    '0': true,
    '1': true
  }
};
const res2 = migrateLocalStorage(JSON.stringify(oldSample), null);
assert.strictEqual(res2.start.completed, true);
assert.strictEqual(res2.awareness.completed, true);
assert.strictEqual(res2.faith.completed, false);
assert.ok(res2.start.notes.includes('Mój problem to przewlekły stres'));
assert.ok(res2.start.notes.includes('Odbiera mi sen i spokój'));
assert.ok(res2.awareness.notes.includes('Wymówka 1: brak czasu'));
console.log('✔ Test 2: Migration preserves old questions, notes, and completion statuses');

// Test Case 3: Preserves existing new notes without overwriting
const existingNew = {
  start: { notes: 'Już istniejąca notatka w nowym formacie', completed: true }
};
const res3 = migrateLocalStorage(JSON.stringify(oldSample), JSON.stringify(existingNew));
assert.ok(res3.start.notes.includes('Już istniejąca notatka w nowym formacie'));
assert.ok(res3.start.notes.includes('Mój problem to przewlekły stres'));
assert.strictEqual(res3.start.completed, true);
console.log('✔ Test 3: Migration merges without data loss');

console.log('✅ ALL MIGRATION TESTS PASSED!');
