import { Router } from 'express';
import { db } from '../db/index.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { hashPassword } from '../utils/auth.js';
import { asyncHandler } from '../utils/helpers.js';

const router = Router();

// Only ADMIN can manage users.
router.use(requireAuth, requireRole('ADMIN'));

router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY id').all());
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(String(email).toLowerCase());
    if (exists) return res.status(409).json({ error: 'Email already in use' });
    const info = db
      .prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)')
      .run(name, String(email).toLowerCase(), hashPassword(password), role === 'ADMIN' ? 'ADMIN' : 'EDITOR');
    res.status(201).json(
      db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(info.lastInsertRowid)
    );
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    const { name, email, password, role } = req.body || {};
    const hash = password ? hashPassword(password) : existing.password_hash;
    db.prepare(
      `UPDATE users SET name=?, email=?, password_hash=?, role=?, updated_at=datetime('now') WHERE id=?`
    ).run(
      name ?? existing.name,
      email ? String(email).toLowerCase() : existing.email,
      hash,
      role ? (role === 'ADMIN' ? 'ADMIN' : 'EDITOR') : existing.role,
      existing.id
    );
    res.json(db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(existing.id));
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    if (Number(req.params.id) === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }
    const info = db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    if (!info.changes) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  })
);

export default router;
