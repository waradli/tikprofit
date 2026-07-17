const express = require('express');
const router = express.Router();
const { ready, query } = require('../database');

router.get('/', async (req, res) => {
  await ready;
  const { start, end } = req.query;

  let whereClause = '';
  const params = [];
  if (start && end) {
    whereClause = ' WHERE tanggal BETWEEN ? AND ?';
    params.push(start, end);
  }

  const entries = await query(`
    SELECT tanggal, keterangan, debit, kredit FROM (
      SELECT tanggal, 'Uang Masuk Harian' as keterangan, uang_masuk as debit, 0 as kredit
      FROM daily_finances WHERE uang_masuk > 0
      UNION ALL
      SELECT tanggal,
        CASE WHEN kategori != '' AND keterangan != '' THEN kategori || ' - ' || keterangan
             WHEN kategori != '' THEN kategori
             ELSE 'Pengeluaran' END,
        0 as debit, jumlah as kredit
      FROM pengeluaran
    )${whereClause} ORDER BY tanggal, debit DESC
  `, params);

  let saldo = 0;
  const kas = entries.map(e => {
    saldo += e.debit - e.kredit;
    return { ...e, saldo };
  });

  const totalDebit = kas.reduce((s, e) => s + e.debit, 0);
  const totalKredit = kas.reduce((s, e) => s + e.kredit, 0);

  res.render('kas', { kas, totalDebit, totalKredit, saldoAkhir: saldo, start: start || '', end: end || '' });
});

module.exports = router;
