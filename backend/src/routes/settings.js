import { Router } from 'express';
import { db } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, safeJsonParse } from '../utils/helpers.js';

const router = Router();

// Settings are stored as key/value; values may be JSON strings.
function getAllSettings() {
  const rows = db.prepare('SELECT key, value FROM site_settings').all();
  const out = {};
  rows.forEach((r) => {
    out[r.key] = r.value && (r.value.startsWith('{') || r.value.startsWith('['))
      ? safeJsonParse(r.value, r.value)
      : r.value;
  });
  return out;
}

router.get('/', asyncHandler(async (req, res) => res.json(getAllSettings())));

// ADMIN: bulk upsert
router.put(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = req.body || {};
    const stmt = db.prepare(
      `INSERT INTO site_settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`
    );
    const tx = db.transaction((entries) => {
      entries.forEach(([k, v]) => {
        const value = typeof v === 'string' ? v : JSON.stringify(v);
        stmt.run(k, value);
      });
    });
    tx(Object.entries(body));
    res.json(getAllSettings());
  })
);

export default router;
