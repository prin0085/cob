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
      ? db.prepare('SELECT * FROM gallery ORDER BY sort_order, id').all()
      : db.prepare('SELECT * FROM gallery WHERE status = 1 ORDER BY sort_order, id').all();
    res.json(rows);
  })
);

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    if (!b.image) return res.status(400).json({ error: 'Image is required' });
    const count = db.prepare('SELECT COUNT(*) c FROM gallery').get().c;
    const info = db
      .prepare('INSERT INTO gallery (image, title, description, status, sort_order) VALUES (?,?,?,?,?)')
      .run(b.image, b.title ?? null, b.description ?? null, b.status ? 1 : 0, b.sort_order ?? count);
    res.status(201).json(db.prepare('SELECT * FROM gallery WHERE id = ?').get(info.lastInsertRowid));
  })
);

router.put(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const existing = db.prepare('SELECT * FROM gallery WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    const b = req.body || {};
    db.prepare(
      'UPDATE gallery SET image=?, title=?, description=?, status=?, sort_order=? WHERE id=?'
    ).run(
      b.image ?? existing.image,
      b.title ?? existing.title,
      b.description ?? existing.description,
      b.status !== undefined ? (b.status ? 1 : 0) : existing.status,
      b.sort_order !== undefined ? b.sort_order : existing.sort_order,
      existing.id
    );
    res.json(db.prepare('SELECT * FROM gallery WHERE id = ?').get(existing.id));
  })
);

router.put(
  '/reorder/bulk',
  requireAuth,
  asyncHandler(async (req, res) => {
    const items = req.body?.items || [];
    const stmt = db.prepare('UPDATE gallery SET sort_order = ? WHERE id = ?');
    const tx = db.transaction((rows) => rows.forEach((r, i) => stmt.run(r.sort_order ?? i, r.id)));
    tx(items);
    res.json({ ok: true });
  })
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const info = db.prepare('DELETE FROM gallery WHERE id = ?').run(req.params.id);
    if (!info.changes) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  })
);

export default router;
