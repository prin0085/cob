import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config.js';
import { db } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/helpers.js';

const router = Router();

if (!fs.existsSync(config.uploadsDir)) fs.mkdirSync(config.uploadsDir, { recursive: true });

// Keep the file in memory so Sharp can process it before writing to disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 }, // 12MB
  fileFilter: (req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// POST /api/upload  — optimizes to WebP, resizes to max 1920w, stores + records in image library.
router.post(
  '/',
  requireAuth,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
    const outPath = path.join(config.uploadsDir, filename);

    const image = sharp(req.file.buffer).rotate();
    const meta = await image.metadata();
    const pipeline = image
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 80 });
    const info = await pipeline.toFile(outPath);

    const url = `/uploads/${filename}`;
    const record = db
      .prepare(
        'INSERT INTO images (url, alt, placement, width, height, size_bytes) VALUES (?,?,?,?,?,?)'
      )
      .run(
        url,
        req.body.alt ?? null,
        req.body.placement ?? null,
        info.width ?? meta.width ?? null,
        info.height ?? meta.height ?? null,
        info.size ?? null
      );

    res.status(201).json({
      id: record.lastInsertRowid,
      url,
      width: info.width,
      height: info.height,
      size: info.size,
    });
  })
);

// GET /api/upload  — image library listing
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(db.prepare('SELECT * FROM images ORDER BY id DESC').all());
  })
);

// PUT /api/upload/:id  — update alt/placement metadata
router.put(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const existing = db.prepare('SELECT * FROM images WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    db.prepare('UPDATE images SET alt = ?, placement = ? WHERE id = ?').run(
      req.body.alt ?? existing.alt,
      req.body.placement ?? existing.placement,
      existing.id
    );
    res.json(db.prepare('SELECT * FROM images WHERE id = ?').get(existing.id));
  })
);

// DELETE /api/upload/:id  — remove file + record
router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const existing = db.prepare('SELECT * FROM images WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    const filePath = path.join(config.rootDir, existing.url.replace(/^\//, ''));
    fs.promises.unlink(filePath).catch(() => {});
    db.prepare('DELETE FROM images WHERE id = ?').run(existing.id);
    res.json({ ok: true });
  })
);

export default router;
