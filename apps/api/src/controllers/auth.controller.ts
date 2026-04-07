import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/error';

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'Admin@123';
const JWT_SECRET = process.env.JWT_SECRET || 'tactical_secret_key_2024';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Email and password are required', 400));
  }

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign(
      { 
        id: 'admin_id_001', 
        email: ADMIN_EMAIL, 
        role: 'super_admin' 
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    return res.json({
      token,
      user: {
        id: 'admin_id_001',
        email: ADMIN_EMAIL,
        role: 'super_admin',
        name: 'System Admin'
      }
    });
  }

  return next(new AppError('Invalid credentials', 401));
};
