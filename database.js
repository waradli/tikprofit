const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'tikprofit.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS daily_finances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tanggal DATE NOT NULL UNIQUE,
    uang_masuk REAL NOT NULL DEFAULT 0,
    modal REAL NOT NULL DEFAULT 0,
    margin REAL NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS pengeluaran (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tanggal DATE NOT NULL,
    jumlah REAL NOT NULL DEFAULT 0,
    kategori TEXT DEFAULT '',
    keterangan TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS pemasukan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tanggal DATE NOT NULL,
    jumlah REAL NOT NULL DEFAULT 0,
    sumber TEXT DEFAULT '',
    keterangan TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS pengantaran (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tanggal DATE NOT NULL,
    kode_barang TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'transit',
    diterima TEXT NOT NULL DEFAULT 'belum',
    username TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

try { db.exec("ALTER TABLE pengantaran ADD COLUMN nomor_pesanan TEXT DEFAULT ''"); } catch (e) {}
try { db.exec("ALTER TABLE pengantaran ADD COLUMN nomor_resi TEXT DEFAULT ''"); } catch (e) {}
try { db.exec("ALTER TABLE pengantaran ADD COLUMN harga REAL NOT NULL DEFAULT 0"); } catch (e) {}

module.exports = db;
