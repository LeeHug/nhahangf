import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'legourmet-secret-key-super-safe-2026-audit';

export interface AuthenticatedUserPayload {
  id: string;
  email: string;
  role: 'customer' | 'admin' | 'staff';
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUserPayload;
}

// Generate secure JWT token (valid for 24 hours)
export function generateToken(payload: AuthenticatedUserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

// Verify token middleware
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized: Bạn cần đăng nhập để thực hiện thao tác này.',
      code: 'AUTH_REQUIRED'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUserPayload;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      error: 'Forbidden: Phiên đăng nhập không hợp lệ hoặc đã hết hạn.',
      code: 'TOKEN_INVALID'
    });
  }
}

// Require specific roles (RBAC)
export function requireRoles(roles: Array<'customer' | 'admin' | 'staff'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Tài khoản không có quyền thực hiện thao tác này (yêu cầu vai trò: ${roles.join(', ')}).`,
        code: 'ACCESS_DENIED'
      });
    }
    next();
  };
}
