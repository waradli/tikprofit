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
const transactionRoutes = require('./routes/transactions');
const pengeluaranRoutes = require('./routes/pengeluaran');
const kasRoutes = require('./routes/kas');
const pengantaranRoutes = require('./routes/pengantaran');
const reportRoutes = require('./routes/reports');

app.use('/', indexRoutes);
app.use('/transactions', transactionRoutes);
app.use('/pengeluaran', pengeluaranRoutes);
app.use('/kas', kasRoutes);
app.use('/pengantaran', pengantaranRoutes);
app.use('/reports', reportRoutes);

app.listen(PORT, () => {
  console.log(`Aplikasi Keuangan running on http://localhost:${PORT}`);
});
