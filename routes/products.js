const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  const products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
  res.render('products', { products });
});

router.post('/', (req, res) => {
  const { name, category, modal, harga_jual, stok } = req.body;
  db.prepare('INSERT INTO products (name, category, modal, harga_jual, stok) VALUES (?,?,?,?,?)')
    .run(name, category || '', parseFloat(modal), parseFloat(harga_jual), parseInt(stok));
  res.redirect('/products');
});

router.post('/edit/:id', (req, res) => {
  const { name, category, modal, harga_jual, stok } = req.body;
  db.prepare('UPDATE products SET name=?, category=?, modal=?, harga_jual=?, stok=?, updated_at=CURRENT_TIMESTAMP WHERE id=?')
    .run(name, category || '', parseFloat(modal), parseFloat(harga_jual), parseInt(stok), req.params.id);
  res.redirect('/products');
});

router.post('/delete/:id', (req, res) => {
  db.prepare('DELETE FROM products WHERE id=?').run(req.params.id);
  res.redirect('/products');
});

module.exports = router;