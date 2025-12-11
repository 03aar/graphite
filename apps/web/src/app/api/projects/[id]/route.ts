import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireProjectAccess } from '@/lib/auth-helpers';
import { updateProjectSchema } from '@leafit/shared';

// GET /api/projects/:id - Get project details
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    await requireProjectAccess(params.id, user.id);

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        files: {
          orderBy: {
            path: 'asc',
          },
        },
        builds: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

// PATCH /api/projects/:id - Update project
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    await requireProjectAccess(params.id, user.id, 'OWNER');

    const body = await request.json();
    const validated = updateProjectSchema.parse(body);

    const project = await prisma.project.update({
      where: { id: params.id },
      data: validated,
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

// DELETE /api/projects/:id - Delete project
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    await requireProjectAccess(params.id, user.id, 'OWNER');

    await prisma.project.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
