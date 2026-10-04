import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

export const config = {
  port: Number(process.env.PORT) || 4000,
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  jwtSecret: process.env.JWT_SECRET || 'dev-insecure-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  rootDir,
  dataDir: path.join(rootDir, 'data'),
  dbFile: path.join(rootDir, 'data', 'cob.db'),
  uploadsDir: path.join(rootDir, 'uploads'),
  // Path to the built frontend. Override with FRONTEND_DIST if needed.
  frontendDist: process.env.FRONTEND_DIST
    ? path.resolve(process.env.FRONTEND_DIST)
    : path.resolve(rootDir, '..', 'frontend', 'dist'),
  seed: {
    adminEmail: process.env.ADMIN_EMAIL || 'admin@cob.com',
    adminPassword: process.env.ADMIN_PASSWORD || 'admin1234',
    adminName: process.env.ADMIN_NAME || 'COB Admin',
    editorEmail: process.env.EDITOR_EMAIL || 'editor@cob.com',
    editorPassword: process.env.EDITOR_PASSWORD || 'editor1234',
    editorName: process.env.EDITOR_NAME || 'COB Editor',
  },
};
