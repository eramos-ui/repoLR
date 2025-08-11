// types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser  } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
      theme?: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    theme?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    sub: string;
    name: string;
    email: string;
    avatar?: string;
    theme?: string;
  }
}