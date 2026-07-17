import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', { maxRetriesPerRequest: null });
const queue = new Queue('foundation', { connection });

new Worker('foundation', async () => undefined, { connection });
void queue.waitUntilReady();
