import NextAuth from "next-auth";

declare module "next-auth" {


  interface User {
    id: string;
    name: string;
    email: string;
    //?:string;
  }
  interface Session {
    user:User;
    theme?: string;
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    sub: string;
  }
}