import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load .env file from backend directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../../.env') });
import { connectToDb, createIndexes } from './config/database.js';
import { createLogEntry } from './config/logger.js';
import { backupService } from './services/backup.js';
import { alertingService } from './services/alert.js';
import { getCurrentModel } from './controllers/policyController.js';

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import fileRoutes from './routes/files.js';
import auditRoutes from './routes/audit.js';
import policyRoutes from './routes/policies.js';

const app = express();
const PORT = process.env.SERVER_PORT || 4000;

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Initialize database
// Start server only after DB initialization completes successfully.
(async () => {
  try {
    const conn = await connectToDb();
    if (!conn) {
      console.error('[Server] MongoDB not configured (MONGO_URI missing or invalid). Exiting.');
      process.exit(1);
    }

    await createIndexes();
    await createLogEntry('SYSTEM', 'SYSTEM', 'STARTUP', 'System initialized with MongoDB');

    // Start automated backups
    backupService.startAutomatedBackups();

    // Run periodic alert checks
    setInterval(async () => {
      try {
        const { getDb } = await import('./config/database.js');
        const db = getDb();
        const logs = await db.collection('logs').find({}).sort({ timestamp: -1 }).limit(100).toArray();
        alertingService.runPeriodicChecks(logs);
      } catch (e) {
        // Best effort
      }
    }, 5 * 60 * 1000); // Every 5 minutes

    // Only start listening after DB is ready
    const server = app.listen(PORT, () => {
      console.log(`[Server] Backend API server listening on http://localhost:${PORT}`);
    });

    // Handle server errors (e.g., port already in use)
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`[Server] Port ${PORT} is already in use.`);
        console.error(`[Server] Another instance of the server may be running.`);
        console.error(`[Server] To find and stop it, run: lsof -ti :${PORT} | xargs kill -9`);
        console.error(`[Server] Or change the port by setting SERVER_PORT environment variable.`);
      } else {
        console.error('[Server] Server error:', error);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error('[Server] Initialization error:', error);
    process.exit(1);
  }
})();

// API Routes
import roleRoutes from './routes/roles.js';
import securityRoutes from './routes/security.js';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);
app.use('/api', auditRoutes);
app.use('/api/admin', policyRoutes);
app.use('/api/role-requests', roleRoutes);
app.use('/api/security', securityRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;

