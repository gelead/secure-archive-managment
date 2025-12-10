import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getDb } from '../config/database.js';
import { alertingService } from '../services/alert.js';

const router = express.Router();

router.get('/logs', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    const limit = parseInt(req.query.limit) || 200;
    const db = getDb();
    const logs = await db.collection('logs').find({}).sort({ timestamp: -1 }).limit(limit).toArray();
    return res.json(logs);
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
});

router.get('/alerts', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    const limit = parseInt(req.query.limit) || 50;
    const alerts = alertingService.getAlerts(limit);
    return res.json(alerts);
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
});

router.post('/alerts/:id/acknowledge', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    const alert = alertingService.acknowledgeAlert(req.params.id);
    return res.json(alert);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

router.get('/permissions/logs', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const query = {};
    if (req.query.fileId) query.fileId = req.query.fileId;
    if (req.query.userId) query.$or = [{ grantedTo: req.query.userId }, { revokedFrom: req.query.userId }];
    
    const logs = await db.collection('permissionLogs').find(query).sort({ timestamp: -1 }).toArray();
    return res.json(logs);
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
});

export default router;

