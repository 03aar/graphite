import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { CompileJobData } from '@leafit/shared';
import { compileLatex } from './compiler.js';
import { uploadFile } from './storage.js';

const prisma = new PrismaClient();

const connection = {
  host: process.env.REDIS_URL?.replace('redis://', '').split(':')[0] || 'localhost',
  port: parseInt(process.env.REDIS_URL?.split(':')[2] || '6379'),
};

const worker = new Worker<CompileJobData>(
  'compile',
  async (job: Job<CompileJobData>) => {
    const { buildId, projectId, entryFile, engine } = job.data;

    console.log(`[Worker] Processing build ${buildId} for project ${projectId}`);

    try {
      // Update build status to running
      await prisma.build.update({
        where: { id: buildId },
        data: {
          status: 'RUNNING',
          startedAt: new Date(),
        },
      });

      // Get project files
      const files = await prisma.file.findMany({
        where: {
          projectId,
          isDir: false,
        },
      });

      // Compile LaTeX
      const result = await compileLatex({
        files: files.map((f: any) => ({
          path: f.path,
          content: f.content || '',
        })),
        entryFile,
        engine,
      });

      // Upload PDF and logs to storage
      const pdfKey = `projects/${projectId}/builds/${buildId}/output.pdf`;
      const logKey = `projects/${projectId}/builds/${buildId}/output.log`;

      await uploadFile(pdfKey, result.pdf, 'application/pdf');
      await uploadFile(logKey, result.log, 'text/plain');

      // Update build status to succeeded
      await prisma.build.update({
        where: { id: buildId },
        data: {
          status: 'SUCCEEDED',
          finishedAt: new Date(),
          pdfUrl: pdfKey,
          logUrl: logKey,
        },
      });

      // Create snapshot
      await prisma.snapshot.create({
        data: {
          projectId,
          buildId,
          meta: JSON.stringify({
            fileCount: files.length,
            engine,
          }),
        },
      });

      console.log(`[Worker] Build ${buildId} completed successfully`);
    } catch (error: any) {
      console.error(`[Worker] Build ${buildId} failed:`, error);

      // Upload error log
      const logKey = `projects/${projectId}/builds/${buildId}/error.log`;
      await uploadFile(logKey, error.message || 'Unknown error', 'text/plain');

      // Update build status to failed
      await prisma.build.update({
        where: { id: buildId },
        data: {
          status: 'FAILED',
          finishedAt: new Date(),
          logUrl: logKey,
        },
      });

      throw error;
    }
  },
  {
    connection,
    concurrency: 2,
    limiter: {
      max: 10,
      duration: 60000,
    },
  }
);

worker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err);
});

console.log('[Worker] Compile worker started');

process.on('SIGTERM', async () => {
  console.log('[Worker] SIGTERM received, closing worker');
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});
