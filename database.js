const { createClient } = require('@libsql/client');

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:./tikprofit.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

function toObjects(result) {
  return result.rows.map(row => {
    const obj = {};
    result.columns.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
}

function toObject(result) {
  if (result.rows.length === 0) return undefined;
  const obj = {};
  result.columns.forEach((col, i) => { obj[col] = result.rows[0][i]; });
  return obj;
}

async function query(sql, args = []) {
  const result = await db.execute({ sql, args });
  return toObjects(result);
}

async function get(sql, args = []) {
  const result = await db.execute({ sql, args });
  return toObject(result);
}

async function run(sql, args = []) {
  await db.execute({ sql, args });
}

async function initDB() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS daily_finances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tanggal DATE NOT NULL UNIQUE,
      uang_masuk REAL NOT NULL DEFAULT 0,
      modal REAL NOT NULL DEFAULT 0,
      margin REAL NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS pengeluaran (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tanggal DATE NOT NULL,
      jumlah REAL NOT NULL DEFAULT 0,
      kategori TEXT DEFAULT '',
      keterangan TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS pemasukan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tanggal DATE NOT NULL,
      jumlah REAL NOT NULL DEFAULT 0,
      sumber TEXT DEFAULT '',
      keterangan TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS pengantaran (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tanggal DATE NOT NULL,
      kode_barang TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'transit',
      diterima TEXT NOT NULL DEFAULT 'belum',
      username TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  try {
    const info = await db.execute("SELECT * FROM pengantaran LIMIT 0");
    const cols = info.columns;
    if (!cols.includes('nomor_pesanan')) {
      await db.execute("ALTER TABLE pengantaran ADD COLUMN nomor_pesanan TEXT DEFAULT ''");
    }
    if (!cols.includes('nomor_resi')) {
      await db.execute("ALTER TABLE pengantaran ADD COLUMN nomor_resi TEXT DEFAULT ''");
    }
    if (!cols.includes('harga')) {
      await db.execute("ALTER TABLE pengantaran ADD COLUMN harga REAL NOT NULL DEFAULT 0");
    }
  } catch (e) {}
}

const ready = initDB();

module.exports = { db, ready, query, get, run };
