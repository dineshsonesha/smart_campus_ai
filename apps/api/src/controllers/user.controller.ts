import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { UserRole } from '@prisma/client';

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  const { role } = req.query;
  const users = await prisma.user.findMany({
    where: role ? { role: role as UserRole } : {},
    orderBy: { name: 'asc' },
  });
  res.json(users);
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, phone, role } = req.body;
  const user = await prisma.user.create({
    data: { name, email, phone, role: role || UserRole.TEACHER },
  });
  res.status(201).json(user);
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone, role, shiftStart, shiftEnd } = req.body;
    
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;
    if (shiftStart !== undefined) updateData.shiftStart = Number(shiftStart);
    if (shiftEnd !== undefined) updateData.shiftEnd = Number(shiftEnd);

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
    });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  await prisma.user.delete({
    where: { id: req.params.id },
  });
  res.status(204).end();
};
