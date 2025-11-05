import 'next-auth';

/**
 * Extend NextAuth types to include custom user properties
 */
declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name?: string | null;
    role: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
  }
}
