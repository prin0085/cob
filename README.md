# COB — Wine &amp; Spirits Brand Site + CMS

A premium, minimal landing page for the **COB** craft liqueur brand (Chamber of Beverage, Thailand), with a full content-management backend. Everything visible on the public site — products, hero, story, philosophy, gallery, navigation, contact and age verification — is editable from the admin panel, no code changes required.

Seeded with the real COB range: **Cream Coff**, **Cream Choc**, **Spice Choc** and a **Reserve Cacao**.

```
COB/
├── backend/    Express REST API · SQLite · JWT auth · image upload (Sharp)
└── frontend/   React (Vite) public site + /admin CMS
```

---

## Tech Stack

| Layer     | Choice |
|-----------|--------|
| Frontend  | React 18, Vite, React Router, Framer Motion, Swiper, plain CSS design tokens |
| Backend   | Node + Express (REST), JWT auth, bcrypt password hashing |
| Database  | SQLite (`better-sqlite3`) — zero-config, easily swappable |
| Uploads   | Multer + Sharp → resize, compress, convert to **WebP** |

---

## 1. Prerequisites

- Node.js 18+ (tested on Node 20)
- npm

---

## 2. Install

Install both apps (run each in its own folder):

```bash
# backend
cd backend
npm install

# frontend
cd ../frontend
npm install
```

---

## 3. Environment Variables

### Backend (`backend/.env`)
Copy the example and adjust as needed:

```bash
cp backend/.env.example backend/.env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | API port | `4000` |
| `CLIENT_ORIGIN` | Allowed CORS origin(s), comma-separated | `http://localhost:5173` |
| `JWT_SECRET` | Secret for signing tokens — **change in production** | dev value |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | Seed admin account | `admin@cob.com` / `admin1234` |
| `EDITOR_EMAIL` / `EDITOR_PASSWORD` / `EDITOR_NAME` | Seed editor account | `editor@cob.com` / `editor1234` |

### Frontend (`frontend/.env`) — optional
Only needed if the API is on a different origin in production:

```
VITE_API_BASE=https://api.yourdomain.com
```
In development leave it blank; Vite proxies `/api` and `/uploads` to the backend automatically.

---

## 4. Database Setup

The SQLite database and tables are created automatically on first boot (migrations run on startup). Seed demo content:

```bash
cd backend
npm run seed
```

This creates the admin + editor users and populates products, homepage sections, gallery, navigation, social links and settings. The DB file lives at `backend/data/cob.db`.

Tables: `users`, `products`, `product_images`, `homepage_sections`, `gallery`, `menus`, `site_settings`, `social_links`, `images`.

---

## 5. Run in Development

Open two terminals:

```bash
# Terminal 1 — API on http://localhost:4000
cd backend
npm run dev

# Terminal 2 — Site on http://localhost:5173
cd frontend
npm run dev
```

- Public site → http://localhost:5173
- Admin panel → http://localhost:5173/admin

> On Windows PowerShell, run each command in its own terminal (do not chain long-running servers with `;`).

---

## 6. Admin Login

| Role | Email | Password | Can do |
|------|-------|----------|--------|
| ADMIN | `admin@cob.com` | `admin1234` | Everything, including managing users |
| EDITOR | `editor@cob.com` | `editor1234` | Content &amp; products (no user management) |

Go to `/admin`, sign in, and you land on the dashboard.

---

## 7. Common Tasks

### Add a product
1. Admin → **Products** → **Add Product**.
2. Fill in name, category, description, specs (alcohol, volume, country, region, vintage) and tasting notes (aroma, taste, finish, food pairing).
3. Upload a **Main Image** and any **Gallery Images** (auto-optimized to WebP).
4. Toggle **Published** to show it on the site, **Featured** to include it in the homepage slideshow.
5. Save. It appears immediately in the collection grid at `/#collection` and, if featured, in the slideshow.

