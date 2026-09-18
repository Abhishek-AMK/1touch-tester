const assert = require('assert');
const request = require('supertest');
const app = require('./index.js');

async function runTests() {
  await request(app)
    .get('/health')
    .expect(200)
    .expect('Content-Type', /json/)
    .then((res) => {
      assert.deepStrictEqual(res.body, { ok: true });
    });

  await request(app)
    .get('/')
    .expect(200)
    .expect('Content-Type', /html/)
    .then((res) => {
      assert(res.text.includes('1Touch tester'), 'Home page should display "1Touch tester"');
      assert(res.text.includes('Current UTC time:'), 'Home page should display current UTC time label');
    });

  console.log('All tests passed');
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
