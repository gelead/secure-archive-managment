import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { getDb } from './database.js';

const LOG_KEY = process.env.LOG_KEY || 'default_log_key_please_change_32bytes!';
const ALGO = 'aes-256-cbc';

const ensureLogsDir = () => {
  const dir = path.join(process.cwd(), 'backend', 'logs');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
};

const encrypt = (text) => {
  const key = crypto.createHash('sha256').update(String(LOG_KEY)).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

export const createLogEntry = async (userId, username, action, details, status = 'SUCCESS', ip = '127.0.0.1') => {
  const timestamp = new Date().toISOString();
  const raw = { timestamp, userId, username, action, details, status, ip };
  const payload = JSON.stringify(raw);
  const encrypted = encrypt(payload);

  const entry = {
    _id: Math.random().toString(36).substr(2, 9),
    timestamp,
    userId,
    username,
    action,
    ip,
    details,
    status,
    encryptedPayload: encrypted,
  };

  // Append to centralized log file (encrypted)
  try {
    const dir = ensureLogsDir();
    const file = path.join(dir, 'centralized.log');
    fs.appendFileSync(file, encrypted + '\n');
  } catch (e) {
    console.error('[Logger] Failed to write to log file:', e);
  }

  // Save to MongoDB database
  try {
    const db = getDb();
    await db.collection('logs').insertOne(entry);
  } catch (e) {
    // If database is not available, log error but don't fail
    // This allows the application to continue working even if DB is temporarily unavailable
    console.error('[Logger] Failed to save log to database:', e.message);
  }

  return entry;
};

export const logger = {
  info: (message, meta = {}) => {
    console.log(`[INFO] ${message}`, meta);
  },
  error: (message, error = {}) => {
    console.error(`[ERROR] ${message}`, error);
  },
  warn: (message, meta = {}) => {
    console.warn(`[WARN] ${message}`, meta);
  },
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, meta);
    }
  },
};

