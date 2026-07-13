const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'tikprofit.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT DEFAULT '',
    modal REAL NOT NULL DEFAULT 0,
    harga_jual REAL NOT NULL DEFAULT 0,
    stok INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tanggal DATE NOT NULL DEFAULT (date('now')),
    total_modal REAL NOT NULL DEFAULT 0,
    total_omzet REAL NOT NULL DEFAULT 0,
    total_laba REAL NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS transaction_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    jumlah INTEGER NOT NULL,
    modal REAL NOT NULL,
    harga_jual REAL NOT NULL,
    laba REAL NOT NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS returns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    jumlah INTEGER NOT NULL,
    tanggal_retur DATE NOT NULL DEFAULT (date('now')),
    alasan TEXT DEFAULT '',
    status_barang TEXT DEFAULT 'rusak' CHECK(status_barang IN ('layak','rusak')),
    kerugian REAL NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );
`);

module.exports = db;