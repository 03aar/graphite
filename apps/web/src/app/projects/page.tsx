import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@leafit/ui';
import { FileText, Plus } from 'lucide-react';
import { NewProjectButton } from '@/components/projects/new-project-button';

export default async function ProjectsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/api/auth/signin');
  }

  const projects = await prisma.project.findMany({
    where: {
      OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          files: true,
          builds: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/projects">
            <h1 className="text-2xl font-bold">LeafIt</h1>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Link href="/api/auth/signout">
              <Button variant="outline" size="sm">
                Sign Out
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Your Projects</h2>
          <NewProjectButton />
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-6">Get started by creating your first LaTeX project</p>
            <NewProjectButton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <FileText className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {project.owner.id === user.id ? 'Owner' : 'Collaborator'} • {project._count.files} files
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Updated {new Date(project.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
