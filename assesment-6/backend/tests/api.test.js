const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const db = require('../src/db');

process.env.SKIP_DB_INIT = 'true';
const app = require('../src/index');

function stubDatabase(t, query) {
  const hadOwnQuery = Object.hasOwn(db.pool, 'query');
  const originalQuery = db.pool.query;
  db.pool.query = query;
  t.after(() => {
    if (hadOwnQuery) {
      db.pool.query = originalQuery;
    } else {
      delete db.pool.query;
    }
  });
}

describe('LibriCore Library API Endpoints', () => {
  it('GET /api/info should return 200 with 3-tier architecture specifications', async () => {
    const res = await request(app).get('/api/info');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.architecture, '3-Tier Cloud Architecture');
    assert.equal(res.body.application, 'LibriCore - Cloud Library Management System');
    assert.equal(Array.isArray(res.body.tiers), true);
    assert.equal(res.body.tiers.length, 3);
  });

  it('POST /api/books should validate empty fields and return 400', async () => {
    const res = await request(app)
      .post('/api/books')
      .send({ title: '', author: '', isbn: '' });
    assert.equal(res.statusCode, 400);
    assert.match(res.body.error, /Validation failed/);
  });

  it('PUT /api/books/invalid/borrow should reject non-numeric ID with 400', async () => {
    const res = await request(app)
      .put('/api/books/not-an-id/borrow')
      .send({ borrower_name: 'Alice' });
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, 'Invalid book ID supplied.');
  });

  it('GET /api/health should return database and runtime telemetry', async (t) => {
    stubDatabase(t, async (query) => {
      if (query.includes('COUNT(*)')) {
        return { rows: [{ total_books: '6' }] };
      }
      return { rows: [{ now: new Date().toISOString(), db: 'librarydb' }] };
    });

    const res = await request(app).get('/api/health');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.status, 'ok');
    assert.equal(res.body.database.connected, true);
    assert.equal(res.body.database.totalBooks, 6);
    assert.ok(res.body.hostname);
    assert.ok(res.body.memory.processUsageMB > 0);

    const albRes = await request(app).get('/health');
    assert.equal(albRes.statusCode, 200);
    assert.equal(albRes.body.database.connected, true);
  });

  it('POST /api/books should create a validated catalog entry', async (t) => {
    stubDatabase(t, async (query, values) => {
      assert.match(query, /INSERT INTO books/);
      assert.deepEqual(values, ['A New Book', 'A. Author', 'isbn-123', 'General', 2024]);
      return {
        rows: [{
          id: 8,
          title: values[0],
          author: values[1],
          isbn: values[2],
          genre: values[3],
          published_year: values[4],
          status: 'Available',
        }],
      };
    });

    const res = await request(app)
      .post('/api/books')
      .send({ title: ' A New Book ', author: ' A. Author ', isbn: ' isbn-123 ', published_year: 2024 });

    assert.equal(res.statusCode, 201);
    assert.equal(res.body.book.title, 'A New Book');
    assert.equal(res.body.book.status, 'Available');
  });

  it('POST /api/books should reject a future publication year before querying the database', async () => {
    const res = await request(app)
      .post('/api/books')
      .send({ title: 'Book', author: 'Author', isbn: 'isbn', published_year: 9999 });

    assert.equal(res.statusCode, 400);
    assert.match(res.body.error, /Published year/);
  });

  it('PUT /api/books/:id/borrow should prevent a concurrent duplicate checkout', async (t) => {
    let updateSql;
    stubDatabase(t, async (query) => {
      if (query.startsWith('UPDATE')) {
        updateSql = query;
        return { rowCount: 0, rows: [] };
      }
      return { rowCount: 1, rows: [{ status: 'Borrowed', borrower_name: 'Alice' }] };
    });

    const res = await request(app)
      .put('/api/books/1/borrow')
      .send({ borrower_name: 'Bob' });

    assert.equal(res.statusCode, 409);
    assert.match(updateSql, /status = 'Available'/);
    assert.match(res.body.error, /already borrowed by Alice/);
  });
});
