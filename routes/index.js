const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  const totalTerjual = db.prepare('SELECT COALESCE(SUM(jumlah),0) as total FROM transaction_items').get();
  const totalRetur = db.prepare('SELECT COALESCE(SUM(jumlah),0) as total FROM returns').get();
  const totalOmzet = db.prepare('SELECT COALESCE(SUM(total_omzet),0) as total FROM transactions').get();
  const totalModal = db.prepare('SELECT COALESCE(SUM(total_modal),0) as total FROM transactions').get();
  const totalLabaKotor = db.prepare('SELECT COALESCE(SUM(total_laba),0) as total FROM transactions').get();
  const totalKerugian = db.prepare('SELECT COALESCE(SUM(kerugian),0) as total FROM returns').get();
  const totalLabaBersih = totalLabaKotor.total - totalKerugian.total;

  const penjualanByDate = db.prepare(`
    SELECT tanggal, SUM(total_omzet) as omzet, SUM(total_laba) as laba
    FROM transactions GROUP BY tanggal ORDER BY tanggal ASC LIMIT 30
  `).all();

  const returByDate = db.prepare(`
    SELECT tanggal_retur as tanggal, SUM(jumlah) as total, SUM(kerugian) as kerugian
    FROM returns GROUP BY tanggal_retur ORDER BY tanggal_retur ASC LIMIT 30
  `).all();

  res.render('dashboard', {
    totalTerjual, totalRetur, totalOmzet, totalModal,
    totalLabaKotor, totalKerugian, totalLabaBersih,
    penjualanByDate, returByDate
  });
});

module.exports = router;