import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireProjectAccess } from '@/lib/auth-helpers';
import { enqueueCompile } from '@/lib/queue';
import { createBuildSchema } from '@leafit/shared';

// POST /api/projects/:id/compile - Trigger compilation
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    await requireProjectAccess(params.id, user.id);

    const body = await request.json();
    const validated = createBuildSchema.parse(body);

    // Check for existing running builds for this user
    const runningBuild = await prisma.build.findFirst({
      where: {
        projectId: params.id,
        status: {
          in: ['QUEUED', 'RUNNING'],
        },
      },
    });

    if (runningBuild) {
      return NextResponse.json({ error: 'A build is already in progress' }, { status: 429 });
    }

    // Create build record
    const build = await prisma.build.create({
      data: {
        projectId: params.id,
        engine: validated.engine,
        entryFile: validated.entryFile,
        status: 'QUEUED',
      },
    });

    // Enqueue compile job
    await enqueueCompile({
      buildId: build.id,
      projectId: params.id,
      entryFile: validated.entryFile,
      engine: validated.engine,
    });

    return NextResponse.json({ build }, { status: 201 });
  } catch (error) {
    console.error('Error creating build:', error);
    return NextResponse.json({ error: 'Failed to create build' }, { status: 500 });
  }
}
