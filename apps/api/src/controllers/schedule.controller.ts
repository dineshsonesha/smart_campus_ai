import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/error';
import { DayOfWeek } from '@prisma/client';

export const getSchedules = async (req: Request, res: Response, next: NextFunction) => {
  const { classroom_id } = req.query;
  const schedules = await prisma.schedule.findMany({
    where: classroom_id ? { classroomId: classroom_id as string } : {},
    include: { teacher: true, classroom: true },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
  });
  res.json(schedules);
};

export const createSchedule = async (req: Request, res: Response, next: NextFunction) => {
  const { classroomId, dayOfWeek, startTime, endTime, teacherId } = req.body;
  
  const schedule = await prisma.schedule.upsert({
    where: {
      classroomId_dayOfWeek_startTime: {
        classroomId,
        dayOfWeek: dayOfWeek as DayOfWeek,
        startTime,
      },
    },
    update: {
      endTime,
      teacherId,
    },
    create: {
      classroomId,
      dayOfWeek: dayOfWeek as DayOfWeek,
      startTime,
      endTime,
      teacherId,
    },
    include: { teacher: true },
  });
  
  res.status(201).json(schedule);
};

export const resolveCurrentTeacher = async (req: Request, res: Response, next: NextFunction) => {
  const { classroom_id } = req.query;
  if (!classroom_id) {
    return next(new AppError('classroom_id is required', 400));
  }

  const now = new Date();
  const dayOfWeek = getDayOfWeekEnum(now.getDay());
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const schedule = await prisma.schedule.findFirst({
    where: {
      classroomId: classroom_id as string,
      dayOfWeek: dayOfWeek as DayOfWeek,
      startTime: { lte: currentTime },
      endTime: { gte: currentTime },
    },
    include: { teacher: true },
  });

  if (!schedule) {
    return res.json({ teacher: null, message: 'No active teacher at this time' });
  }

  res.json(schedule.teacher);
};

const getDayOfWeekEnum = (day: number): string => {
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  return days[day];
};

export const deleteSchedule = async (req: Request, res: Response, next: NextFunction) => {
  await prisma.schedule.delete({
    where: { id: req.params.id },
  });
  res.status(204).end();
};
