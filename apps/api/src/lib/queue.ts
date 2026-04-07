import { Queue } from 'bullmq';
import redis from './redis';

export const alertQueue = new Queue('alert-queue', {
  connection: redis,
});

export default alertQueue;
