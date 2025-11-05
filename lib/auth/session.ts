import { getServerSession } from 'next-auth';
import { authOptions } from './auth-options';
import { redirect } from 'next/navigation';

/**
 * Get the current user session on the server
 * Returns null if not authenticated
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Require authentication for a page/route
 * Redirects to sign-in if not authenticated
 */
export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    redirect('/auth/sign-in');
  }

  return session;
}

/**
 * Check if user has required role
 */
export async function requireRole(allowedRoles: string[]) {
  const session = await requireAuth();

  if (!allowedRoles.includes(session.user.role)) {
    redirect('/dashboard');
  }

  return session;
}
