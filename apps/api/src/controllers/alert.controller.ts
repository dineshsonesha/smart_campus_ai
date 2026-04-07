import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/error';
import { SocketService } from '../services/socket.service';
import { alertQueue } from '../lib/queue';
import { AlertSeverity } from '@prisma/client';

export const getAlerts = async (req: Request, res: Response, next: NextFunction) => {
  const alerts = await prisma.alert.findMany({
    include: { 
      device: { include: { classroom: true, assignedUser: true } }, 
      classroom: true 
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(alerts);
};

/**
 * Handles detection from AI Engine.
 * Instead of manual creation, it pushes to a high-priority queue for the worker to handle.
 */
export const createAlertFromDetection = async (req: Request, res: Response, next: NextFunction) => {
  const { deviceId, type, severity = AlertSeverity.MEDIUM, title, description, imageUrl, metadata } = req.body;
  
  // 1. Verify device exists
  const device = await prisma.device.findUnique({
    where: { id: deviceId },
  });

  if (!device) {
    return next(new AppError('Device not recognized by system', 404));
  }

  // 2. Add to Alert Queue for Worker to handle:
  // - Alert Record Creation
  // - Personnel Resolution (via Schedule or Role)
  // - Automatic Email Dispatch (for High/Critical)
  // - Cooldown Management
  await alertQueue.add('process-detection', {
    deviceId,
    type,
    severity,
    title: title || `AI Detection: ${type}`,
    description,
    imageUrl,
    metadata,
  }, {
    priority: severity === AlertSeverity.CRITICAL ? 1 : 2,
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  });

  console.log(`[Alert Controller] Detection queued: ${type} from ${deviceId}`);

  res.status(202).json({ 
    status: 'accepted', 
    message: 'Detection queued for processing and automatic alert dispatch.' 
  });
};

export const updateAlertStatus = async (req: Request, res: Response, next: NextFunction) => {
  const { status, targetUserId } = req.body;
  const alert = await prisma.alert.update({
    where: { id: req.params.id },
    data: { 
      status,
      targetUserId: targetUserId === undefined ? undefined : (targetUserId || null),
    },
  });

  SocketService.emitToRoom('alerts:feed', 'alert:updated', alert);
  res.json(alert);
};
