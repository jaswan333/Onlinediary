const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Hardcoded admin credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin@123';

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin', username }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, username, role: 'admin' });
  } else {
    res.status(401).json({ error: 'Invalid admin credentials' });
  }
});

module.exports = router;
