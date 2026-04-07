import { Worker, Job } from 'bullmq';
import redis from '../lib/redis';
import prisma from '../lib/prisma';
import { AIService } from '../services/ai.service';
import { MailService } from '../services/mail.service';
import { AlertLogAction, EmailStatus } from '@prisma/client';
import { io } from 'socket.io-client';

const API_URL = process.env.API_URL || 'http://localhost:3001';
const socket = io(API_URL);

export const emailWorker = new Worker(
  'email-queue',
  async (job: Job) => {
    const { alertId, toEmail, recipientName, type, location, severity, imageUrl } = job.data;
    console.log(`[Email Worker] Processing job ${job.id} for alert ${alertId}`);

    // 1. Generate Email Content (Gemini)
    const content = await AIService.generateAlertEmail({
      facultyName: recipientName,
      type,
      location,
      severity: severity || 'MEDIUM',
      time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    });

    // 2. Send Email (Nodemailer)
    try {
      await MailService.sendAlertEmail({
        alertId,
        to: toEmail,
        subject: content.subject,
        body: content.body,
        imageUrl,
      });

      // 3. Log Action: NOTIFIED_STAFF
      await prisma.alertLog.create({
        data: {
          alertId,
          action: AlertLogAction.NOTIFIED_STAFF,
          note: `Tactical Alert Email Successfully Sent to ${toEmail}`,
        },
      });

      // 4. Update Email status in Socket.IO
      socket.emit('email:status', { alertId, status: 'SENT' });

    } catch (error) {
      console.error(`[Email Worker] Error on attempt ${job.attemptsMade + 1}:`, (error as Error).message);
      
      // If final attempt
      if (job.attemptsMade >= 2) {
         await prisma.alertLog.create({
          data: {
            alertId,
            action: AlertLogAction.UPDATED,
            note: `Critical: Email Delivery Failed after 3 attempts. Error: ${(error as Error).message}`,
          },
        });
        socket.emit('email:status', { alertId, status: 'FAILED' });
      }
      
      // Re-throw to trigger BullMQ retry logic
      throw error;
    }
  },
  { connection: redis }
);
