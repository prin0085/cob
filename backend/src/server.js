import { createApp } from './app.js';
import { config } from './config.js';
import './db/index.js'; // ensure DB + migrations run at boot

const app = createApp();

app.listen(config.port, () => {
  console.log(`\n  COB API running → http://localhost:${config.port}`);
  console.log(`  Health check    → http://localhost:${config.port}/api/health\n`);
});
