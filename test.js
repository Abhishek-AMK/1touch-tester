const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const request = require('supertest');

// Use a temporary data directory so tests do not clobber real tasks.json.
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'apex-mixed-upgrade-test-'));
process.env.DATA_DIR = tmpDir;

// Require the app after setting DATA_DIR so it loads/saves from the temp dir.
const app = require('./index.js');

async function runTests() {
  // Health endpoint
  await request(app)
    .get('/health')
    .expect(200)
    .expect('Content-Type', /json/)
    .then((res) => {
      assert.deepStrictEqual(res.body, { ok: true });
    });

  // Home page
  await request(app)
    .get('/')
    .expect(200)
    .expect('Content-Type', /html/)
    .then((res) => {
      assert(res.text.includes('Apex-Mixed-Upgrade'), 'Home page should display app header');
      assert(res.text.includes('Add a new task'), 'Home page should include task input');
      assert(res.text.includes('UTC'), 'Home page should reference UTC clock');
      assert(res.text.includes('distraction-free'), 'Home page should include GTM tagline');
      assert(res.text.includes('Open'), 'Home page should include open filter');
      assert(res.text.includes('Done'), 'Home page should include done filter');
    });

  // GET /api/tasks starts empty
  await request(app)
    .get('/api/tasks')
    .expect(200)
    .then((res) => {
      assert.deepStrictEqual(res.body, { tasks: [] });
    });

  // POST /api/tasks
  const created = await request(app)
    .post('/api/tasks')
    .send({ title: 'Test task one' })
    .expect(201)
    .expect('Content-Type', /json/)
    .then((res) => res.body);

  assert.strictEqual(created.title, 'Test task one');
  assert.strictEqual(created.status, 'open');
  assert.ok(created.createdAt);

  // GET /api/tasks returns the task
  await request(app)
    .get('/api/tasks')
    .expect(200)
    .then((res) => {
      assert.strictEqual(res.body.tasks.length, 1);
      assert.strictEqual(res.body.tasks[0].title, 'Test task one');
    });

  // POST /api/tasks rejects empty title
  await request(app)
    .post('/api/tasks')
    .send({ title: '   ' })
    .expect(400);

  // Create more tasks for filter tests
  const second = await request(app)
    .post('/api/tasks')
    .send({ title: 'Test task two' })
    .expect(201)
    .then((res) => res.body);

  // PATCH /api/tasks/:id completes the task
  await request(app)
    .patch(`/api/tasks/${created.id}`)
    .send({ status: 'done' })
    .expect(200)
    .then((res) => {
      assert.strictEqual(res.body.status, 'done');
    });

  // Filter open tasks
  await request(app)
    .get('/api/tasks?status=open')
    .expect(200)
    .then((res) => {
      assert.strictEqual(res.body.tasks.length, 1);
      assert.strictEqual(res.body.tasks[0].id, second.id);
    });

  // Filter done tasks
  await request(app)
    .get('/api/tasks?status=done')
    .expect(200)
    .then((res) => {
      assert.strictEqual(res.body.tasks.length, 1);
      assert.strictEqual(res.body.tasks[0].id, created.id);
    });

  // Filter all tasks (invalid filter returns all)
  await request(app)
    .get('/api/tasks?status=invalid')
    .expect(200)
    .then((res) => {
      assert.strictEqual(res.body.tasks.length, 2);
    });

  // PATCH /api/tasks/:id invalid status
  await request(app)
    .patch(`/api/tasks/${created.id}`)
    .send({ status: 'invalid' })
    .expect(400);

  // PATCH /api/tasks/:id not found
  await request(app)
    .patch('/api/tasks/99999')
    .send({ status: 'done' })
    .expect(404);

  // DELETE /api/tasks/:id
  await request(app)
    .delete(`/api/tasks/${created.id}`)
    .expect(204);

  await request(app)
    .get('/api/tasks')
    .expect(200)
    .then((res) => {
      assert.strictEqual(res.body.tasks.length, 1);
      assert.strictEqual(res.body.tasks[0].id, second.id);
    });

  // DELETE /api/tasks/:id not found
  await request(app)
    .delete('/api/tasks/99999')
    .expect(404);

  // Persistence test: simulate restart by re-requiring the module in a fresh process
  // Write the current state to disk, then load it with a new require.
  const tasksFile = path.join(tmpDir, 'tasks.json');
  assert.ok(fs.existsSync(tasksFile), 'tasks.json should be persisted');

  // Remove the module cache and require again with same DATA_DIR.
  delete require.cache[require.resolve('./index.js')];
  const restartedApp = require('./index.js');

  await request(restartedApp)
    .get('/api/tasks')
    .expect(200)
    .then((res) => {
      assert.strictEqual(res.body.tasks.length, 1);
      assert.strictEqual(res.body.tasks[0].title, 'Test task two');
    });

  // PATCH reopen
  await request(restartedApp)
    .patch(`/api/tasks/${second.id}`)
    .send({ status: 'open' })
    .expect(200)
    .then((res) => {
      assert.strictEqual(res.body.status, 'open');
    });

  console.log('All tests passed');
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
