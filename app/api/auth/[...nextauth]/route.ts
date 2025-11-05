import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

/**
 * NextAuth API route handler
 * Handles all authentication endpoints: /api/auth/*
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
