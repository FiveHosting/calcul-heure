const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const port = 43000 + Math.floor(Math.random() * 1000);
const dbPath = path.join(os.tmpdir(), `calcul-heures-km-${Date.now()}.db`);
const child = spawn(process.execPath, ['server.js'], {
  cwd: path.resolve(__dirname, '..'),
  env: { ...process.env, PORT: String(port), DB_PATH: dbPath, NODE_ENV: 'test', JWT_SECRET: 'integration-test-secret-long-enough-for-jwt-123456' },
  stdio: ['ignore', 'pipe', 'pipe']
});

async function stop() {
  if (child.exitCode === null) {
    await new Promise((resolve) => {
      child.once('exit', resolve);
      child.kill('SIGINT');
    });
  }
  fs.rmSync(dbPath, { force: true });
}

function waitForServer() {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Le serveur de test n’a pas démarré.')), 8000);
    child.stdout.on('data', (chunk) => {
      if (chunk.toString().includes('Serveur démarré')) { clearTimeout(timeout); resolve(); }
    });
    child.on('exit', (code) => { clearTimeout(timeout); reject(new Error(`Le serveur de test s’est arrêté (${code}).`)); });
  });
}

async function request(route, options = {}) {
  const response = await fetch(`http://127.0.0.1:${port}${route}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  return { response, body: await response.json() };
}

(async () => {
  try {
    await waitForServer();
    const username = `km_test_${Date.now()}`;
    const register = await request('/api/auth/register', { method: 'POST', body: JSON.stringify({ username, email: `${username}@example.test`, password: 'motdepasse-test-solide' }) });
    assert.equal(register.response.status, 201);
    const cookie = register.response.headers.get('set-cookie').split(';')[0];

    const createdEntry = await request('/api/entries', { method: 'POST', headers: { Cookie: cookie }, body: JSON.stringify({ date: '2026-10-01', startTime: '09:00', endTime: '12:00', hourlyRate: 20, description: 'Mission client' }) });
    assert.equal(createdEntry.response.status, 201);
    const entryId = createdEntry.body.entry.id;
    const updatedEntry = await request(`/api/entries/${entryId}`, { method: 'PUT', headers: { Cookie: cookie }, body: JSON.stringify({ date: '2026-10-01', startTime: '09:00', endTime: '13:00', hourlyRate: 20, description: 'Mission prolongée' }) });
    assert.equal(updatedEntry.response.status, 200);
    const duplicatedEntry = await request(`/api/entries/${entryId}/duplicate`, { method: 'POST', headers: { Cookie: cookie }, body: JSON.stringify({ date: '2026-10-02' }) });
    assert.equal(duplicatedEntry.response.status, 201);
    const bulkEntries = await request('/api/entries/bulk', { method: 'POST', headers: { Cookie: cookie }, body: JSON.stringify({ date: '2026-10-03', entries: [{ startTime: '09:00', endTime: '10:00', hourlyRate: 20, description: '' }, { startTime: '14:00', endTime: '16:00', hourlyRate: 20, description: 'Réunion' }] }) });
    assert.equal(bulkEntries.response.status, 201);
    const listedEntries = await request('/api/entries', { headers: { Cookie: cookie } });
    assert.equal(listedEntries.response.status, 200);
    assert.equal(listedEntries.body.length, 4);
    const entryDeleted = await request(`/api/entries/${entryId}`, { method: 'DELETE', headers: { Cookie: cookie } });
    assert.equal(entryDeleted.response.status, 200);

    const invalid = await request('/api/kilometers', { method: 'POST', headers: { Cookie: cookie }, body: JSON.stringify({ date: 'bad', kilometers: 0, reason: '' }) });
    assert.equal(invalid.response.status, 400);

    const created = await request('/api/kilometers', { method: 'POST', headers: { Cookie: cookie }, body: JSON.stringify({ date: '2026-10-01', kilometers: 2.5, reason: 'Rendez-vous client', source: 'gps', startAddress: 'Départ', endAddress: 'Arrivée' }) });
    assert.equal(created.response.status, 201);
    assert.equal(created.body.trip.kilometers, 2.5);
    assert.equal(created.body.trip.startAddress, 'Départ');

    const listed = await request('/api/kilometers', { headers: { Cookie: cookie } });
    assert.equal(listed.response.status, 200);
    assert.equal(listed.body.length, 1);
    assert.equal(listed.body[0].reason, 'Rendez-vous client');

    const secondUser = `km_other_${Date.now()}`;
    const secondRegister = await request('/api/auth/register', { method: 'POST', body: JSON.stringify({ username: secondUser, email: `${secondUser}@example.test`, password: 'motdepasse-test-solide' }) });
    const secondCookie = secondRegister.response.headers.get('set-cookie').split(';')[0];
    const forbiddenDelete = await request(`/api/kilometers/${created.body.trip.id}`, { method: 'DELETE', headers: { Cookie: secondCookie } });
    assert.equal(forbiddenDelete.response.status, 404);

    const deleted = await request(`/api/kilometers/${created.body.trip.id}`, { method: 'DELETE', headers: { Cookie: cookie } });
    assert.equal(deleted.response.status, 200);
    const afterDelete = await request('/api/kilometers', { headers: { Cookie: cookie } });
    assert.deepEqual(afterDelete.body, []);

    await request('/api/kilometers', { method: 'POST', headers: { Cookie: cookie }, body: JSON.stringify({ date: '2026-10-01', kilometers: 1.2, reason: 'Trajet à effacer' }) });
    const accountDeleted = await request('/api/auth/me', { method: 'DELETE', headers: { Cookie: cookie } });
    assert.equal(accountDeleted.response.status, 200);
    console.log('✓ API : entrées, kilomètres, isolation, suppression et effacement du compte validés.');
  } finally {
    await stop();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
