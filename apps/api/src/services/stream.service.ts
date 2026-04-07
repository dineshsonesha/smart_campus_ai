import ffmpeg from 'fluent-ffmpeg';
import { AIService } from './ai.service';
import prisma from '../lib/prisma';
import path from 'path';
import fs from 'fs';

export class StreamService {
  private static activeProcesses = new Map<string, ffmpeg.FfmpegCommand>();
  private static restartCounts = new Map<string, number>();
  private static MAX_RESTARTS = 10;

  /**
   * Initializes many RTSP stream extractors for each online camera device.
   */
  static async initializeAllStreams() {
    const devices = await prisma.device.findMany({
      where: { 
        status: 'ONLINE',
        category: 'CAMERA',
        streamUrl: { not: null }
      },
    });

    for (const device of devices) {
      if (device.streamUrl) {
        this.startStream(device.id, device.streamUrl);
      }
    }
  }

  /**
   * Spawns an ffmpeg process to extract frames from an RTSP URL.
   * Includes auto-restart logic.
   */
  static startStream(deviceId: string, rtspUrl: string) {
    if (this.activeProcesses.has(deviceId)) {
      console.log(`[Stream] Stream for device ${deviceId} is already active.`);
      return;
    }

    console.log(`[Stream] Starting extractor for device ${deviceId} at ${rtspUrl}`);

    const command = ffmpeg(rtspUrl)
      .inputOptions([
        '-rtsp_transport tcp', // Use TCP for RTSP stability
        '-hwaccel auto',        // Attempt hardware acceleration
      ])
      .outputOptions([
        '-f image2pipe',      // Output to stream pipe
        '-vcodec mjpeg',      // MJPEG for easy base64 conversion
        '-q:v 2',             // High quality
        '-update 1',          // Overwrite mode if saving to file (not used here)
      ])
      .fps(3) // Default 3 FPS
      .on('start', (cmd) => {
        console.log(`[Stream] FFmpeg started for device ${deviceId}`);
        this.restartCounts.set(deviceId, 0); // Reset restart count on success
      })
      .on('error', (err) => {
        console.error(`[Stream] FFmpeg error for device ${deviceId}:`, err.message);
        this.handleRestart(deviceId, rtspUrl);
      })
      .on('end', () => {
        console.log(`[Stream] FFmpeg process ended for device ${deviceId}`);
        this.handleRestart(deviceId, rtspUrl);
      });

    // Extract frames from pipe
    const ffStream = command.pipe();
    
    let buffer = Buffer.alloc(0);
    const SOI = Buffer.from([0xff, 0xd8]); // JPEG Start Of Image
    const EOI = Buffer.from([0xff, 0xd9]); // JPEG End Of Image

    ffStream.on('data', (chunk: Buffer) => {
      buffer = Buffer.concat([buffer, chunk]);
      
      let soiIndex = buffer.indexOf(SOI);
      let eoiIndex = buffer.indexOf(EOI, soiIndex);

      while (soiIndex !== -1 && eoiIndex !== -1) {
        const frame = buffer.slice(soiIndex, eoiIndex + 2);
        const base64Frame = frame.toString('base64');
        
        // Forward to AI service asynchronously
        AIService.forwardFrame(deviceId, base64Frame).catch(console.error);

        buffer = buffer.slice(eoiIndex + 2);
        soiIndex = buffer.indexOf(SOI);
        eoiIndex = buffer.indexOf(EOI, soiIndex);
      }
    });

    this.activeProcesses.set(deviceId, command);
  }

  private static handleRestart(deviceId: string, rtspUrl: string) {
    this.activeProcesses.delete(deviceId);
    
    const count = (this.restartCounts.get(deviceId) || 0) + 1;
    this.restartCounts.set(deviceId, count);

    if (count <= this.MAX_RESTARTS) {
      const delay = Math.min(1000 * Math.pow(2, count), 30000); // Exponential backoff up to 30s
      console.log(`[Stream] Restarting device ${deviceId} in ${delay/1000}s (Attempt ${count}/${this.MAX_RESTARTS})`);
      
      setTimeout(() => this.startStream(deviceId, rtspUrl), delay);
    } else {
      console.error(`[Stream] Max restarts reached for device ${deviceId}. Giving up.`);
    }
  }

  static stopStream(deviceId: string) {
    const command = this.activeProcesses.get(deviceId);
    if (command) {
      command.kill('SIGTERM');
      this.activeProcesses.delete(deviceId);
      console.log(`[Stream] Stopped stream for device ${deviceId}`);
    }
  }
}
