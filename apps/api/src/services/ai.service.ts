import axios from 'axios';
import { AlertFilterService } from './filter.service';
import { AlertType } from '@prisma/client';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

export class AIService {
  /**
   * Forwards a base64 encoded frame to the AI Engine for detection.
   * @param deviceId The ID of the device that captured the frame
   * @param base64Frame The JPEG frame encoded as base64
   */
  static async forwardFrame(deviceId: string, base64Frame: string) {
    try {
      const response = await axios.post(`${AI_ENGINE_URL}/detect`, {
        device_id: deviceId,
        frame: base64Frame,
      });

      const detections = response.data.detections; // Array of { type: string, confidence: number }
      
      if (detections && detections.length > 0) {
        for (const detection of detections) {
          // Map AI engine labels to Prisma AlertType enums
          const type = this.mapDetectionType(detection.type);
          if (type) {
            await AlertFilterService.processDetection(deviceId, {
              type,
              confidence: detection.confidence,
            });
          }
        }
      }
    } catch (error) {
      console.error(`[AI Engine] Error forwarding frame for device ${deviceId}:`, (error as Error).message);
    }
  }

  private static mapDetectionType(aiLabel: string): AlertType | null {
    const mapping: Record<string, AlertType> = {
      'crowd': AlertType.CROWD_DENSITY,
      'unauthorized': AlertType.UNAUTHORIZED_ACCESS,
      'misuse': AlertType.EQUIPMENT_MISUSE,
      'fire': AlertType.FIRE_HAZARD,
      'loitering': AlertType.LOITERING,
      'shout': AlertType.VOCAL_DISTURBANCE,
    };
    return mapping[aiLabel] || null;
  }
}
