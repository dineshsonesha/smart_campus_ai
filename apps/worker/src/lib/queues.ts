import { Queue } from 'bullmq';
import redis from './redis';

export const alertQueue = new Queue('alert-queue', {
  connection: redis,
});

export const emailQueue = new Queue('email-queue', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 30000, // 30s, then 2m, then 5m as per spec
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export default { alertQueue, emailQueue };
