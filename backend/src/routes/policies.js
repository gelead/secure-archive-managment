import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getCurrentModel, setModel } from '../controllers/policyController.js';
import { backupService } from '../services/backup.js';
import { getDb } from '../config/database.js';
import { createLogEntry } from '../config/logger.js';

const router = express.Router();

router.get('/model', async (req, res) => {
  try {
    const model = await getCurrentModel();
    return res.json({ model });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

router.post('/model', authMiddleware, async (req, res) => {
  try {
    await setModel(req.body.model, req.user);
    return res.json({ ok: true });
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }
});

router.post('/backup', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    const result = await backupService.createBackup(req.user.username);
    return res.json(result);
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
});

router.get('/backups', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    const backups = backupService.listBackups();
    return res.json(backups);
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
});

router.get('/sessions', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const now = new Date();
    const sessions = await db.collection('sessions').find({ 
      userId: req.user._id, 
      expiresAt: { $gt: now } 
    }).sort({ createdAt: -1 }).toArray();
    return res.json(sessions);
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
});

router.delete('/sessions/:sessionId', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const session = await db.collection('sessions').findOne({ sessionId: req.params.sessionId });
    if (!session) throw new Error('Session not found');
    if (session.userId !== req.user._id && req.user.role !== 'ADMIN') {
      throw new Error('Unauthorized');
    }
    
    await db.collection('sessions').deleteOne({ sessionId: req.params.sessionId });
    await createLogEntry(req.user._id, req.user.username, 'SESSION_REVOKED', `Session ${req.params.sessionId} revoked`, 'SUCCESS');
    return res.json({ ok: true });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

export default router;

