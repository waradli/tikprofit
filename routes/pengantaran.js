const express = require('express');
const router = express.Router();
const { ready, get, query, run } = require('../database');

router.get('/', async (req, res) => {
  await ready;
  const items = await query('SELECT * FROM pengantaran ORDER BY tanggal DESC, id DESC');
  const total = await get('SELECT COUNT(*) as total FROM pengantaran');
  const totalHarga = await get('SELECT COALESCE(SUM(harga),0) as total FROM pengantaran');
  const transit = await get("SELECT COUNT(*) as total FROM pengantaran WHERE status='transit'");
  const sampai = await get("SELECT COUNT(*) as total FROM pengantaran WHERE status='sampai'");
  const belumDiterima = await get("SELECT COUNT(*) as total FROM pengantaran WHERE diterima='belum'");
  const sudahDiterima = await get("SELECT COUNT(*) as total FROM pengantaran WHERE diterima='sudah'");

  res.render('pengantaran', { items, total, totalHarga, transit, sampai, belumDiterima, sudahDiterima });
});

router.post('/', async (req, res) => {
  await ready;
  const { tanggal, kode_barang, nomor_pesanan, nomor_resi, username, harga } = req.body;
  await run('INSERT INTO pengantaran (tanggal, kode_barang, nomor_pesanan, nomor_resi, username, harga) VALUES (?,?,?,?,?,?)',
    [tanggal, kode_barang, nomor_pesanan || '', nomor_resi || '', username, parseFloat(harga) || 0]);
  res.redirect('/pengantaran');
});

router.post('/status/:id', async (req, res) => {
  await ready;
  const { status } = req.body;
  await run('UPDATE pengantaran SET status=? WHERE id=?', [status, req.params.id]);
  res.redirect('/pengantaran');
});

router.post('/diterima/:id', async (req, res) => {
  await ready;
  const { diterima } = req.body;
  await run('UPDATE pengantaran SET diterima=? WHERE id=?', [diterima, req.params.id]);
  res.redirect('/pengantaran');
});

router.get('/delete/:id', async (req, res) => {
  await ready;
  await run('DELETE FROM pengantaran WHERE id=?', [req.params.id]);
  res.redirect('/pengantaran');
});

module.exports = router;
