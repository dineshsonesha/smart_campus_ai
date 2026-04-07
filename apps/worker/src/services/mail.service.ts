import nodemailer from 'nodemailer';
import { prisma } from '../lib/prisma';
import { EmailStatus } from '@prisma/client';

export class MailService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  static async sendAlertEmail(data: {
    alertId: string;
    to: string;
    subject: string;
    body: string;
    imageUrl?: string | null;
  }) {
    try {
      // 1. Create initial EmailRecord
      const record = await prisma.emailRecord.create({
        data: {
          alertId: data.alertId,
          recipient: data.to,
          subject: data.subject,
          content: data.body,
          status: EmailStatus.PENDING,
        },
      });

      // 2. Prepare HTML with image if available
      const htmlBody = `
        <div style="font-family: 'Courier New', Courier, monospace; background: #000; color: #0f0; padding: 20px; border: 1px solid #0f0;">
          <h2 style="border-bottom: 1px solid #0f0; padding-bottom: 10px;">${data.subject}</h2>
          <div style="white-space: pre-wrap; margin-bottom: 20px;">${data.body}</div>
          
          ${data.imageUrl ? `
          <div style="margin-top: 20px; border: 1px solid #0f0; padding: 10px;">
            <p style="color: #0f0;">[ CAPTURED SNAPSHOT ]</p>
            <img src="${data.imageUrl}" alt="Alert Snapshot" style="max-width: 100%; border: 1px solid #030;" />
          </div>
          ` : ''}
          
          <div style="margin-top: 20px; font-size: 12px; color: #060;">
            SYSTEM: SMART-EYE TACTICAL HUB | [AUTHENTICATED SESSION]
          </div>
        </div>
      `;

      // 3. Send via SMTP
      const info = await this.transporter.sendMail({
        from: '"Smart-Eye AI" <alerts@smartcampus.ai>',
        to: data.to,
        subject: data.subject,
        text: data.body,
        html: htmlBody,
      });

      console.log(`[Mail Service] Email sent to ${data.to}: ${info.messageId}`);

      // 3. Update Record
      await prisma.emailRecord.update({
        where: { id: record.id },
        data: { 
          status: EmailStatus.SENT,
          sentAt: new Date(),
        },
      });

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`[Mail Service] Sending failed to ${data.to}:`, (error as Error).message);
      
      // Update DB if record exists (we might not have a record if create failed)
      // Throw error to trigger BullMQ retry
      throw error;
    }
  }
}
