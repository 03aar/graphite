import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireProjectAccess } from '@/lib/auth-helpers';
import { updateFileSchema, renameFileSchema } from '@leafit/shared';

// GET /api/projects/:id/files/:path - Get file content
export async function GET(request: NextRequest, { params }: { params: { id: string; path: string } }) {
  try {
    const user = await requireAuth();
    await requireProjectAccess(params.id, user.id);

    const decodedPath = decodeURIComponent(params.path);

    const file = await prisma.file.findUnique({
      where: {
        projectId_path: {
          projectId: params.id,
          path: decodedPath,
        },
      },
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    return NextResponse.json({ file });
  } catch (error) {
    console.error('Error fetching file:', error);
    return NextResponse.json({ error: 'Failed to fetch file' }, { status: 500 });
  }
}

// PATCH /api/projects/:id/files/:path - Update file content
export async function PATCH(request: NextRequest, { params }: { params: { id: string; path: string } }) {
  try {
    const user = await requireAuth();
    await requireProjectAccess(params.id, user.id, 'EDITOR');

    const decodedPath = decodeURIComponent(params.path);
    const body = await request.json();

    // Check if this is a rename operation
    if ('newPath' in body) {
      const validated = renameFileSchema.parse(body);

      const file = await prisma.file.update({
        where: {
          projectId_path: {
            projectId: params.id,
            path: decodedPath,
          },
        },
        data: {
          path: validated.newPath,
        },
      });

      return NextResponse.json({ file });
    }

    // Otherwise, update content
    const validated = updateFileSchema.parse(body);

    const file = await prisma.file.update({
      where: {
        projectId_path: {
          projectId: params.id,
          path: decodedPath,
        },
      },
      data: {
        content: validated.content,
        size: validated.content.length,
        updatedAt: new Date(),
      },
    });

    // Update project updatedAt
    await prisma.project.update({
      where: { id: params.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ file });
  } catch (error) {
    console.error('Error updating file:', error);
    return NextResponse.json({ error: 'Failed to update file' }, { status: 500 });
  }
}
