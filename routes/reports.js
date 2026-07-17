const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  res.render('reports');
});

router.get('/finansial', (req, res) => {
  const { start, end } = req.query;
  let query = 'SELECT * FROM daily_finances';
  const params = [];
  if (start && end) {
    query += ' WHERE tanggal BETWEEN ? AND ?';
    params.push(start, end);
  }
  query += ' ORDER BY tanggal DESC';
  const data = db.prepare(query).all(...params);
  res.json(data);
});

router.get('/pengeluaran', (req, res) => {
  const { start, end } = req.query;
  let query = 'SELECT * FROM pengeluaran';
  const params = [];
  if (start && end) {
    query += ' WHERE tanggal BETWEEN ? AND ?';
    params.push(start, end);
  }
  query += ' ORDER BY tanggal DESC';
  const data = db.prepare(query).all(...params);
  res.json(data);
});

router.get('/ringkasan', (req, res) => {
  const { start, end } = req.query;
  let financeQuery = 'SELECT COALESCE(SUM(uang_masuk),0) as uang_masuk, COALESCE(SUM(modal),0) as modal, COALESCE(SUM(margin),0) as margin FROM daily_finances';
  let expenseQuery = 'SELECT COALESCE(SUM(jumlah),0) as total_pengeluaran FROM pengeluaran';
  const params = [];
  if (start && end) {
    financeQuery += ' WHERE tanggal BETWEEN ? AND ?';
    expenseQuery += ' WHERE tanggal BETWEEN ? AND ?';
    params.push(start, end);
  }
  const finansial = db.prepare(financeQuery).get(...params);
  const pengeluaran = db.prepare(expenseQuery).get(...params);
  res.json({
    finansial,
    pengeluaran: pengeluaran.total_pengeluaran,
    kas: finansial.uang_masuk - pengeluaran.total_pengeluaran
  });
});

module.exports = router;
