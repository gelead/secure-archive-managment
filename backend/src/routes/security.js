import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getDb } from '../config/database.js';
import { createLogEntry } from '../config/logger.js';
import { Role, SecurityLevel } from '../utils/constants.js';

const router = express.Router();

// Get all users with their clearance levels (for admin)
router.get('/clearance-levels', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== Role.ADMIN) throw new Error('Unauthorized');
    const db = getDb();
    const users = await db.collection('users').find({}, { projection: { _id: 1, username: 1, clearanceLevel: 1, role: 1, department: 1 } }).toArray();
    return res.json(users);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }
});

// Update user clearance level (MAC - only admins can change)
router.post('/clearance-levels/:userId', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== Role.ADMIN) throw new Error('Unauthorized');
    const { clearanceLevel } = req.body;
    if (!clearanceLevel || clearanceLevel < 1 || clearanceLevel > 3) {
      throw new Error('Clearance level must be between 1 and 3');
    }

    const db = getDb();
    const user = await db.collection('users').findOne({ _id: req.params.userId });
    if (!user) throw new Error('User not found');

    const oldLevel = user.clearanceLevel || 1;
    await db.collection('users').updateOne(
      { _id: req.params.userId },
      { $set: { clearanceLevel: parseInt(clearanceLevel) } }
    );

    await createLogEntry(
      req.user._id,
      req.user.username,
      'CLEARANCE_LEVEL_CHANGE',
      `Changed clearance level for ${user.username} from ${oldLevel} to ${clearanceLevel}`,
      'SUCCESS'
    );

    return res.json({ ok: true });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// Get security labels for files/resources
router.get('/labels', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const files = await db.collection('files').find({}, { projection: { _id: 1, name: 1, classification: 1, department: 1, ownerId: 1 } }).toArray();
    return res.json(files);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// Update file security label/classification (MAC - only admins can change)
router.post('/labels/:fileId', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== Role.ADMIN) throw new Error('Unauthorized');
    const { classification } = req.body;
    if (!classification || ![SecurityLevel.PUBLIC, SecurityLevel.INTERNAL, SecurityLevel.CONFIDENTIAL].includes(classification)) {
      throw new Error('Invalid classification level');
    }

    const db = getDb();
    const file = await db.collection('files').findOne({ _id: req.params.fileId });
    if (!file) throw new Error('File not found');

    const oldClassification = file.classification || SecurityLevel.PUBLIC;
    await db.collection('files').updateOne(
      { _id: req.params.fileId },
      { $set: { classification: parseInt(classification) } }
    );

    await createLogEntry(
      req.user._id,
      req.user.username,
      'SECURITY_LABEL_CHANGE',
      `Changed security label for ${file.name} from ${oldClassification} to ${classification}`,
      'SUCCESS'
    );

    return res.json({ ok: true });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

export default router;

