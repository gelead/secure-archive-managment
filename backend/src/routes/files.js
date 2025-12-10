import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { checkAccess } from '../middleware/accessControl.js';
import { getDb } from '../config/database.js';
import { createLogEntry } from '../config/logger.js';
import { getCurrentModel } from '../controllers/policyController.js';
import { alertingService } from '../services/alert.js';
import { getClientIp } from '../utils/helpers.js';
import { Role } from '../utils/constants.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const files = await db.collection('files').find({}).toArray();
    return res.json(files);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

router.get('/:id/access', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const file = await db.collection('files').findOne({ _id: req.params.id });
    if (!file) throw new Error('File not found');

    const currentModel = await getCurrentModel();
    const ip = getClientIp(req);
    const context = {
      action: req.query.action || 'ACCESS',
      location: req.query.location || 'office',
      device: req.query.device || 'company-laptop',
      preapproved: req.query.preapproved === 'true',
      ip,
    };

    const { allowed, reason } = checkAccess(req.user, file, currentModel, context);
    
    await createLogEntry(
      req.user._id, 
      req.user.username, 
      'FILE_ACCESS', 
      `Attempted access to ${file.name} under ${currentModel}`, 
      allowed ? 'SUCCESS' : 'DENIED',
      ip
    );

    if (!allowed) {
      const logs = await db.collection('logs').find({}).sort({ timestamp: -1 }).limit(100).toArray();
      alertingService.detectSuspiciousAccess(logs);
    }

    return res.json({ allowed, reason, file: allowed ? file : null });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

router.post('/:id/share', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const file = await db.collection('files').findOne({ _id: req.params.id });
    if (!file) throw new Error('File not found');
    
    if (file.ownerId !== req.user._id && req.user.role !== Role.ADMIN) {
      throw new Error('Unauthorized');
    }
    
    const { targetUserId, permissions = ['read'] } = req.body;
    const filePermissions = file.permissions || {};
    if (!filePermissions[targetUserId]) {
      filePermissions[targetUserId] = { grantedBy: req.user._id, grantedAt: new Date().toISOString(), permissions: [] };
    }
    filePermissions[targetUserId].permissions = [...new Set([...filePermissions[targetUserId].permissions, ...permissions])];
    
    const sharedWith = file.sharedWith || [];
    if (!sharedWith.includes(targetUserId)) sharedWith.push(targetUserId);
    
    const permissionLog = {
      _id: 'perm_' + Math.random().toString(36).substr(2, 9),
      fileId: file._id,
      fileName: file.name,
      resourceOwner: file.ownerId,
      grantedBy: req.user._id,
      grantedByUsername: req.user.username,
      grantedTo: targetUserId,
      permissions,
      action: 'GRANT',
      timestamp: new Date().toISOString(),
    };
    
    await db.collection('files').updateOne({ _id: file._id }, { $set: { sharedWith, permissions: filePermissions } });
    await db.collection('permissionLogs').insertOne(permissionLog);
    await createLogEntry(req.user._id, req.user.username, 'DAC_SHARE', `Shared ${file.name} with ${targetUserId}`, 'SUCCESS');
    
    return res.json({ ok: true, permissionLog });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

router.post('/:id/unshare', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const file = await db.collection('files').findOne({ _id: req.params.id });
    if (!file) throw new Error('File not found');
    
    if (file.ownerId !== req.user._id && req.user.role !== Role.ADMIN) {
      throw new Error('Unauthorized');
    }
    
    const { targetUserId } = req.body;
    const sharedWith = (file.sharedWith || []).filter(id => id !== targetUserId);
    const filePermissions = file.permissions || {};
    if (filePermissions[targetUserId]) {
      delete filePermissions[targetUserId];
    }
    
    const permissionLog = {
      _id: 'perm_' + Math.random().toString(36).substr(2, 9),
      fileId: file._id,
      fileName: file.name,
      resourceOwner: file.ownerId,
      revokedBy: req.user._id,
      revokedByUsername: req.user.username,
      revokedFrom: targetUserId,
      action: 'REVOKE',
      timestamp: new Date().toISOString(),
    };
    
    await db.collection('files').updateOne({ _id: file._id }, { $set: { sharedWith, permissions: filePermissions } });
    await db.collection('permissionLogs').insertOne(permissionLog);
    await createLogEntry(req.user._id, req.user.username, 'DAC_UNSHARE', `Removed share of ${file.name} from ${targetUserId}`, 'SUCCESS');
    
    return res.json({ ok: true, permissionLog });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

export default router;

