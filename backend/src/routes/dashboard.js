import { Router } from 'express';
import { db } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/helpers.js';

const router = Router();

router.get(
  '/stats',
  requireAuth,
  asyncHandler(async (req, res) => {
    const count = (sql) => db.prepare(sql).get().c;
    const lastUpdated = db
      .prepare(
        `SELECT MAX(t) AS t FROM (
           SELECT MAX(updated_at) t FROM products
           UNION ALL SELECT MAX(updated_at) FROM homepage_sections
           UNION ALL SELECT MAX(created_at) FROM gallery
         )`
      )
      .get().t;
    res.json({
      products: count('SELECT COUNT(*) c FROM products'),
      publishedProducts: count('SELECT COUNT(*) c FROM products WHERE status = 1'),
      images: count('SELECT COUNT(*) c FROM images') + count('SELECT COUNT(*) c FROM gallery'),
      sections: count('SELECT COUNT(*) c FROM homepage_sections'),
      users: count('SELECT COUNT(*) c FROM users'),
      gallery: count('SELECT COUNT(*) c FROM gallery'),
      lastUpdated,
    });
  })
);

export default router;
