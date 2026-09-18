const assert = require('assert');
const request = require('supertest');
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
      assert(res.text.includes('Apex Tester Advanced'), 'Home page should display app header');
      assert(res.text.includes('Add a new task'), 'Home page should include task input');
      assert(res.text.includes('UTC'), 'Home page should reference UTC clock');
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

  // PATCH /api/tasks/:id completes the task
  await request(app)
    .patch(`/api/tasks/${created.id}`)
    .send({ status: 'done' })
    .expect(200)
    .then((res) => {
      assert.strictEqual(res.body.status, 'done');
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
      assert.deepStrictEqual(res.body, { tasks: [] });
    });

  // DELETE /api/tasks/:id not found
  await request(app)
    .delete('/api/tasks/99999')
    .expect(404);

  console.log('All tests passed');
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
