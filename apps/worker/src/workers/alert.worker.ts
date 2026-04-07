import { Worker, Job } from 'bullmq';
import redis from '../lib/redis';
import prisma from '../lib/prisma';
import { emailQueue } from '../lib/queues';
import { AlertType, AlertSeverity, AlertLogAction, UserRole, RoomType } from '@prisma/client';
import { io } from 'socket.io-client';

const API_URL = process.env.API_URL || 'http://localhost:3001';
const socket = io(API_URL);

/**
 * Alert Worker: Processes AI detections, resolves target personnel,
 * and triggers notification flows.
 */
export const alertWorker = new Worker(
  'alert-queue',
  async (job: Job) => {
    const { deviceId, type, metadata, imageUrl, severity = AlertSeverity.MEDIUM } = job.data;
    console.log(`[Alert Worker] Processing job ${job.id} for device ${deviceId}`);

    // 1. Resolve Device and Classroom Context
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
      include: { classroom: true },
    });

    if (!device) {
      console.error(`[Alert Worker] Device ${deviceId} not found.`);
      return;
    }

    // 2. Create Alert Record
    const alert = await prisma.alert.create({
      data: {
        deviceId,
        classroomId: device.classroomId,
        type: type as AlertType,
        severity: severity as AlertSeverity,
        title: `AI Alert: ${type.replace('_', ' ')}`,
        imageUrl,
        metadata,
      },
    });

    // 3. Log Action: CREATED
    await prisma.alertLog.create({
      data: {
        alertId: alert.id,
        action: AlertLogAction.CREATED,
        note: `Alert auto-generated. Severity: ${severity}`,
      },
    });

    // 4. Resolve Target Personnel based on RoomType
    const recipient = await resolveRecipient(device);

    if (recipient) {
      console.log(`[Alert Worker] Recipient resolved: ${recipient.name} (${recipient.email})`);
      
      // Update Alert with target
      await prisma.alert.update({
        where: { id: alert.id },
        data: { targetUserId: recipient.id }
      });

      // 5. Enqueue Email Job (Automatic for High/Critical or if requested)
      // Requirements: Automatic high priority alerts to mail
      if (severity === AlertSeverity.HIGH || severity === AlertSeverity.CRITICAL || severity === AlertSeverity.MEDIUM) {
        await emailQueue.add('send-email', {
          alertId: alert.id,
          recipientId: recipient.id,
          toEmail: recipient.email,
          recipientName: recipient.name,
          type: alert.type,
          location: device.classroom.name,
          imageUrl: alert.imageUrl,
          severity: alert.severity,
        });

        await prisma.alertLog.create({
          data: {
            alertId: alert.id,
            action: AlertLogAction.NOTIFIED_STAFF,
            note: `Email queued for ${recipient.role}: ${recipient.name}`,
          },
        });
      }
    } else {
      console.log(`[Alert Worker] No active recipient resolved for device ${deviceId}`);
    }

    // 6. Cooldown Management
    const cooldownKey = `cooldown:${deviceId}:${type}`;
    await redis.set(cooldownKey, 'active', 'EX', 300); // 5 minutes TTL
    
    await prisma.cooldownRecord.upsert({
      where: { key: `${deviceId}:${type}` },
      update: { expiresAt: new Date(Date.now() + 300 * 1000) },
      create: { 
        key: `${deviceId}:${type}`,
        expiresAt: new Date(Date.now() + 300 * 1000) 
      },
    });

    // 7. Socket.IO Broadcast
    socket.emit('alert:new', alert);
  },
  { connection: redis }
);

/**
 * Resolves the appropriate User to notify based on the room type and current time.
 * Supports:
 * 1. Timetable-based Teacher resolution for Classrooms.
 * 2. Shift-based Personnel resolution for Security/Staff.
 */
async function resolveRecipient(device: any) {
  const classroom = device.classroom;
  
  // Get Asia/Kolkata current day and time
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    hour12: false,
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
  };

  const formatter = new Intl.DateTimeFormat('en-US', options);
  const parts = formatter.formatToParts(now);
  const getPart = (type: string) => parts.find(p => p.type === type)?.value || '';
  
  const weekdayMap: Record<string, string> = {
    'Monday': 'MONDAY', 'Tuesday': 'TUESDAY', 'Wednesday': 'WEDNESDAY',
    'Thursday': 'THURSDAY', 'Friday': 'FRIDAY', 'Saturday': 'SATURDAY', 'Sunday': 'SUNDAY',
  };

  const currentDay = weekdayMap[getPart('weekday')];
  const currentTime = `${getPart('hour')}:${getPart('minute')}`;

  console.log(`[Alert Worker] Resolution Matrix: ${currentDay} ${currentTime} | Sector: ${classroom.name} (${classroom.type})`);

  // Case A: Classroom -> Strict Timetable Resolution
  if (classroom.type === RoomType.CLASSROOM) {
    const schedule = await prisma.schedule.findFirst({
      where: {
        classroomId: classroom.id,
        dayOfWeek: currentDay as any,
        startTime: { lte: currentTime },
        endTime: { gte: currentTime },
      },
      include: { teacher: true },
    });

    if (schedule?.teacher) return schedule.teacher;
  } 

  // Case B: Sector-Role Mapping with Shift Awareness
  let targetRole: UserRole | null = null;
  const currentHour = parseInt(currentTime.split(':')[0]);
  
  if (classroom.type === RoomType.PARKING || classroom.type === RoomType.ENTRANCE) {
    targetRole = UserRole.GUARD;
  } else if (classroom.type === RoomType.LAB) {
    targetRole = UserRole.STAFF;
  } else if (classroom.type === RoomType.OFFICE) {
    targetRole = UserRole.PEON || UserRole.WORKER;
  }

  if (targetRole) {
    // Find personnel of this role who are CURRENTLY on shift
    const activeStaff = await prisma.user.findFirst({
      where: {
        role: targetRole,
        shiftStart: { lte: currentHour },
        shiftEnd: { gte: currentHour },
      },
      orderBy: { createdAt: 'asc' }
    });

    if (activeStaff) return activeStaff;
  }

  // Case C: Fallback to Sector-Assigned User (Manager/Admin)
  if (device.assignedUserId) {
    return prisma.user.findUnique({ where: { id: device.assignedUserId } });
  }

  // Case D: Global Fallback -> System Admin
  return prisma.user.findFirst({
    where: { role: UserRole.ADMIN },
    orderBy: { createdAt: 'asc' }
  });
}
