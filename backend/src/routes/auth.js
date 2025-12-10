import express from 'express';
import { authController } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';
import { getClientIp } from '../utils/helpers.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const result = await authController.register(req.body);
    return res.json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const ip = getClientIp(req);
    const userAgent = req.headers['user-agent'] || '';
    const result = await authController.login(username, password, ip, userAgent, req.body.location, req.body.device);
    return res.json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { username, token, biometricData } = req.body;
    const ip = getClientIp(req);
    const userAgent = req.headers['user-agent'] || '';
    const result = await authController.verifyOtp(username, token, biometricData, ip, userAgent);
    return res.json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await authController.refreshAccess(refreshToken);
    return res.json(result);
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }
});

router.post('/logout', authMiddleware, async (req, res) => {
  try {
    await authController.logout(req.user);
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
});

router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const result = await authController.changePassword(req.user._id, oldPassword, newPassword);
    return res.json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

router.post('/verify-email', authMiddleware, async (req, res) => {
  try {
    const { code } = req.body;
    const result = await authController.verifyEmail(req.user._id, code);
    return res.json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

router.post('/verify-phone', authMiddleware, async (req, res) => {
  try {
    const { code } = req.body;
    const result = await authController.verifyPhone(req.user._id, code);
    return res.json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

router.post('/enable-mfa', authMiddleware, async (req, res) => {
  try {
    const { mfaType, verificationCode } = req.body;
    const result = await authController.enableMFA(req.user._id, mfaType, verificationCode);
    return res.json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

export default router;

