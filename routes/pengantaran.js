const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  const items = db.prepare('SELECT * FROM pengantaran ORDER BY tanggal DESC, id DESC').all();
  const total = db.prepare('SELECT COUNT(*) as total FROM pengantaran').get();
  const totalHarga = db.prepare('SELECT COALESCE(SUM(harga),0) as total FROM pengantaran').get();
  const transit = db.prepare("SELECT COUNT(*) as total FROM pengantaran WHERE status='transit'").get();
  const sampai = db.prepare("SELECT COUNT(*) as total FROM pengantaran WHERE status='sampai'").get();
  const belumDiterima = db.prepare("SELECT COUNT(*) as total FROM pengantaran WHERE diterima='belum'").get();
  const sudahDiterima = db.prepare("SELECT COUNT(*) as total FROM pengantaran WHERE diterima='sudah'").get();
  res.render('pengantaran', { items, total, totalHarga, transit, sampai, belumDiterima, sudahDiterima });
});

router.post('/', (req, res) => {
  const { tanggal, kode_barang, nomor_pesanan, nomor_resi, username, harga } = req.body;
  db.prepare('INSERT INTO pengantaran (tanggal, kode_barang, nomor_pesanan, nomor_resi, username, harga) VALUES (?,?,?,?,?,?)')
    .run(tanggal, kode_barang, nomor_pesanan || '', nomor_resi || '', username, parseFloat(harga) || 0);
  res.redirect('/pengantaran');
});

router.post('/status/:id', (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE pengantaran SET status=? WHERE id=?').run(status, req.params.id);
  res.redirect('/pengantaran');
});

router.post('/diterima/:id', (req, res) => {
  const { diterima } = req.body;
  db.prepare('UPDATE pengantaran SET diterima=? WHERE id=?').run(diterima, req.params.id);
  res.redirect('/pengantaran');
});

router.get('/delete/:id', (req, res) => {
  db.prepare('DELETE FROM pengantaran WHERE id=?').run(req.params.id);
  res.redirect('/pengantaran');
});

module.exports = router;
