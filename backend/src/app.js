import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import homepageRoutes from './routes/homepage.js';
import galleryRoutes from './routes/gallery.js';
import menuRoutes from './routes/menus.js';
import settingsRoutes from './routes/settings.js';
import socialRoutes from './routes/social.js';
import uploadRoutes from './routes/upload.js';
import dashboardRoutes from './routes/dashboard.js';
import userRoutes from './routes/users.js';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: (origin, cb) => {
        // Allow non-browser tools (no origin) and configured client origins.
        if (!origin || config.clientOrigins.includes(origin)) return cb(null, true);
        cb(null, true); // permissive for demo; tighten for production
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: '2mb' }));

  // Serve uploaded images with long cache + lazy-friendly headers.
  app.use(
    '/uploads',
    express.static(config.uploadsDir, {
      maxAge: '30d',
      setHeaders: (res) => res.set('Cache-Control', 'public, max-age=2592000'),
    })
  );

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/homepage', homepageRoutes);
  app.use('/api/gallery', galleryRoutes);
  app.use('/api/menus', menuRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/social', socialRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/users', userRoutes);

  // API 404 (must come before the SPA fallback)
  app.use('/api', (req, res) => res.status(404).json({ error: 'Endpoint not found' }));

  // Serve the built React app from the same port, if it exists.
  // Build it with `npm run build` in /frontend, then run the backend.
  const distDir = config.frontendDist;
  if (fs.existsSync(path.join(distDir, 'index.html'))) {
    app.use(express.static(distDir, { maxAge: '1h' }));
    // SPA fallback: send index.html for any non-API, non-file route.
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  // Central error handler
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    const status = err.status || (err.message?.includes('allowed') ? 400 : 500);
    if (status >= 500) console.error(err);
    res.status(status).json({ error: err.message || 'Internal server error' });
  });

  return app;
}
