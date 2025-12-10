import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getDb } from '../config/database.js';
import { createLogEntry } from '../config/logger.js';
import { Role } from '../utils/constants.js';
import { checkRuBAC } from '../middleware/rubac.js';

const router = express.Router();

// Create leave request
router.post('/requests', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body;
    if (!startDate || !endDate || !reason) {
      throw new Error('Start date, end date, and reason are required');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const db = getDb();
    const leaveRequest = {
      _id: 'lr' + Math.random().toString(36).substr(2, 9),
      userId: req.user._id,
      username: req.user.username,
      startDate,
      endDate,
      days,
      reason,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    await db.collection('leaveRequests').insertOne(leaveRequest);
    await createLogEntry(req.user._id, req.user.username, 'LEAVE_REQUEST', `Requested leave for ${days} days`, 'PENDING');

    return res.json(leaveRequest);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// Get leave requests
router.get('/requests', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    let query = {};

    // Non-admins/HR can only see their own requests
    if (req.user.role !== Role.ADMIN && req.user.role !== Role.HR && req.user.role !== Role.MANAGER) {
      query.userId = req.user._id;
    }

    const requests = await db.collection('leaveRequests').find(query).sort({ createdAt: -1 }).toArray();
    return res.json(requests);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// Approve leave request (RuBAC example)
router.post('/requests/:id/approve', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const leaveReq = await db.collection('leaveRequests').findOne({ _id: req.params.id });
    if (!leaveReq) throw new Error('Leave request not found');

    // RuBAC check: Only HR Managers can approve leave > 10 days
    const context = {
      action: 'APPROVE_LEAVE',
      leaveDays: leaveReq.days,
      location: req.query.location || 'office',
      device: req.query.device || 'company-laptop',
    };

    const user = await db.collection('users').findOne({ _id: req.user._id });
    const accessCheck = checkRuBAC(user, {}, 'APPROVE_LEAVE', context);

    if (!accessCheck.allowed) {
      await createLogEntry(req.user._id, req.user.username, 'LEAVE_APPROVE_DENIED', `Attempted to approve leave request ${req.params.id}`, 'DENIED');
      return res.status(403).json({ error: accessCheck.reason });
    }

    await db.collection('leaveRequests').updateOne(
      { _id: req.params.id },
      { $set: { status: 'APPROVED', approvedAt: new Date().toISOString(), approvedBy: req.user._id } }
    );
    await createLogEntry(req.user._id, req.user.username, 'LEAVE_APPROVE', `Approved leave request ${req.params.id}`, 'SUCCESS');

    return res.json({ ok: true });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// Reject leave request
router.post('/requests/:id/reject', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== Role.ADMIN && req.user.role !== Role.HR && req.user.role !== Role.MANAGER) {
      throw new Error('Unauthorized');
    }

    const db = getDb();
    const leaveReq = await db.collection('leaveRequests').findOne({ _id: req.params.id });
    if (!leaveReq) throw new Error('Leave request not found');

    await db.collection('leaveRequests').updateOne(
      { _id: req.params.id },
      { $set: { status: 'REJECTED', rejectedAt: new Date().toISOString(), rejectedBy: req.user._id, rejectionReason: req.body.reason || 'No reason provided' } }
    );
    await createLogEntry(req.user._id, req.user.username, 'LEAVE_REJECT', `Rejected leave request ${req.params.id}`, 'DENIED');

    return res.json({ ok: true });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

export default router;

