import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getDb } from '../config/database.js';
import { createLogEntry } from '../config/logger.js';
import { Role } from '../utils/constants.js';

const router = express.Router();

router.post('/requests', authMiddleware, async (req, res) => {
  try {
    const { requestedRole } = req.body;
    const db = getDb();
    const roleRequest = { 
      _id: 'rr' + Math.random().toString(36).substr(2,9), 
      userId: req.user._id, 
      requestedRole, 
      status: 'PENDING', 
      createdAt: new Date().toISOString() 
    };
    
    await db.collection('roleRequests').insertOne(roleRequest);
    await createLogEntry(req.user._id, req.user.username, 'ROLE_REQUEST', `Requested role ${requestedRole}`, 'PENDING');
    
    return res.json(roleRequest);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

router.get('/requests', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    let query = {};
    
    // Non-admins can only see their own requests
    if (req.user.role !== Role.ADMIN) {
      query.userId = req.user._id;
    }
    
    const requests = await db.collection('roleRequests').find(query).sort({ createdAt: -1 }).toArray();
    
    // Populate user info
    const requestsWithUsers = await Promise.all(requests.map(async (req) => {
      const user = await db.collection('users').findOne({ _id: req.userId });
      return {
        ...req,
        username: user?.username || 'Unknown',
        currentRole: user?.role || 'Unknown',
      };
    }));
    
    return res.json(requestsWithUsers);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

router.post('/requests/:id/approve', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== Role.ADMIN) throw new Error('Unauthorized');
    const db = getDb();
    const roleReq = await db.collection('roleRequests').findOne({ _id: req.params.id });
    if (!roleReq) throw new Error('Request not found');
    
    const user = await db.collection('users').findOne({ _id: roleReq.userId });
    if (!user) throw new Error('User not found');
    
    const oldRole = user.role;
    const roleAuditTrail = user.roleAuditTrail || [];
    roleAuditTrail.push({ from: oldRole, to: roleReq.requestedRole, at: new Date().toISOString(), by: req.user._id });
    
    await db.collection('roleRequests').updateOne({ _id: req.params.id }, { $set: { status: 'APPROVED', approvedAt: new Date().toISOString(), approvedBy: req.user._id } });
    await db.collection('users').updateOne({ _id: user._id }, { $set: { role: roleReq.requestedRole, roleAuditTrail } });
    await createLogEntry(req.user._id, req.user.username, 'ROLE_REQUEST_APPROVE', `Approved role request ${req.params.id}`, 'SUCCESS');
    
    return res.json({ ok: true });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

router.post('/requests/:id/reject', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== Role.ADMIN) throw new Error('Unauthorized');
    const db = getDb();
    const roleReq = await db.collection('roleRequests').findOne({ _id: req.params.id });
    if (!roleReq) throw new Error('Request not found');
    
    await db.collection('roleRequests').updateOne({ _id: req.params.id }, { $set: { status: 'REJECTED', rejectedAt: new Date().toISOString(), rejectedBy: req.user._id, rejectionReason: req.body.reason || 'No reason provided' } });
    await createLogEntry(req.user._id, req.user.username, 'ROLE_REQUEST_REJECT', `Rejected role request ${req.params.id}`, 'DENIED');
    
    return res.json({ ok: true });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

export default router;

