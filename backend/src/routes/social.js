import { Router } from 'express';
import { db } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/helpers.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const isAdmin = !!req.headers.authorization;
    const rows = isAdmin
      ? db.prepare('SELECT * FROM social_links ORDER BY sort_order, id').all()
      : db.prepare('SELECT * FROM social_links WHERE status = 1 ORDER BY sort_order, id').all();
    res.json(rows);
  })
);

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    if (!b.platform || !b.url) return res.status(400).json({ error: 'Platform and url are required' });
    const count = db.prepare('SELECT COUNT(*) c FROM social_links').get().c;
    const info = db
      .prepare('INSERT INTO social_links (platform, url, icon, status, sort_order) VALUES (?,?,?,?,?)')
      .run(b.platform, b.url, b.icon ?? null, b.status ? 1 : 0, b.sort_order ?? count);
    res.status(201).json(db.prepare('SELECT * FROM social_links WHERE id = ?').get(info.lastInsertRowid));
  })
);

router.put(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const existing = db.prepare('SELECT * FROM social_links WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    const b = req.body || {};
    db.prepare('UPDATE social_links SET platform=?, url=?, icon=?, status=?, sort_order=? WHERE id=?').run(
      b.platform ?? existing.platform,
      b.url ?? existing.url,
      b.icon ?? existing.icon,
      b.status !== undefined ? (b.status ? 1 : 0) : existing.status,
      b.sort_order !== undefined ? b.sort_order : existing.sort_order,
      existing.id
    );
    res.json(db.prepare('SELECT * FROM social_links WHERE id = ?').get(existing.id));
  })
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const info = db.prepare('DELETE FROM social_links WHERE id = ?').run(req.params.id);
    if (!info.changes) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  })
);

export default router;
