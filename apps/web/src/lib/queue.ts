import { Queue, Worker, Job } from 'bullmq';
import { BuildEngine } from '@leafit/shared';

export interface CompileJobData {
  buildId: string;
  projectId: string;
  entryFile: string;
  engine: BuildEngine;
}

const connection = {
  host: process.env.REDIS_URL?.replace('redis://', '').split(':')[0] || 'localhost',
  port: parseInt(process.env.REDIS_URL?.split(':')[2] || '6379'),
};

export const compileQueue = new Queue<CompileJobData>('compile', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: 3600, // Keep for 1 hour
      count: 100,
    },
    removeOnFail: {
      age: 86400, // Keep for 24 hours
    },
  },
});

export async function enqueueCompile(data: CompileJobData): Promise<string> {
  const job = await compileQueue.add('compile', data);
  return job.id!;
}

export async function getJobStatus(jobId: string) {
  const job = await compileQueue.getJob(jobId);
  if (!job) return null;

  const state = await job.getState();
  return {
    id: job.id,
    state,
    progress: job.progress,
    data: job.data,
  };
}
