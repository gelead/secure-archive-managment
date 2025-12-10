import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'backend', 'src', 'data');
const LOGS_DIR = path.join(process.cwd(), 'backend', 'logs');
const BACKUP_DIR = path.join(process.cwd(), 'backend', 'backups');

if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const dest = path.join(BACKUP_DIR, `backup-${timestamp}.zip`);

// Simple backup: copy JSON/text files into a timestamped folder (no real zip to avoid dependency)
const snapshotDir = path.join(BACKUP_DIR, `snapshot-${timestamp}`);
fs.mkdirSync(snapshotDir, { recursive: true });

const copyFileIfExists = (src, dstDir) => {
  if (fs.existsSync(src)) {
    const base = path.basename(src);
    fs.copyFileSync(src, path.join(dstDir, base));
  }
};

// Copy mock data
if (fs.existsSync(DATA_DIR)) {
  const files = fs.readdirSync(DATA_DIR);
  for (const f of files) {
    copyFileIfExists(path.join(DATA_DIR, f), snapshotDir);
  }
}

// Copy logs
if (fs.existsSync(LOGS_DIR)) {
  const files = fs.readdirSync(LOGS_DIR);
  for (const f of files) {
    copyFileIfExists(path.join(LOGS_DIR, f), snapshotDir);
  }
}

console.log('Backup snapshot created at', snapshotDir);
