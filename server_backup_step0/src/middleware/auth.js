import { verifyToken } from '../services/auth.js';
import { db } from '../data/store.js';

export function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ success: false, error: { message: 'Missing Authorization header' } });
  }
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ success: false, error: { message: 'Invalid Authorization format' } });
  }
  const token = parts[1];
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ success: false, error: { message: 'Invalid or expired token' } });
  }
  const user = db.users.find(u => u.id === payload.id);
  if (!user) {
    return res.status(401).json({ success: false, error: { message: 'User not found' } });
  }
  req.user = user;
  next();
}
