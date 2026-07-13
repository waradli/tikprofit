const express = require('express');
const router = express.Router();
const db = require('../database');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

router.get('/', (req, res) => {
  res.render('reports');
});

router.get('/penjualan', (req, res) => {
  const { start, end } = req.query;
  let query = `
    SELECT t.*, GROUP_CONCAT(p.name || ' x' || ti.jumlah, ', ') as items
    FROM transactions t
    LEFT JOIN transaction_items ti ON ti.transaction_id = t.id
    LEFT JOIN products p ON p.id = ti.product_id
  `;
  const params = [];
  if (start && end) {
    query += ' WHERE t.tanggal BETWEEN ? AND ?';
    params.push(start, end);
  }
  query += ' GROUP BY t.id ORDER BY t.tanggal DESC';
  const data = db.prepare(query).all(...params);
  res.json(data);
});

router.get('/retur', (req, res) => {
  const { start, end } = req.query;
  let query = `
    SELECT r.*, p.name as product_name, t.tanggal as tgl_transaksi
    FROM returns r
    LEFT JOIN products p ON p.id = r.product_id
    LEFT JOIN transactions t ON t.id = r.transaction_id
  `;
  const params = [];
  if (start && end) {
    query += ' WHERE r.tanggal_retur BETWEEN ? AND ?';
    params.push(start, end);
  }
  query += ' ORDER BY r.tanggal_retur DESC';
  const data = db.prepare(query).all(...params);
  res.json(data);
});

router.get('/laba', (req, res) => {
  const { start, end } = req.query;
  let penjualanQuery = 'SELECT COALESCE(SUM(total_omzet),0) as omzet, COALESCE(SUM(total_modal),0) as modal, COALESCE(SUM(total_laba),0) as laba FROM transactions';
  let returQuery = 'SELECT COALESCE(SUM(jumlah),0) as total_retur, COALESCE(SUM(kerugian),0) as total_kerugian FROM returns';
  const params = [];
  if (start && end) {
    penjualanQuery += ' WHERE tanggal BETWEEN ? AND ?';
    returQuery += ' WHERE tanggal_retur BETWEEN ? AND ?';
    params.push(start, end);
  }
  const penjualan = db.prepare(penjualanQuery).get(...params);
  const retur = db.prepare(returQuery).get(...params);
  res.json({ penjualan, retur, labaBersih: penjualan.laba - retur.total_kerugian });
});

module.exports = router;