const express = require('express');
const db = require('../database');
const adminMiddleware = require('../middleware/adminAuth');
const router = express.Router();

router.use(adminMiddleware);

// Get all statistics
router.get('/stats', (req, res) => {
  const stats = {};

  // Total users
  db.get('SELECT COUNT(*) as count FROM users', (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    stats.totalUsers = result.count;

    // Total entries
    db.get('SELECT COUNT(*) as count FROM entries', (err, result) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      stats.totalEntries = result.count;

      // Entries this month
      db.get(
        `SELECT COUNT(*) as count FROM entries 
         WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')`,
        (err, result) => {
          if (err) return res.status(500).json({ error: 'Database error' });
          stats.entriesThisMonth = result.count;

          // Total pages (assuming 500 chars per page)
          db.get('SELECT SUM(LENGTH(content)) as totalChars FROM entries', (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            stats.totalPages = Math.ceil((result.totalChars || 0) / 500);

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
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `;

  db.all(query, (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(users);
  });
});

// Get month-wise entry statistics
router.get('/entries-by-month', (req, res) => {
  const query = `
    SELECT 
      strftime('%Y-%m', created_at) as month,
      COUNT(*) as count
    FROM entries
    GROUP BY month
    ORDER BY month DESC
    LIMIT 12
  `;

  db.all(query, (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(data);
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

  db.all(query, (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(data);
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

  db.all(query, (err, entries) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(entries);
  });
});

// Get user growth over time
router.get('/user-growth', (req, res) => {
  const query = `
    SELECT 
      strftime('%Y-%m', created_at) as month,
      COUNT(*) as count
    FROM users
    GROUP BY month
    ORDER BY month DESC
    LIMIT 12
  `;

  db.all(query, (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(data);
  });
});

module.exports = router;
