const express = require('express');
const router = express.Router();
const { ready, get, query } = require('../database');

router.get('/', (req, res) => {
  res.render('reports');
});

router.get('/finansial', async (req, res) => {
  await ready;
  const { start, end } = req.query;
  let sql = 'SELECT * FROM daily_finances';
  const params = [];
  if (start && end) {
    sql += ' WHERE tanggal BETWEEN ? AND ?';
    params.push(start, end);
  }
  sql += ' ORDER BY tanggal DESC';
  const data = await query(sql, params);
  res.json(data);
});

router.get('/pengeluaran', async (req, res) => {
  await ready;
  const { start, end } = req.query;
  let sql = 'SELECT * FROM pengeluaran';
  const params = [];
  if (start && end) {
    sql += ' WHERE tanggal BETWEEN ? AND ?';
    params.push(start, end);
  }
  sql += ' ORDER BY tanggal DESC';
  const data = await query(sql, params);
  res.json(data);
});

router.get('/ringkasan', async (req, res) => {
  await ready;
  const { start, end } = req.query;
  const params = [];

  let financeSql = 'SELECT COALESCE(SUM(uang_masuk),0) as uang_masuk, COALESCE(SUM(modal),0) as modal, COALESCE(SUM(margin),0) as margin FROM daily_finances';
  let expenseSql = 'SELECT COALESCE(SUM(jumlah),0) as total_pengeluaran FROM pengeluaran';

  if (start && end) {
    financeSql += ' WHERE tanggal BETWEEN ? AND ?';
    expenseSql += ' WHERE tanggal BETWEEN ? AND ?';
    params.push(start, end);
  }

  const finansial = await get(financeSql, params);
  const pengeluaranRow = await get(expenseSql, params);

  res.json({
    finansial,
    pengeluaran: pengeluaranRow.total_pengeluaran,
    kas: finansial.uang_masuk - pengeluaranRow.total_pengeluaran
  });
});

module.exports = router;
