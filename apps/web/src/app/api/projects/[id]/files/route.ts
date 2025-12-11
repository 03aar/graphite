import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireProjectAccess } from '@/lib/auth-helpers';
import { createFileSchema } from '@leafit/shared';

// GET /api/projects/:id/files - List project files
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    await requireProjectAccess(params.id, user.id);

    const files = await prisma.file.findMany({
      where: { projectId: params.id },
      orderBy: { path: 'asc' },
    });

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
  }
}

// POST /api/projects/:id/files - Create a new file
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    await requireProjectAccess(params.id, user.id, 'EDITOR');

    const body = await request.json();
    const validated = createFileSchema.parse(body);

    // Check if file already exists
    const existing = await prisma.file.findUnique({
      where: {
        projectId_path: {
          projectId: params.id,
          path: validated.path,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'File already exists' }, { status: 409 });
    }

    const file = await prisma.file.create({
      data: {
        projectId: params.id,
        path: validated.path,
        isDir: validated.isDir,
        content: validated.content || (validated.isDir ? null : ''),
        size: validated.content?.length || 0,
      },
    });

    // Update project updatedAt
    await prisma.project.update({
      where: { id: params.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ file }, { status: 201 });
  } catch (error) {
    console.error('Error creating file:', error);
    return NextResponse.json({ error: 'Failed to create file' }, { status: 500 });
  }
}

// DELETE /api/projects/:id/files?path=... - Delete a file
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    await requireProjectAccess(params.id, user.id, 'EDITOR');

    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    await prisma.file.delete({
      where: {
        projectId_path: {
          projectId: params.id,
          path,
        },
      },
    });

    // Update project updatedAt
    await prisma.project.update({
      where: { id: params.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