### Change a homepage image or text
1. Admin → **Homepage Content**.
2. Each section (Hero, Our Story, Philosophy, CTA) has its own editable fields and image picker.
3. Edit and click **Save Section**. Changes are live on refresh.

## Internationalization (EN / TH)

The public site ships bilingual — English and Thai.

- A language toggle (EN / TH) sits in the navbar and on the age-verification modal. The choice is saved in `localStorage` (`cob_lang`) and sets `<html lang>`. First visit defaults to the browser's language.
- **UI chrome** (buttons, section labels, states, footer, age gate) is translated via a dictionary at `frontend/src/i18n/dictionary.js`. Add or edit strings there; each key has an `en` and `th` entry.
- **CMS content** is translated per field. Product and homepage records store optional Thai columns/keys (`name_th`, `description_th`, `heading_th`, etc.). When the site is viewed in Thai, the `localize()` helper shows the Thai value if present and **falls back to the English value when blank** — so nothing ever renders empty.
- To add Thai content: in the admin, open a product or the Homepage editor and fill the fields labelled `(ไทย)`. Leave them blank to reuse the English text.
- To add another language later: add a new block to `dictionary.js`, add it to `LANGS`, and (optionally) add matching `_xx` fields in the product route/schema and admin forms.

### Manage the gallery
Admin → **Gallery**: add images with title/description, reorder with ↑/↓, toggle visibility, or delete.

### Edit navigation / contact / social / age gate
Admin → **Settings** group:
- **Navigation** — add/reorder/hide menu items.
- **Contact** — brand name, tagline, address, phone, email, maps URL, footer text.
- **Social Media** — add links (icons: `facebook`, `instagram`, `line`).
- **Age Verification** — enable/disable the gate, set minimum age and how long to remember a visitor's choice.

### Image Library
Admin → **Image Library**: upload/manage all optimized images and copy their URLs.

---

## 8. Build for Production

```bash
# Frontend — outputs static files to frontend/dist
cd frontend
npm run build
npm run preview   # optional local preview

# Backend — run the server
cd ../backend
npm start
```

---

## 9. Deploy

**Backend**
- Set real environment variables (especially a strong `JWT_SECRET` and your production `CLIENT_ORIGIN`).
- Run `npm start` behind a process manager (PM2, systemd) or a container.
- Persist the `backend/data/` (database) and `backend/uploads/` (images) directories with a volume/disk.
- For higher scale, swap SQLite for Postgres by replacing the `better-sqlite3` layer in `src/db/`.

**Frontend**
- `npm run build` and serve `frontend/dist` from any static host (Netlify, Vercel, S3+CloudFront, Nginx).
- Set `VITE_API_BASE` to the deployed API origin before building.
- Ensure the host serves `index.html` for unknown routes (SPA fallback) so `/admin/*` and `/product/*` work on refresh.

---

## 10. API Overview

Public (no auth):
```
POST /api/auth/login
GET  /api/products              GET /api/products/featured
GET  /api/products/slug/:slug
GET  /api/homepage              GET /api/homepage/:key
GET  /api/gallery   /api/menus   /api/settings   /api/social
GET  /api/health
```

Protected (Bearer token):
```
POST/PUT/DELETE /api/products (+ /reorder/bulk)
PUT  /api/homepage/:key
POST/PUT/DELETE /api/gallery · /api/menus · /api/social (+ reorder)
PUT  /api/settings
POST/GET/PUT/DELETE /api/upload         (image optimization + library)
GET  /api/dashboard/stats
CRUD /api/users                          (ADMIN only)
```

---

## 11. Notes on Design &amp; UX

- Palette: black, cream, dark brown, gold/bronze accents; Cormorant Garamond + Inter type.
- Subtle motion only (fade/slide reveal, image zoom, carousel) — all disabled under `prefers-reduced-motion`.
- Responsive, mobile-first; fixed aspect ratios on images to avoid layout shift; lazy loading.
- Loading, empty and error states throughout the public site and admin.
- Demo images are remote placeholders (`picsum.photos`); replace them via the admin image tools.
