import { verifyToken } from '../services/auth.js';
import { db } from '../data/store.js';

function readUserFromHeader(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return { missing: true };
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return { error: 'Invalid Authorization format' };
  }
  const payload = verifyToken(parts[1]);
  if (!payload) return { error: 'Invalid or expired token' };
  const user = db.users.find(u => u.id === payload.id);
  if (!user) return { error: 'User not found' };
  return { user };
}

export function authenticate(req, res, next) {
  const result = readUserFromHeader(req);
  if (result.missing) {
    return res.status(401).json({ success: false, error: { message: 'Missing Authorization header' } });
  }
  if (result.error) {
    return res.status(401).json({ success: false, error: { message: result.error } });
  }
  req.user = result.user;
  next();
}

export function optionalAuth(req, res, next) {
  const result = readUserFromHeader(req);
  if (result.missing) {
    req.user = null;
    return next();
  }
  if (result.error) {
    return res.status(401).json({ success: false, error: { message: result.error } });
  }
  req.user = result.user;
  next();
}

export function requireRole(...roles) {
  const allowed = roles.map(r => String(r).toLowerCase());
  return (req, res, next) => {
    const role = String(req.user?.role || '').toLowerCase();
    if (!allowed.includes(role)) {
      return res.status(403).json({ success: false, error: { message: 'You do not have permission to do this' } });
    }
    next();
  };
}
export function isAdminUser(user) {
  const list = (process.env.ADMIN_EMAILS || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  return !!user && list.includes(String(user.email || "").toLowerCase());
}

export function requireAdmin(req, res, next) {
  authenticate(req, res, () => {
    if (!isAdminUser(req.user)) {
      return res.status(403).json({ success: false, error: { message: "Admin access required" } });
    }
    next();
  });
}