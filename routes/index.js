const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  const totalPemasukan = db.prepare('SELECT COALESCE(SUM(uang_masuk),0) as total FROM daily_finances').get();
  const totalModal = db.prepare('SELECT COALESCE(SUM(modal),0) as total FROM daily_finances').get();
  const totalMargin = db.prepare('SELECT COALESCE(SUM(margin),0) as total FROM daily_finances').get();
  const totalPengeluaran = db.prepare('SELECT COALESCE(SUM(jumlah),0) as total FROM pengeluaran').get();
  const totalKas = totalPemasukan.total - totalPengeluaran.total;

  const financialByDate = db.prepare(`
    SELECT tanggal, uang_masuk, modal, margin FROM daily_finances
    ORDER BY tanggal ASC LIMIT 30
  `).all();

  const pengeluaranByDate = db.prepare(`
    SELECT tanggal, SUM(jumlah) as total FROM pengeluaran
    GROUP BY tanggal ORDER BY tanggal ASC LIMIT 30
  `).all();

  res.render('dashboard', {
    totalPemasukan, totalModal, totalMargin, totalPengeluaran, totalKas,
    financialByDate, pengeluaranByDate
  });
});

module.exports = router;
