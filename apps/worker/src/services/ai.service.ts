import { GoogleGenerativeAI } from '@google/generative-ai';
import { AlertType } from '@prisma/client';

const API_KEY = process.env.GEMINI_API_KEY || '';

export class AIService {
  private static genAI = new GoogleGenerativeAI(API_KEY);

  static async generateAlertEmail(data: {
    facultyName: string;
    type: AlertType;
    location: string;
    description?: string;
    severity: string;
    time: string;
  }) {
    const dashboardUrl = process.env.DASHBOARD_URL || 'http://localhost:3000';
    if (!API_KEY) {
      console.warn('[AI Service] No GEMINI_API_KEY provided. Using fallback template.');
      return this.fallbackTemplate(data);
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
        You are the Smart-Eye AI Surveillance System. 
        Generate a professional yet hacker-themed alert email to a faculty member.
        
        Details:
        Faculty Name: ${data.facultyName}
        Location: ${data.location}
        Issue: ${data.type.replace('_', ' ')}
        Severity: ${data.severity}
        Timestamp: ${data.time}
        Dashboard URL: ${dashboardUrl}
        
        Requirements:
        1. Subject line should be urgent and tactical.
        2. Body should explain that a visual detection has triggered a protocol.
        3. Mention that a captured SNAPSHOT is attached for verification.
        4. Maintain a "Cyber-Security/Surveillance" aesthetic.
        5. Provide a clear "View Live Feed" instruction with this link: ${dashboardUrl}/live?room=${encodeURIComponent(data.location)}
        
        Format the response as:
        SUBJECT: [Your Subject Line]
        BODY: [Your Email Body]
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const subjectMatch = text.match(/SUBJECT:\s*(.*)/);
      const bodyMatch = text.match(/BODY:\s*([\s\S]*)/);

      return {
        subject: subjectMatch ? subjectMatch[1].trim() : `ALERT: ${data.type} in ${data.location}`,
        body: bodyMatch ? bodyMatch[1].trim() : text,
      };
    } catch (error) {
      console.error('[AI Service] Gemini Generation Failed:', (error as Error).message);
      return this.fallbackTemplate(data);
    }
  }

  private static fallbackTemplate(data: {
    facultyName: string;
    type: AlertType;
    location: string;
    severity: string;
    time: string;
  }) {
    const dashboardUrl = process.env.DASHBOARD_URL || 'http://localhost:3000';
    return {
      subject: `[SYSTEM ALERT] ${data.type.replace('_', ' ')} Detected in ${data.location}`,
      body: `
        COMMANDER ${data.facultyName.toUpperCase()},
        
        Our automated surveillance nodes have flagged a ${data.type} event at ${data.location}.
        
        DETAILS:
        - Severity: ${data.severity}
        - Timestamp: ${data.time}
        
        Protocol 404 has been engaged. Please review the visual data and attached SNAPSHOT on the Smart-Eye Terminal.
        
        VIEW LIVE FEED: ${dashboardUrl}/live?room=${encodeURIComponent(data.location)}
        
        Stay Vigilant.
      `,
    };
  }
}
