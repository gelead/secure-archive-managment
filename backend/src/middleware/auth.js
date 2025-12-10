import { verifyAccessToken } from '../utils/auth.js';
import { getDb } from '../config/database.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Invalid Authorization header format' });
    }

    const token = parts[1];
    const payload = verifyAccessToken(token);
    
    if (!payload) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Fetch user from database
    const db = getDb();
    const user = await db.collection('users').findOne({ _id: payload.userId });
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user to request
    req.user = {
      _id: user._id,
      username: user.username,
      role: user.role,
      department: user.department,
      clearanceLevel: user.clearanceLevel,
      email: user.email,
      phone: user.phone,
      profile: user.profile,
    };

    next();
  } catch (error) {
    console.error('[Auth Middleware] Error:', error);
    return res.status(500).json({ error: 'Authentication error' });
  }
};

export default authMiddleware;

