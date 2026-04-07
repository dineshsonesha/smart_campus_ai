import dotenv from 'dotenv';
import { alertWorker } from './workers/alert.worker';
import { emailWorker } from './workers/email.worker';
import { prisma } from './lib/prisma';
import { redis } from './lib/redis';

dotenv.config();

console.log('🚀 Smart-Eye Alert Worker Service Starting...');

// Middleware for workers logging
alertWorker.on('completed', (job) => {
  console.log(`[Queue] Alert Job ${job.id} completed!`);
});

alertWorker.on('failed', (job, err) => {
  console.error(`[Queue] Alert Job ${job?.id} failed:`, err.message);
});

emailWorker.on('completed', (job) => {
  console.log(`[Queue] Email Job ${job.id} completed!`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`[Queue] Email Job ${job?.id} failed on attempt ${job?.attemptsMade}:`, err.message);
});

async function main() {
  try {
    // Check DB Connection
    await prisma.$connect();
    console.log('📦 Database Connected');

    // Check Redis Connection
    await redis.ping();
    console.log('💾 Redis Connected');

    console.log('🤖 Workers are active and listening for tactical jobs...');
  } catch (error) {
    console.error('❌ Failed to start workers:', (error as Error).message);
    process.exit(1);
  }
}

main();
