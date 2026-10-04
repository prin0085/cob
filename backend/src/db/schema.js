// Database schema + migrations. Idempotent: safe to run on every boot.
export function runMigrations(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT    NOT NULL,
      email         TEXT    NOT NULL UNIQUE,
      password_hash TEXT    NOT NULL,
      role          TEXT    NOT NULL DEFAULT 'EDITOR' CHECK (role IN ('ADMIN','EDITOR')),
      created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT    NOT NULL,
      slug          TEXT    NOT NULL UNIQUE,
      category      TEXT,
      description   TEXT,
      alcohol       TEXT,
      volume        TEXT,
      country       TEXT,
      region        TEXT,
      vintage       TEXT,
      aroma         TEXT,
      taste         TEXT,
      finish        TEXT,
      food_pairing  TEXT,
      main_image    TEXT,
      status        INTEGER NOT NULL DEFAULT 1,   -- 1 = published, 0 = hidden
      featured      INTEGER NOT NULL DEFAULT 0,
      sort_order    INTEGER NOT NULL DEFAULT 0,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Add Thai translation columns if they don't already exist (idempotent).
  const THAI_COLS = [
    'name_th', 'category_th', 'description_th', 'country_th', 'region_th',
    'vintage_th', 'aroma_th', 'taste_th', 'finish_th', 'food_pairing_th',
  ];
  const existing = db.prepare('PRAGMA table_info(products)').all().map((c) => c.name);
  THAI_COLS.forEach((col) => {
    if (!existing.includes(col)) {
      db.exec(`ALTER TABLE products ADD COLUMN ${col} TEXT`);
    }
  });

  db.exec(`

    CREATE TABLE IF NOT EXISTS product_images (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id  INTEGER NOT NULL,
      url         TEXT    NOT NULL,
      alt         TEXT,
      sort_order  INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS homepage_sections (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      section_key TEXT    NOT NULL UNIQUE,
      data        TEXT    NOT NULL DEFAULT '{}',   -- JSON blob
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS gallery (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      image       TEXT    NOT NULL,
      title       TEXT,
      description TEXT,
      status      INTEGER NOT NULL DEFAULT 1,
      sort_order  INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS menus (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      label       TEXT    NOT NULL,
      url         TEXT    NOT NULL,
      status      INTEGER NOT NULL DEFAULT 1,
      sort_order  INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key   TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS social_links (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      platform    TEXT    NOT NULL,
      url         TEXT    NOT NULL,
      icon        TEXT,
      status      INTEGER NOT NULL DEFAULT 1,
      sort_order  INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS images (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      url         TEXT    NOT NULL,
      alt         TEXT,
      placement   TEXT,
      width       INTEGER,
      height      INTEGER,
      size_bytes  INTEGER,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);
}
