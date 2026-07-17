const express = require('express');
const router = express.Router();
const { ready, get, query } = require('../database');

router.get('/', async (req, res) => {
  await ready;

  const totalPemasukan = await get('SELECT COALESCE(SUM(uang_masuk),0) as total FROM daily_finances');
  const totalModal = await get('SELECT COALESCE(SUM(modal),0) as total FROM daily_finances');
  const totalMargin = await get('SELECT COALESCE(SUM(margin),0) as total FROM daily_finances');
  const totalPengeluaran = await get('SELECT COALESCE(SUM(jumlah),0) as total FROM pengeluaran');
  const totalKas = totalPemasukan.total - totalPengeluaran.total;

  const financialByDate = await query(
    'SELECT tanggal, uang_masuk, modal, margin FROM daily_finances ORDER BY tanggal ASC LIMIT 30'
  );

  const pengeluaranByDate = await query(
    'SELECT tanggal, SUM(jumlah) as total FROM pengeluaran GROUP BY tanggal ORDER BY tanggal ASC LIMIT 30'
  );

  res.render('dashboard', {
    totalPemasukan, totalModal, totalMargin, totalPengeluaran, totalKas,
    financialByDate, pengeluaranByDate
  });
});

module.exports = router;
