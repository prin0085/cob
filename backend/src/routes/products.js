import { Router } from 'express';
import { db } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, slugify } from '../utils/helpers.js';

const router = Router();

const PRODUCT_FIELDS = [
  'name', 'slug', 'category', 'description', 'alcohol', 'volume', 'country',
  'region', 'vintage', 'aroma', 'taste', 'finish', 'food_pairing',
  'main_image', 'status', 'featured', 'sort_order',
];

function attachImages(product) {
  if (!product) return product;
  const images = db
    .prepare('SELECT id, url, alt, sort_order FROM product_images WHERE product_id = ? ORDER BY sort_order, id')
    .all(product.id);
  return { ...product, gallery: images };
}

function ensureUniqueSlug(base, ignoreId = null) {
  let slug = slugify(base) || 'product';
  let i = 1;
  while (true) {
    const row = ignoreId
      ? db.prepare('SELECT id FROM products WHERE slug = ? AND id != ?').get(slug, ignoreId)
      : db.prepare('SELECT id FROM products WHERE slug = ?').get(slug);
    if (!row) return slug;
    slug = `${slugify(base)}-${++i}`;
  }
}

// PUBLIC: list published products
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const all = req.query.all === '1' && req.headers.authorization; // admin can pass ?all=1
    const rows = all
      ? db.prepare('SELECT * FROM products ORDER BY sort_order, id').all()
      : db.prepare('SELECT * FROM products WHERE status = 1 ORDER BY sort_order, id').all();
    res.json(rows.map(attachImages));
  })
);

// PUBLIC: featured products (for slideshow)
router.get(
  '/featured',
  asyncHandler(async (req, res) => {
    const rows = db
      .prepare('SELECT * FROM products WHERE status = 1 AND featured = 1 ORDER BY sort_order, id')
      .all();
    res.json(rows.map(attachImages));
  })
);

// PUBLIC: single product by slug
router.get(
  '/slug/:slug',
  asyncHandler(async (req, res) => {
    const row = db.prepare('SELECT * FROM products WHERE slug = ?').get(req.params.slug);
    if (!row) return res.status(404).json({ error: 'Product not found' });
    res.json(attachImages(row));
  })
);

// ADMIN: single product by id
router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Product not found' });
    res.json(attachImages(row));
  })
);

// ADMIN: create
router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    if (!b.name) return res.status(400).json({ error: 'Product name is required' });
    const slug = ensureUniqueSlug(b.slug || b.name);
    const info = db
      .prepare(
        `INSERT INTO products (name, slug, category, description, alcohol, volume, country, region,
          vintage, aroma, taste, finish, food_pairing, main_image, status, featured, sort_order,
          name_th, category_th, description_th, country_th, region_th, vintage_th,
          aroma_th, taste_th, finish_th, food_pairing_th)
         VALUES (@name,@slug,@category,@description,@alcohol,@volume,@country,@region,
          @vintage,@aroma,@taste,@finish,@food_pairing,@main_image,@status,@featured,@sort_order,
          @name_th,@category_th,@description_th,@country_th,@region_th,@vintage_th,
          @aroma_th,@taste_th,@finish_th,@food_pairing_th)`
      )
      .run({
        name: b.name,
        slug,
        category: b.category ?? null,
        description: b.description ?? null,
        alcohol: b.alcohol ?? null,
        volume: b.volume ?? null,
        country: b.country ?? null,
        region: b.region ?? null,
        vintage: b.vintage ?? null,
        aroma: b.aroma ?? null,
        taste: b.taste ?? null,
        finish: b.finish ?? null,
        food_pairing: b.food_pairing ?? null,
        main_image: b.main_image ?? null,
        status: b.status ? 1 : 0,
        featured: b.featured ? 1 : 0,
        sort_order: Number(b.sort_order) || 0,
        name_th: b.name_th ?? null,
        category_th: b.category_th ?? null,
        description_th: b.description_th ?? null,
        country_th: b.country_th ?? null,
        region_th: b.region_th ?? null,
        vintage_th: b.vintage_th ?? null,
        aroma_th: b.aroma_th ?? null,
        taste_th: b.taste_th ?? null,
        finish_th: b.finish_th ?? null,
        food_pairing_th: b.food_pairing_th ?? null,
      });
    saveGallery(info.lastInsertRowid, b.gallery);
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(attachImages(row));
  })
);

