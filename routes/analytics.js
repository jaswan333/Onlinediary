const express = require('express');
const db = require('../database');
const adminMiddleware = require('../middleware/adminAuth');
const router = express.Router();

router.use(adminMiddleware);

// Get all statistics
router.get('/stats', (req, res) => {
  const stats = {};

  db.query('SELECT COUNT(*) as count FROM users', (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    stats.totalUsers = result[0].count;

    db.query('SELECT COUNT(*) as count FROM entries', (err, result) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      stats.totalEntries = result[0].count;

      db.query(
        `SELECT COUNT(*) as count FROM entries 
         WHERE YEAR(created_at) = YEAR(CURDATE()) 
         AND MONTH(created_at) = MONTH(CURDATE())`,
        (err, result) => {
          if (err) return res.status(500).json({ error: 'Database error' });
          stats.entriesThisMonth = result[0].count;

          db.query('SELECT SUM(LENGTH(content)) as totalChars FROM entries', (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            stats.totalPages = Math.ceil((result[0].totalChars || 0) / 500);

            res.json(stats);
          });
        }
      );
    });
  });
});

// Get all users with their entry counts
router.get('/users', (req, res) => {
  const query = `
    SELECT 
      u.id,
      u.username,
      u.email,
      u.created_at,
      COUNT(e.id) as entry_count
    FROM users u
    LEFT JOIN entries e ON u.id = e.user_id
    GROUP BY u.id, u.username, u.email, u.created_at
    ORDER BY u.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Get month-wise entry statistics
router.get('/entries-by-month', (req, res) => {
  const query = `
    SELECT 
      DATE_FORMAT(created_at, '%Y-%m') as month,
      COUNT(*) as count
    FROM entries
    GROUP BY month
    ORDER BY month DESC
    LIMIT 12
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Get mood distribution
router.get('/mood-stats', (req, res) => {
  const query = `
    SELECT 
      mood,
      COUNT(*) as count
    FROM entries
    WHERE mood IS NOT NULL AND mood != ''
    GROUP BY mood
    ORDER BY count DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Get recent entries across all users
router.get('/recent-entries', (req, res) => {
  const query = `
    SELECT 
      e.id,
      e.title,
      e.created_at,
      e.mood,
      u.username
    FROM entries e
    JOIN users u ON e.user_id = u.id
    ORDER BY e.created_at DESC
    LIMIT 10
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Get user growth over time
router.get('/user-growth', (req, res) => {
  const query = `
    SELECT 
      DATE_FORMAT(created_at, '%Y-%m') as month,
      COUNT(*) as count
    FROM users
    GROUP BY month
    ORDER BY month DESC
    LIMIT 12
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

module.exports = router;
