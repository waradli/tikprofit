const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  const returns = db.prepare(`
    SELECT r.*, p.name as product_name, t.tanggal as tgl_transaksi
    FROM returns r
    LEFT JOIN products p ON p.id = r.product_id
    LEFT JOIN transactions t ON t.id = r.transaction_id
    ORDER BY r.created_at DESC
  `).all();
  const transactions = db.prepare(`
    SELECT t.id, t.tanggal, GROUP_CONCAT(p.name || ' x' || ti.jumlah, ', ') as items
    FROM transactions t
    LEFT JOIN transaction_items ti ON ti.transaction_id = t.id
    LEFT JOIN products p ON p.id = ti.product_id
    GROUP BY t.id ORDER BY t.tanggal DESC
  `).all();
  const allProducts = db.prepare('SELECT * FROM products ORDER BY name').all();
  res.render('returns', { returns, transactions, allProducts });
});

router.post('/', (req, res) => {
  const { transaction_id, product_id, jumlah, tanggal_retur, alasan, status_barang } = req.body;
  const product = db.prepare('SELECT * FROM products WHERE id=?').get(product_id);
  const item = db.prepare('SELECT * FROM transaction_items WHERE transaction_id=? AND product_id=?').get(transaction_id, product_id);
  const labaPerUnit = item ? item.laba / item.jumlah : (product.harga_jual - product.modal);
  const kerugian = labaPerUnit * parseInt(jumlah);

  const insertReturn = db.prepare('INSERT INTO returns (transaction_id, product_id, jumlah, tanggal_retur, alasan, status_barang, kerugian) VALUES (?,?,?,?,?,?,?)');
  const updateStok = db.prepare('UPDATE products SET stok = stok + ? WHERE id=?');

  const txn = db.transaction(() => {
    insertReturn.run(transaction_id, product_id, parseInt(jumlah), tanggal_retur || new Date().toISOString().split('T')[0], alasan || '', status_barang || 'rusak', kerugian);
    if (status_barang === 'layak') {
      updateStok.run(parseInt(jumlah), product_id);
    }
  });

  txn();
  res.redirect('/returns');
});

module.exports = router;