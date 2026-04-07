import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error';

const JWT_SECRET = process.env.JWT_SECRET || 'tactical_secret_key_2024';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // We can still keep the bypass for development if needed, but for "real" we focus on JWT
  if (process.env.BYPASS_AUTH === 'true') {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // Let subsequent middleware (requireAuth) handle the 401
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = decoded;
    next();
  } catch (err) {
    next(new AppError('Invalid or expired token', 401));
  }
};

export const checkRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (process.env.BYPASS_AUTH === 'true') {
      return next();
    }

    const user = (req as any).user;
    if (!user) {
      return next(new AppError('Unauthenticated', 401));
    }

    if (!roles.includes(user.role)) {
      return next(new AppError('Forbidden: Insufficient permissions', 403));
    }

    next();
  };
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.BYPASS_AUTH === 'true') {
    return next();
  }

  const user = (req as any).user;
  if (!user) {
    return next(new AppError('Unauthenticated', 401));
  }
  next();
};
