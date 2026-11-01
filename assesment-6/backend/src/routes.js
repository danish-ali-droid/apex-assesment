const express = require('express');
const os = require('os');
const { pool, checkHealth } = require('./db');

const router = express.Router();

function parseBookId(value) {
  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

async function getHealth(req, res) {
  try {
    const dbHealth = await checkHealth();
    return res.status(200).json({
      status: 'ok',
      service: 'three-tier-library-api',
      uptimeSeconds: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      hostname: os.hostname(),
      platform: process.platform,
      nodeVersion: process.version,
      memory: {
        freeMemMB: Math.round(os.freemem() / 1024 / 1024),
        totalMemMB: Math.round(os.totalmem() / 1024 / 1024),
        processUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      },
      database: dbHealth,
    });
  } catch (err) {
    console.error('[API] Health check failed:', err.message);
    return res.status(503).json({
      status: 'degraded',
      service: 'three-tier-library-api',
      error: 'Database health check failed',
      uptimeSeconds: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }
}

router.get('/health', getHealth);
router.get('/api/health', getHealth);

// Architecture information endpoint for frontend dashboard
router.get('/api/info', (req, res) => {
  res.json({
    architecture: '3-Tier Cloud Architecture',
    application: 'LibriCore - Cloud Library Management System',
    tiers: [
      {
        name: 'Tier 1: Presentation (Frontend)',
        tech: 'React 18 / Vite / Nginx',
        hosting: 'Docker container on EC2 behind an Application Load Balancer',
        security: 'Nginx security headers and ALB-only instance ingress',
      },
      {
        name: 'Tier 2: Application (API)',
        tech: 'Node.js 20 / Express Library Management API',
        hosting: 'Docker container on EC2 behind an Application Load Balancer',
        security: 'Parameterized SQL queries and ALB-only instance ingress',
      },
      {
        name: 'Tier 3: Persistence (Database)',
        tech: 'PostgreSQL 16 Engine (Books Catalog & Loans Store)',
        hosting: 'PostgreSQL container with a persistent Docker volume',
        security: 'Database is isolated from public ingress by the Docker network',
      },
    ],
  });
});

// GET /api/stats - High-level library KPIs
router.get('/api/stats', async (req, res) => {
  try {
    const totalQuery = pool.query('SELECT COUNT(*) AS total FROM books');
    const availableQuery = pool.query("SELECT COUNT(*) AS available FROM books WHERE status = 'Available'");
    const borrowedQuery = pool.query("SELECT COUNT(*) AS borrowed FROM books WHERE status = 'Borrowed'");
    const genresQuery = pool.query('SELECT COUNT(DISTINCT genre) AS genres FROM books');

    const [totalRes, availRes, borrowedRes, genresRes] = await Promise.all([
      totalQuery,
      availableQuery,
      borrowedQuery,
      genresQuery,
    ]);

    res.json({
      totalBooks: parseInt(totalRes.rows[0].total, 10),
      availableBooks: parseInt(availRes.rows[0].available, 10),
      borrowedBooks: parseInt(borrowedRes.rows[0].borrowed, 10),
      totalGenres: parseInt(genresRes.rows[0].genres, 10),
    });
  } catch (err) {
    console.error('[API] Error fetching library stats:', err.message);
    res.status(500).json({ error: 'Failed to compute library metrics.' });
  }
});

// GET /api/books - Retrieve books with search and filters
router.get('/api/books', async (req, res) => {
  try {
    const { search, genre, status } = req.query;
    let query = 'SELECT * FROM books WHERE 1=1';
    const params = [];

    if (search !== undefined && typeof search !== 'string') {
      return res.status(400).json({ error: 'Search must be a string.' });
    }
    if (genre !== undefined && typeof genre !== 'string') {
      return res.status(400).json({ error: 'Genre must be a string.' });
    }
    if (status !== undefined && typeof status !== 'string') {
      return res.status(400).json({ error: 'Status must be a string.' });
    }

    if (search && search.trim() !== '') {
      params.push(`%${search.trim()}%`);
      query += ` AND (title ILIKE $${params.length} OR author ILIKE $${params.length} OR isbn ILIKE $${params.length})`;
    }

    if (genre && genre.trim() !== '' && genre !== 'All') {
      params.push(genre.trim());
      query += ` AND genre = $${params.length}`;
    }

    if (status && status.trim() !== '' && status !== 'All') {
      if (!['Available', 'Borrowed'].includes(status)) {
        return res.status(400).json({ error: 'Status must be Available or Borrowed.' });
      }
      params.push(status.trim());
      query += ` AND status = $${params.length}`;
    }

    query += ' ORDER BY id DESC';

    const result = await pool.query(query, params);
    res.json({
      count: result.rows.length,
      books: result.rows,
    });
  } catch (err) {
    console.error('[API] Error querying books catalog:', err.message);
    res.status(500).json({ error: 'Database query failed.' });
  }
});

// POST /api/books - Add a new book to the library
router.post('/api/books', async (req, res) => {
  const { title, author, isbn, genre, published_year } = req.body || {};

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Validation failed: "title" is required.' });
  }
  if (!author || typeof author !== 'string' || author.trim() === '') {
    return res.status(400).json({ error: 'Validation failed: "author" is required.' });
  }
  if (!isbn || typeof isbn !== 'string' || isbn.trim() === '') {
    return res.status(400).json({ error: 'Validation failed: "isbn" is required.' });
  }

  if (title.trim().length > 255 || author.trim().length > 255 || isbn.trim().length > 50) {
    return res.status(400).json({ error: 'Title, author, or ISBN exceeds the maximum length.' });
  }
  if (genre !== undefined && typeof genre !== 'string') {
    return res.status(400).json({ error: 'Genre must be a string.' });
  }
  if (genre && genre.trim().length > 100) {
    return res.status(400).json({ error: 'Genre must be 100 characters or fewer.' });
  }

  const parsedYear = published_year === undefined || published_year === ''
    ? new Date().getFullYear()
    : Number(published_year);
  if (!Number.isInteger(parsedYear) || parsedYear < 0 || parsedYear > new Date().getFullYear()) {
    return res.status(400).json({ error: 'Published year must be a valid year no later than the current year.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO books (title, author, isbn, genre, published_year, status, tier_source)
       VALUES ($1, $2, $3, $4, $5, 'Available', 'Web Catalog')
       RETURNING *`,
      [
        title.trim(),
        author.trim(),
        isbn.trim(),
        genre && genre.trim() !== '' ? genre.trim() : 'General',
        parsedYear,
      ]
    );

    res.status(201).json({
      message: 'Book registered in library catalog successfully',
      book: result.rows[0],
    });
  } catch (err) {
    console.error('[API] Error inserting book:', err.message);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A book with this ISBN already exists in the catalog.' });
    }
    res.status(500).json({ error: 'Database insertion failed.' });
  }
});

// PUT /api/books/:id/borrow - Check out / borrow a book
router.put('/api/books/:id/borrow', async (req, res) => {
  const bookId = parseBookId(req.params.id);
  const { borrower_name } = req.body || {};

  if (bookId === null) {
    return res.status(400).json({ error: 'Invalid book ID supplied.' });
  }
  if (!borrower_name || typeof borrower_name !== 'string' || borrower_name.trim() === '') {
    return res.status(400).json({ error: 'Borrower name is required to check out a book.' });
  }
  if (borrower_name.trim().length > 255) {
    return res.status(400).json({ error: 'Borrower name must be 255 characters or fewer.' });
  }

  try {
    const updateRes = await pool.query(
      `UPDATE books
       SET status = 'Borrowed',
           borrower_name = $1,
           borrowed_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND status = 'Available'
       RETURNING *`,
      [borrower_name.trim(), bookId]
    );
    if (updateRes.rowCount === 0) {
      const checkRes = await pool.query('SELECT status, borrower_name FROM books WHERE id = $1', [bookId]);
      if (checkRes.rowCount === 0) {
        return res.status(404).json({ error: `Book #${bookId} not found.` });
      }
      return res.status(409).json({
        error: `Book is already borrowed by ${checkRes.rows[0].borrower_name}.`,
      });
    }

    res.json({
      message: 'Book borrowed successfully',
      book: updateRes.rows[0],
    });
  } catch (err) {
    console.error('[API] Error borrowing book:', err.message);
    res.status(500).json({ error: 'Failed to process checkout.' });
  }
});

// PUT /api/books/:id/return - Return a borrowed book
router.put('/api/books/:id/return', async (req, res) => {
  const bookId = parseBookId(req.params.id);
  if (bookId === null) {
    return res.status(400).json({ error: 'Invalid book ID supplied.' });
  }

  try {
    const updateRes = await pool.query(
      `UPDATE books
       SET status = 'Available',
           borrower_name = NULL,
           borrowed_at = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND status = 'Borrowed'
       RETURNING *`,
      [bookId]
    );
    if (updateRes.rowCount === 0) {
      const checkRes = await pool.query('SELECT status FROM books WHERE id = $1', [bookId]);
      if (checkRes.rowCount === 0) {
        return res.status(404).json({ error: `Book #${bookId} not found.` });
      }
      return res.status(409).json({ error: 'Book is not currently borrowed.' });
    }

    res.json({
      message: 'Book returned successfully to library collection',
      book: updateRes.rows[0],
    });
  } catch (err) {
    console.error('[API] Error returning book:', err.message);
    res.status(500).json({ error: 'Failed to process return.' });
  }
});

// DELETE /api/books/:id - Remove a book from the catalog
router.delete('/api/books/:id', async (req, res) => {
  const bookId = parseBookId(req.params.id);
  if (bookId === null) {
    return res.status(400).json({ error: 'Invalid book ID supplied.' });
  }

  try {
    const result = await pool.query('DELETE FROM books WHERE id = $1 RETURNING *', [bookId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: `Book with ID ${bookId} not found in catalog.` });
    }

    res.json({
      message: 'Book removed from library catalog successfully',
      book: result.rows[0],
    });
  } catch (err) {
    console.error('[API] Error deleting book:', err.message);
    res.status(500).json({ error: 'Database deletion failed.' });
  }
});

module.exports = router;
