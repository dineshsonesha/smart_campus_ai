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
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(user);
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  await prisma.user.delete({
    where: { id: req.params.id },
  });
  res.status(204).end();
};
