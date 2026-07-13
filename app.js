const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const indexRoutes = require('./routes/index');
const productRoutes = require('./routes/products');
const transactionRoutes = require('./routes/transactions');
const returnRoutes = require('./routes/returns');
const reportRoutes = require('./routes/reports');

app.use('/', indexRoutes);
app.use('/products', productRoutes);
app.use('/transactions', transactionRoutes);
app.use('/returns', returnRoutes);
app.use('/reports', reportRoutes);

app.listen(PORT, () => {
  console.log(`TikProfit running on http://localhost:${PORT}`);
});