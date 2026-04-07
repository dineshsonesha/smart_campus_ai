import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export const getClassrooms = async (req: Request, res: Response, next: NextFunction) => {
  const classrooms = await prisma.classroom.findMany({
    include: { devices: true },
    orderBy: { name: 'asc' },
  });
  res.json(classrooms);
};

export const createClassroom = async (req: Request, res: Response, next: NextFunction) => {
  const { name, type } = req.body; // e.g. name: "Classroom A", type: "CLASSROOM"
  const classroom = await prisma.classroom.create({
    data: { 
      name,
      type: type || 'CLASSROOM'
    },
  });
  res.status(201).json(classroom);
};

export const updateClassroom = async (req: Request, res: Response, next: NextFunction) => {
  const classroom = await prisma.classroom.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(classroom);
};

export const deleteClassroom = async (req: Request, res: Response, next: NextFunction) => {
  await prisma.classroom.delete({
    where: { id: req.params.id },
  });
  res.status(204).end();
};
