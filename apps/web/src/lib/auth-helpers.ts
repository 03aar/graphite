import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { prisma } from './prisma';
import { MemberRole } from '@leafit/shared';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function checkProjectAccess(projectId: string, userId: string, requiredRole?: MemberRole) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        where: { userId },
      },
    },
  });

  if (!project) {
    return { access: false, role: null };
  }

  // Owner always has access
  if (project.ownerId === userId) {
    return { access: true, role: 'OWNER' as MemberRole };
  }

  // Check membership
  const member = project.members[0];
  if (!member) {
    return { access: false, role: null };
  }

  // Check if role is sufficient
  if (requiredRole) {
    const roleHierarchy: MemberRole[] = ['VIEWER', 'EDITOR', 'OWNER'];
    const userRoleIndex = roleHierarchy.indexOf(member.role as MemberRole);
    const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);

    if (userRoleIndex < requiredRoleIndex) {
      return { access: false, role: member.role as MemberRole };
    }
  }

  return { access: true, role: member.role as MemberRole };
}

export async function requireProjectAccess(projectId: string, userId: string, requiredRole?: MemberRole) {
  const { access, role } = await checkProjectAccess(projectId, userId, requiredRole);
  if (!access) {
    throw new Error('Forbidden');
  }
  return role!;
}
