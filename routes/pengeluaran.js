const express = require('express');
const router = express.Router();
const { ready, query, run } = require('../database');

router.get('/', async (req, res) => {
  await ready;
  const pengeluaran = await query('SELECT * FROM pengeluaran ORDER BY tanggal DESC, id DESC');
  res.render('pengeluaran', { pengeluaran });
});

router.post('/', async (req, res) => {
  await ready;
  const { tanggal, jumlah, kategori, keterangan } = req.body;
  await run('INSERT INTO pengeluaran (tanggal, jumlah, kategori, keterangan) VALUES (?,?,?,?)',
    [tanggal, parseFloat(jumlah), kategori || '', keterangan || '']);
  res.redirect('/pengeluaran');
});

router.get('/delete/:id', async (req, res) => {
  await ready;
  await run('DELETE FROM pengeluaran WHERE id=?', [req.params.id]);
  res.redirect('/pengeluaran');
});

module.exports = router;
