import { redirect } from 'next/navigation';
import { getCurrentUser, checkProjectAccess } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { EditorLayout } from '@/components/editor/editor-layout';

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/api/auth/signin');
  }

  const { access, role } = await checkProjectAccess(params.id, user.id);

  if (!access) {
    redirect('/projects');
  }

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      files: {
        orderBy: {
          path: 'asc',
        },
      },
      owner: true,
      members: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!project) {
    redirect('/projects');
  }

  const readOnly = role === 'VIEWER';

  return <EditorLayout project={project} readOnly={readOnly} />;
}
