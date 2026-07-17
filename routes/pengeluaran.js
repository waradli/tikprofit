const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  const pengeluaran = db.prepare('SELECT * FROM pengeluaran ORDER BY tanggal DESC, id DESC').all();
  res.render('pengeluaran', { pengeluaran });
});

router.post('/', (req, res) => {
  const { tanggal, jumlah, kategori, keterangan } = req.body;
  db.prepare('INSERT INTO pengeluaran (tanggal, jumlah, kategori, keterangan) VALUES (?,?,?,?)')
    .run(tanggal, parseFloat(jumlah), kategori || '', keterangan || '');
  res.redirect('/pengeluaran');
});

router.get('/delete/:id', (req, res) => {
  db.prepare('DELETE FROM pengeluaran WHERE id=?').run(req.params.id);
  res.redirect('/pengeluaran');
});

module.exports = router;
