import fs from 'fs';
import path from 'path';
import { getDb } from '../config/database.js';
import { createLogEntry } from '../config/logger.js';
import { securityConfig } from '../config/security.js';

const BACKUP_DIR = path.join(process.cwd(), 'backend', 'backups');
const DATA_DIR = path.join(process.cwd(), 'backend', 'src', 'data');
const LOGS_DIR = path.join(process.cwd(), 'backend', 'logs');

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

class BackupService {
  constructor() {
    this.backupInterval = null;
  }

  async createBackup(triggeredBy = null) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const snapshotDir = path.join(BACKUP_DIR, `snapshot-${timestamp}`);
    
    try {
      fs.mkdirSync(snapshotDir, { recursive: true });

      // Backup data files
      if (fs.existsSync(DATA_DIR)) {
        const dataBackupDir = path.join(snapshotDir, 'data');
        fs.mkdirSync(dataBackupDir, { recursive: true });
        const files = fs.readdirSync(DATA_DIR);
        for (const file of files) {
          const src = path.join(DATA_DIR, file);
          if (fs.statSync(src).isFile()) {
            fs.copyFileSync(src, path.join(dataBackupDir, file));
          }
        }
      }

      // Backup logs
      if (fs.existsSync(LOGS_DIR)) {
        const logsBackupDir = path.join(snapshotDir, 'logs');
        fs.mkdirSync(logsBackupDir, { recursive: true });
        const files = fs.readdirSync(LOGS_DIR);
        for (const file of files) {
          const src = path.join(LOGS_DIR, file);
          if (fs.statSync(src).isFile()) {
            fs.copyFileSync(src, path.join(logsBackupDir, file));
          }
        }
      }

      // Backup MongoDB data if connected
      try {
        const db = getDb();
        if (db) {
          const dbBackupDir = path.join(snapshotDir, 'database');
          fs.mkdirSync(dbBackupDir, { recursive: true });

          const collections = ['users', 'files', 'logs', 'roleRequests', 'sessions', 'permissionLogs'];
          const backupData = {};

          for (const collectionName of collections) {
            try {
              const collection = db.collection(collectionName);
              const data = await collection.find({}).toArray();
              backupData[collectionName] = data;
            } catch (e) {
              // Collection might not exist
            }
          }

          fs.writeFileSync(
            path.join(dbBackupDir, 'backup.json'),
            JSON.stringify(backupData, null, 2)
          );
        }
      } catch (dbError) {
        // MongoDB not available, skip
      }

      // Create backup manifest
      const manifest = {
        timestamp: new Date().toISOString(),
        triggeredBy: triggeredBy || 'SYSTEM',
        version: '1.0',
        contents: {
          data: fs.existsSync(DATA_DIR) ? fs.readdirSync(DATA_DIR) : [],
          logs: fs.existsSync(LOGS_DIR) ? fs.readdirSync(LOGS_DIR) : [],
        },
      };

      fs.writeFileSync(
        path.join(snapshotDir, 'manifest.json'),
        JSON.stringify(manifest, null, 2)
      );

      return {
        success: true,
        backupPath: snapshotDir,
        timestamp: manifest.timestamp,
      };
    } catch (error) {
      throw new Error(`Backup failed: ${error.message}`);
    }
  }

  startAutomatedBackups(intervalMinutes = null) {
    const interval = intervalMinutes || (securityConfig.backup.interval / (60 * 1000));
    
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
    }

    this.backupInterval = setInterval(async () => {
      try {
        await this.createBackup('AUTOMATED');
        console.log(`[Backup] Automated backup completed at ${new Date().toISOString()}`);
      } catch (error) {
        console.error(`[Backup] Automated backup failed: ${error.message}`);
      }
    }, interval * 60 * 1000);

    console.log(`[Backup] Automated backups started (interval: ${interval} minutes)`);
  }

  stopAutomatedBackups() {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
      console.log('[Backup] Automated backups stopped');
    }
  }

  listBackups() {
    if (!fs.existsSync(BACKUP_DIR)) {
      return [];
    }

    const backups = [];
    const entries = fs.readdirSync(BACKUP_DIR, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.startsWith('snapshot-')) {
        const manifestPath = path.join(BACKUP_DIR, entry.name, 'manifest.json');
        if (fs.existsSync(manifestPath)) {
          try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            backups.push({
              name: entry.name,
              timestamp: manifest.timestamp,
              triggeredBy: manifest.triggeredBy,
              path: path.join(BACKUP_DIR, entry.name),
            });
          } catch (e) {
            // Invalid manifest
          }
        }
      }
    }

    return backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  cleanupOldBackups(keepCount = null) {
    const keep = keepCount || securityConfig.backup.keepCount;
    const backups = this.listBackups();
    if (backups.length > keep) {
      const toDelete = backups.slice(keep);
      for (const backup of toDelete) {
        try {
          fs.rmSync(backup.path, { recursive: true, force: true });
          console.log(`[Backup] Deleted old backup: ${backup.name}`);
        } catch (e) {
          console.error(`[Backup] Failed to delete backup ${backup.name}: ${e.message}`);
        }
      }
    }
  }
}

export const backupService = new BackupService();
export default backupService;

