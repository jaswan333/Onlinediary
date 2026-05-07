const express = require('express');
const db = require('../database');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

router.post('/', (req, res) => {
  const { title, content, mood } = req.body;
  const userId = req.userId;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  db.query(
    'INSERT INTO entries (user_id, title, content, mood) VALUES (?, ?, ?, ?)',
    [userId, title, content, mood || null],
    (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      db.query('SELECT * FROM entries WHERE id = ?', [result.insertId], (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json(results[0]);
      });
    }
  );
});

router.get('/', (req, res) => {
  const userId = req.userId;
  const { search, startDate, endDate } = req.query;

  let query = 'SELECT * FROM entries WHERE user_id = ?';
  const params = [userId];

  if (search) {
    query += ' AND (title LIKE ? OR content LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  if (startDate) {
    query += ' AND DATE(created_at) >= ?';
    params.push(startDate);
  }

  if (endDate) {
    query += ' AND DATE(created_at) <= ?';
    params.push(endDate);
  }

  query += ' ORDER BY created_at DESC';

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

router.get('/:id', (req, res) => {
  const userId = req.userId;
  const entryId = req.params.id;

  db.query('SELECT * FROM entries WHERE id = ? AND user_id = ?', [entryId, userId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json(results[0]);
  });
});

router.put('/:id', (req, res) => {
  const userId = req.userId;
  const entryId = req.params.id;
  const { title, content, mood } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  db.query(
    'UPDATE entries SET title = ?, content = ?, mood = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
    [title, content, mood || null, entryId, userId],
    (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Entry not found' });
      }

      db.query('SELECT * FROM entries WHERE id = ?', [entryId], (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(results[0]);
      });
    }
  );
});

router.delete('/:id', (req, res) => {
  const userId = req.userId;
  const entryId = req.params.id;

  db.query('DELETE FROM entries WHERE id = ? AND user_id = ?', [entryId, userId], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json({ message: 'Entry deleted successfully' });
  });
});

module.exports = router;
