const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  const transactions = db.prepare(`
    SELECT t.*, GROUP_CONCAT(p.name || ' x' || ti.jumlah, ', ') as items
    FROM transactions t
    LEFT JOIN transaction_items ti ON ti.transaction_id = t.id
    LEFT JOIN products p ON p.id = ti.product_id
    GROUP BY t.id ORDER BY t.created_at DESC
  `).all();
  const products = db.prepare('SELECT * FROM products WHERE stok > 0 ORDER BY name').all();
  res.render('transactions', { transactions, products });
});

router.post('/', (req, res) => {
  const parsedItems = typeof req.body.items === 'string' ? JSON.parse(req.body.items) : req.body.items;

  const insertTransaction = db.prepare('INSERT INTO transactions (tanggal, total_modal, total_omzet, total_laba) VALUES (?,?,?,?)');
  const insertItem = db.prepare('INSERT INTO transaction_items (transaction_id, product_id, jumlah, modal, harga_jual, laba) VALUES (?,?,?,?,?,?)');
  const updateStok = db.prepare('UPDATE products SET stok = stok - ? WHERE id=?');

  const txn = db.transaction(() => {
    const result = insertTransaction.run(req.body.tanggal || new Date().toISOString().split('T')[0], 0, 0, 0);
    const txnId = result.lastInsertRowid;

    for (const item of parsedItems) {
      const product = db.prepare('SELECT * FROM products WHERE id=?').get(item.product_id);
      const laba = (product.harga_jual - product.modal) * item.jumlah;
      insertItem.run(txnId, item.product_id, item.jumlah, product.modal * item.jumlah, product.harga_jual * item.jumlah, laba);
      updateStok.run(item.jumlah, item.product_id);
    }

    const totals = db.prepare('SELECT COALESCE(SUM(modal),0) as tm, COALESCE(SUM(harga_jual),0) as toz, COALESCE(SUM(laba),0) as tl FROM transaction_items WHERE transaction_id=?').get(txnId);
    db.prepare('UPDATE transactions SET total_modal=?, total_omzet=?, total_laba=? WHERE id=?').run(totals.tm, totals.toz, totals.tl, txnId);
  });

  txn();
  res.redirect('/transactions');
});

router.get('/delete/:id', (req, res) => {
  const items = db.prepare('SELECT * FROM transaction_items WHERE transaction_id=?').all(req.params.id);
  const restoreStok = db.prepare('UPDATE products SET stok = stok + ? WHERE id=?');
  const restore = db.transaction(() => {
    for (const item of items) {
      restoreStok.run(item.jumlah, item.product_id);
    }
    db.prepare('DELETE FROM transactions WHERE id=?').run(req.params.id);
  });
  restore();
  res.redirect('/transactions');
});

module.exports = router;