// ADMIN: update
router.put(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });
    const b = req.body || {};
    const slug = b.slug ? ensureUniqueSlug(b.slug, existing.id) : existing.slug;
    db.prepare(
      `UPDATE products SET name=@name, slug=@slug, category=@category, description=@description,
        alcohol=@alcohol, volume=@volume, country=@country, region=@region, vintage=@vintage,
        aroma=@aroma, taste=@taste, finish=@finish, food_pairing=@food_pairing,
        main_image=@main_image, status=@status, featured=@featured, sort_order=@sort_order,
        name_th=@name_th, category_th=@category_th, description_th=@description_th,
        country_th=@country_th, region_th=@region_th, vintage_th=@vintage_th,
        aroma_th=@aroma_th, taste_th=@taste_th, finish_th=@finish_th, food_pairing_th=@food_pairing_th,
        updated_at=datetime('now') WHERE id=@id`
    ).run({
      id: existing.id,
      name: b.name ?? existing.name,
      slug,
      category: b.category ?? existing.category,
      description: b.description ?? existing.description,
      alcohol: b.alcohol ?? existing.alcohol,
      volume: b.volume ?? existing.volume,
      country: b.country ?? existing.country,
      region: b.region ?? existing.region,
      vintage: b.vintage ?? existing.vintage,
      aroma: b.aroma ?? existing.aroma,
      taste: b.taste ?? existing.taste,
      finish: b.finish ?? existing.finish,
      food_pairing: b.food_pairing ?? existing.food_pairing,
      main_image: b.main_image ?? existing.main_image,
      status: b.status !== undefined ? (b.status ? 1 : 0) : existing.status,
      featured: b.featured !== undefined ? (b.featured ? 1 : 0) : existing.featured,
      sort_order: b.sort_order !== undefined ? Number(b.sort_order) || 0 : existing.sort_order,
      name_th: b.name_th !== undefined ? b.name_th : existing.name_th,
      category_th: b.category_th !== undefined ? b.category_th : existing.category_th,
      description_th: b.description_th !== undefined ? b.description_th : existing.description_th,
      country_th: b.country_th !== undefined ? b.country_th : existing.country_th,
      region_th: b.region_th !== undefined ? b.region_th : existing.region_th,
      vintage_th: b.vintage_th !== undefined ? b.vintage_th : existing.vintage_th,
      aroma_th: b.aroma_th !== undefined ? b.aroma_th : existing.aroma_th,
      taste_th: b.taste_th !== undefined ? b.taste_th : existing.taste_th,
      finish_th: b.finish_th !== undefined ? b.finish_th : existing.finish_th,
      food_pairing_th: b.food_pairing_th !== undefined ? b.food_pairing_th : existing.food_pairing_th,
    });
    if (b.gallery !== undefined) saveGallery(existing.id, b.gallery);
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(existing.id);
    res.json(attachImages(row));
  })
);

// ADMIN: reorder (bulk)
router.put(
  '/reorder/bulk',
  requireAuth,
  asyncHandler(async (req, res) => {
    const items = req.body?.items || [];
    const stmt = db.prepare('UPDATE products SET sort_order = ? WHERE id = ?');
    const tx = db.transaction((rows) => rows.forEach((r, i) => stmt.run(r.sort_order ?? i, r.id)));
    tx(items);
    res.json({ ok: true });
  })
);

// ADMIN: delete
router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const info = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    if (!info.changes) return res.status(404).json({ error: 'Product not found' });
    res.json({ ok: true });
  })
);

function saveGallery(productId, gallery) {
  if (!Array.isArray(gallery)) return;
  db.prepare('DELETE FROM product_images WHERE product_id = ?').run(productId);
  const stmt = db.prepare(
    'INSERT INTO product_images (product_id, url, alt, sort_order) VALUES (?,?,?,?)'
  );
  gallery.forEach((g, i) => {
    const url = typeof g === 'string' ? g : g.url;
    if (!url) return;
    stmt.run(productId, url, typeof g === 'object' ? g.alt ?? null : null, i);
  });
}

export default router;
