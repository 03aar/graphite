import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, checkProjectAccess } from '@/lib/auth-helpers';
import { getFileUrl } from '@/lib/storage';

// GET /api/builds/:id - Get build status and results
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();

    const build = await prisma.build.findUnique({
      where: { id: params.id },
      include: {
        project: true,
      },
    });

    if (!build) {
      return NextResponse.json({ error: 'Build not found' }, { status: 404 });
    }

    // Check access to project
    const { access } = await checkProjectAccess(build.projectId, user.id);
    if (!access) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Generate signed URLs if available
    let pdfUrl = build.pdfUrl;
    let logUrl = build.logUrl;

    if (pdfUrl) {
      pdfUrl = await getFileUrl(pdfUrl);
    }
    if (logUrl) {
      logUrl = await getFileUrl(logUrl);
    }

    return NextResponse.json({
      build: {
        ...build,
        pdfUrl,
        logUrl,
      },
    });
  } catch (error) {
    console.error('Error fetching build:', error);
    return NextResponse.json({ error: 'Failed to fetch build' }, { status: 500 });
  }
}
