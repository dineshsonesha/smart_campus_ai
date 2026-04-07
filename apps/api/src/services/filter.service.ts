import { redis } from '../lib/redis';
import prisma from '../lib/prisma';
import { alertQueue } from '../lib/queue';
import { AlertType, AlertSeverity, DeviceStatus } from '@prisma/client';

interface DetectionFrame {
  type: AlertType;
  confidence: Float32Array | number;
  timestamp: number;
}

interface BufferEntry {
  frames: DetectionFrame[];
  firstSeen: number;
  lastSeen: number;
}

// Stage 1 Consistency Config
const CONSISTENCY_FRAMES = 6;
const CONSISTENCY_TIME_MS = 2000; // 2 seconds

// Stage 2 persistence threshold
const PERSISTENCE_THRESHOLD_MS = 5000; // 5 seconds

// Stage 3 confidence threshold
const MIN_AVG_CONFIDENCE = 0.65;

export class AlertFilterService {
  private static buffer = new Map<string, BufferEntry>();

  /**
   * Processes a new detection from the AI Engine.
   * @param deviceId ID of the device that captured the detection
   * @param detection Type and confidence of the detection
   */
  static async processDetection(deviceId: string, detection: { type: AlertType; confidence: number }) {
    const now = Date.now();
    const key = `${deviceId}:${detection.type}`;
    
    let entry = this.buffer.get(key);
    
    if (!entry) {
      entry = {
        frames: [],
        firstSeen: now,
        lastSeen: now,
      };
      this.buffer.set(key, entry);
    }

    entry.frames.push({ ...detection, timestamp: now });
    entry.lastSeen = now;

    // Keep only recent frames (e.g., last 10 seconds)
    entry.frames = entry.frames.filter(f => now - f.timestamp < 10000);

    // Stage 1: Consistency (6 frames AND 2 seconds)
    const duration = entry.lastSeen - entry.firstSeen;
    if (entry.frames.length < CONSISTENCY_FRAMES || duration < CONSISTENCY_TIME_MS) {
      return;
    }

    // Stage 2: Time Threshold (Persistence for 5s)
    if (duration < PERSISTENCE_THRESHOLD_MS) {
      return;
    }

    // Stage 3: Confidence Score Averaging
    const avgConfidence = entry.frames.reduce((acc, f) => acc + (f.confidence as number), 0) / entry.frames.length;
    if (avgConfidence < MIN_AVG_CONFIDENCE) {
      return;
    }

    // Stage 4: Cooldown Check (Redis)
    const cooldownKey = `cooldown:${deviceId}:${detection.type}`;
    const onCooldown = await redis.get(cooldownKey);
    if (onCooldown) {
      return;
    }

    // Stage 5: Context Awareness (DB)
    const passContext = await this.checkContext(deviceId, detection.type);
    if (!passContext) {
      return;
    }

    // Pipeline PASSED -> Create Alert & Trigger Queue
    await this.triggerAlert(deviceId, detection.type, avgConfidence, entry.frames[0]);
    
    // Clear buffer after triggering
    this.buffer.delete(key);
    
    // Set Cooldown (e.g., 5 minutes)
    await redis.set(cooldownKey, 'active', 'EX', 300);
  }

  private static async checkContext(deviceId: string, type: AlertType): Promise<boolean> {
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
      include: { classroom: true },
    });

    if (!device) return false;

    // Example contextual logic:
    // Unauthorized access check during schedule
    if (type === AlertType.UNAUTHORIZED_ACCESS) {
      const now = new Date();
      const dayOfWeek = this.getDayOfWeek(now.getDay());
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      const activeSchedule = await prisma.schedule.findFirst({
        where: {
          classroomId: device.classroomId,
          dayOfWeek: dayOfWeek as any,
          startTime: { lte: currentTime },
          endTime: { gte: currentTime },
        },
      });

      if (activeSchedule) {
        // If there's a scheduled class, 'unauthorized access' might be a false positive or handle differently
      }
    }

    return true;
  }

  private static async triggerAlert(deviceId: string, type: AlertType, confidence: number, firstFrame: any) {
    // 1. Resolve the device to get its classroom context
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
      select: { classroomId: true }
    });

    if (!device) return;

    const alert = await prisma.alert.create({
      data: {
        deviceId,
        classroomId: device.classroomId,
        type,
        severity: AlertSeverity.MEDIUM,
        title: `AI Detected ${type.replace('_', ' ')}`,
        metadata: { avgConfidence: confidence },
      },
    });

    await alertQueue.add('new-alert', { alertId: alert.id });
    console.log(`[Alert] Filter Passed: ${type} on ${deviceId}`);
  }

  private static getDayOfWeek(day: number): string {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[day];
  }
}
