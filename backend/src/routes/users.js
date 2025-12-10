import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getDb } from '../config/database.js';
import { createLogEntry } from '../config/logger.js';
import { Role } from '../utils/constants.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    const db = getDb();
    const users = await db.collection('users').find({}).toArray();
    const safeUsers = users.map(u => ({ 
      _id: u._id, 
      username: u.username, 
      role: u.role, 
      department: u.department, 
      clearanceLevel: u.clearanceLevel 
    }));
    return res.json(safeUsers);
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
});

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const user = await db.collection('users').findOne({ _id: req.user._id });
    if (!user) throw new Error('User not found');
    return res.json({
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      department: user.department,
      profile: user.profile || {},
    });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const user = await db.collection('users').findOne({ _id: req.user._id });
    if (!user) throw new Error('User not found');
    
    const profile = {
      ...(user.profile || {}),
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    
    await db.collection('users').updateOne({ _id: req.user._id }, { $set: { profile } });
    await createLogEntry(req.user._id, req.user.username, 'PROFILE_UPDATE', 'User profile updated', 'SUCCESS');
    
    return res.json({ ok: true, profile });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

router.post('/assign-role', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== Role.ADMIN) throw new Error('Unauthorized');
    const { userId, role } = req.body;
    const db = getDb();
    
    const user = await db.collection('users').findOne({ _id: userId });
    if (!user) throw new Error('User not found');
    
    const oldRole = user.role;
    const roleAuditTrail = user.roleAuditTrail || [];
    roleAuditTrail.push({ from: oldRole, to: role, at: new Date().toISOString(), by: req.user._id });
    
    await db.collection('users').updateOne({ _id: user._id }, { $set: { role, roleAuditTrail } });
    await createLogEntry(req.user._id, req.user.username, 'ROLE_ASSIGN', `Assigned role ${role} to ${user.username}`, 'SUCCESS');
    
    return res.json({ ok: true });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

export default router;

