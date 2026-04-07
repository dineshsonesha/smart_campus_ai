import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/error';

export const getDevices = async (req: Request, res: Response, next: NextFunction) => {
  const devices = await prisma.device.findMany({
    include: { 
      classroom: true,
      assignedUser: {
        select: { id: true, name: true, role: true }
      }
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(devices);
};

export const createDevice = async (req: Request, res: Response, next: NextFunction) => {
  const { name, category, streamUrl, ipAddress, classroomId, assignedUserId } = req.body;
  
  if (!classroomId) {
    return next(new AppError('classroomId is mandatory for device creation', 400));
  }

  const device = await prisma.device.create({
    data: {
      name,
      category,
      streamUrl,
      ipAddress,
      classroomId,
      assignedUserId: assignedUserId || null,
    },
    include: { classroom: true, assignedUser: true },
  });
  res.status(201).json(device);
};

export const updateDevice = async (req: Request, res: Response, next: NextFunction) => {
  const { name, category, streamUrl, ipAddress, classroomId, assignedUserId } = req.body;
  
  const device = await prisma.device.update({
    where: { id: req.params.id },
    data: {
      name,
      category,
      streamUrl,
      ipAddress,
      classroomId,
      assignedUserId: assignedUserId === undefined ? undefined : (assignedUserId || null),
    },
    include: { classroom: true, assignedUser: true },
  });
  res.json(device);
};

export const deleteDevice = async (req: Request, res: Response, next: NextFunction) => {
  await prisma.device.delete({
    where: { id: req.params.id },
  });
  res.status(204).end();
};
