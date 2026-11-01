const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');

process.env.SKIP_DB_INIT = 'true';
process.env.PORT = '5002';
const app = require('../src/index');

test('GET /api/info returns library architecture metadata', async (t) => {
  const server = app.listen(5002);

  await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:5002/api/info', (res) => {
      assert.equal(res.statusCode, 200);
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const json = JSON.parse(data);
        assert.equal(json.architecture, '3-Tier Cloud Architecture');
        assert.equal(json.application, 'LibriCore - Cloud Library Management System');
        assert.equal(json.tiers.length, 3);
        server.close(resolve);
      });
    }).on('error', (err) => {
      server.close();
      reject(err);
    });
  });
});
