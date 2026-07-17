const express = require('express');
const router = express.Router();
const { ready, get, query, run } = require('../database');

router.get('/', async (req, res) => {
  await ready;
  const finances = await query('SELECT * FROM daily_finances ORDER BY tanggal DESC');
  res.render('transactions', { finances });
});

router.post('/', async (req, res) => {
  await ready;
  const { tanggal, uang_masuk, modal } = req.body;
  const uang = parseFloat(uang_masuk) || 0;
  const mod = parseFloat(modal) || 0;
  const margin = uang - mod;
  const existing = await get('SELECT id FROM daily_finances WHERE tanggal=?', [tanggal]);
  if (existing) {
    await run('UPDATE daily_finances SET uang_masuk=?, modal=?, margin=?, updated_at=CURRENT_TIMESTAMP WHERE id=?',
      [uang, mod, margin, existing.id]);
  } else {
    await run('INSERT INTO daily_finances (tanggal, uang_masuk, modal, margin) VALUES (?,?,?,?)',
      [tanggal, uang, mod, margin]);
  }
  res.redirect('/transactions');
});

router.get('/delete/:id', async (req, res) => {
  await ready;
  await run('DELETE FROM daily_finances WHERE id=?', [req.params.id]);
  res.redirect('/transactions');
});

module.exports = router;
