import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import crypto from 'crypto';

// Lỗ hổng 4 (JWT Secret Hardcode): Loại bỏ triệt để chuỗi khóa cố định trong mã nguồn.
// Nếu biến môi trường JWT_SECRET chưa được thiết lập, sinh tự động chuỗi ngẫu nhiên 256-bit bằng CSPRNG (crypto.randomBytes).
function resolveJwtSecret(): string {
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.trim().length >= 16) {
    return process.env.JWT_SECRET.trim();
  }
  const generatedSecret = crypto.randomBytes(32).toString('hex');
  console.warn('⚠️ [BẢO MẬT] Biến môi trường JWT_SECRET chưa được cấu hình. Hệ thống đã tự động tạo khóa mật ngẫu nhiên 256-bit bằng CSPRNG (không dùng khóa cố định).');
  return generatedSecret;
}

export const JWT_SECRET = resolveJwtSecret();

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
