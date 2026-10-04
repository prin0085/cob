import { Router } from 'express';
import { db } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, safeJsonParse } from '../utils/helpers.js';

const router = Router();

// PUBLIC: all sections as { key: data }
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const rows = db.prepare('SELECT section_key, data FROM homepage_sections').all();
    const out = {};
    rows.forEach((r) => (out[r.section_key] = safeJsonParse(r.data)));
    res.json(out);
  })
);

// PUBLIC: single section
router.get(
  '/:key',
  asyncHandler(async (req, res) => {
    const row = db.prepare('SELECT data FROM homepage_sections WHERE section_key = ?').get(req.params.key);
    res.json(row ? safeJsonParse(row.data) : {});
  })
);

// ADMIN: upsert section
router.put(
  '/:key',
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = JSON.stringify(req.body || {});
    db.prepare(
      `INSERT INTO homepage_sections (section_key, data, updated_at)
       VALUES (?, ?, datetime('now'))
       ON CONFLICT(section_key) DO UPDATE SET data = excluded.data, updated_at = datetime('now')`
    ).run(req.params.key, data);
    res.json(safeJsonParse(data));
  })
);

export default router;
