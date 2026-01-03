import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

// Extend Express Request to include user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    employeeId: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Middleware to verify JWT token and attach user to request
 * Used to protect routes that require authentication
 */
export async function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.'
      });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    
    // Verify user still exists and is email verified
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        employeeId: true,
        emailVerified: true
      }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    if (!user.emailVerified) {
      res.status(403).json({
        success: false,
        message: 'Email not verified. Please verify your email before accessing this resource.'
      });
      return;
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
      return;
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
}

/**
 * Middleware to check if user has required role(s)
 * Must be used after authenticateToken
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    // Normalize role comparison (backend uses uppercase, frontend uses lowercase)
    const userRole = req.user.role.toUpperCase();
    const normalizedAllowedRoles = allowedRoles.map(r => r.toUpperCase());

    if (!normalizedAllowedRoles.includes(userRole)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions. This action requires one of the following roles: ' + allowedRoles.join(', ')
      });
      return;
    }

    next();
  };
}

export { JWT_SECRET };

