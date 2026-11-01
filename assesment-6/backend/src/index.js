require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDatabase, pool } = require('./db');
const routes = require('./routes');

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: '*', // Configure to specific CloudFront domain in production via CORS_ORIGIN
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Mount Routes
app.use('/', routes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Start server after DB initialization
let server;

async function start() {
  try {
    // Only attempt DB connection if not running in pure unit-test mode
    if (process.env.SKIP_DB_INIT !== 'true') {
      await initializeDatabase();
    }
    server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`=======================================================`);
      console.log(`📚 LibriCore 3-Tier Library Management API (Port ${PORT})`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`📖 Catalog API: http://localhost:${PORT}/api/books`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('Fatal initialization error:', err);
    process.exit(1);
  }
}

// Graceful shutdown handling for AWS ECS rolling deployments and SIGTERM
function handleShutdown(signal) {
  console.log(`[SHUTDOWN] Received ${signal}. Closing HTTP server and DB connections...`);
  if (server) {
    server.close(async () => {
      console.log('[SHUTDOWN] HTTP server closed.');
      try {
        await pool.end();
        console.log('[SHUTDOWN] PostgreSQL connection pool drained.');
        process.exit(0);
      } catch (poolErr) {
        console.error('[SHUTDOWN] Error draining pool:', poolErr);
        process.exit(1);
      }
    });

    // Force exit if graceful shutdown takes longer than 10 seconds
    setTimeout(() => {
      console.error('[SHUTDOWN] Force terminating after timeout.');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

if (require.main === module) {
  start();
}

module.exports = app;
module.exports.start = start;
