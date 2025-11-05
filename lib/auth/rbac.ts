import { getServerSession } from 'next-auth';
import { authOptions } from './auth-options';
import { NextResponse } from 'next/server';

/**
 * Role-Based Access Control utilities
 * Provides helpers for checking user permissions
 */

export type UserRole = 'ADMIN' | 'OPERATOR' | 'CREATOR';

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Check if user is admin
 */
export function isAdmin(userRole: UserRole): boolean {
  return userRole === 'ADMIN';
}

/**
 * Check if user can manage entity (Admin or Operator)
 */
export function canManage(userRole: UserRole): boolean {
  return userRole === 'ADMIN' || userRole === 'OPERATOR';
}

/**
 * Require authentication and return session
 * Returns 401 response if not authenticated
 */
export async function requireAuthAPI() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      session: null,
    };
  }

  return {
    error: null,
    session: session.user as SessionUser,
  };
}

/**
 * Require specific roles for API access
 * Returns 403 response if user doesn't have required role
 */
export async function requireRoleAPI(allowedRoles: UserRole[]) {
  const { error, session } = await requireAuthAPI();

  if (error) {
    return { error, session: null };
  }

  if (!session || !hasRole(session.role, allowedRoles)) {
    return {
      error: NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      ),
      session: null,
    };
  }

  return { error: null, session };
}

/**
 * Require admin role for API access
 */
export async function requireAdminAPI() {
  return requireRoleAPI(['ADMIN']);
}

/**
 * Require manage permissions (Admin or Operator)
 */
export async function requireManageAPI() {
  return requireRoleAPI(['ADMIN', 'OPERATOR']);
}
