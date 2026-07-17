const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  const finances = db.prepare('SELECT * FROM daily_finances ORDER BY tanggal DESC').all();
  res.render('transactions', { finances });
});

router.post('/', (req, res) => {
  const { tanggal, uang_masuk, modal } = req.body;
  const uang = parseFloat(uang_masuk) || 0;
  const mod = parseFloat(modal) || 0;
  const margin = uang - mod;
  const existing = db.prepare('SELECT id FROM daily_finances WHERE tanggal=?').get(tanggal);
  if (existing) {
    db.prepare('UPDATE daily_finances SET uang_masuk=?, modal=?, margin=?, updated_at=CURRENT_TIMESTAMP WHERE id=?')
      .run(uang, mod, margin, existing.id);
  } else {
    db.prepare('INSERT INTO daily_finances (tanggal, uang_masuk, modal, margin) VALUES (?,?,?,?)')
      .run(tanggal, uang, mod, margin);
  }
  res.redirect('/transactions');
});

router.get('/delete/:id', (req, res) => {
  db.prepare('DELETE FROM daily_finances WHERE id=?').run(req.params.id);
  res.redirect('/transactions');
});

module.exports = router;
