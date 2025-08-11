// pages/api/auth/refresh.ts
//para refrescar la sesión del usuario
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]"; //esto es para que el servidor pueda acceder a las credenciales de la base de datos
import type { Session } from "next-auth"; 
import { getUserVigenteByEmail } from "@/app/services/users/getUserVigenteByEmail";

// const secret = process.env.NEXTAUTH_SECRET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session:Session | null = await getServerSession(req, res, authOptions);

    if (!session || !session.user?.email) {
      return res.status(401).json({ error: "No autorizado" });
    }
  
    try {
      const user = await getUserVigenteByEmail(session.user.email);
      // console.log('🔒 En refresh.ts user:', user);
      if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
  
      return res.status(200).json({
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        theme: user.theme,
        perfil: user.perfil,
      });
    } catch (error) {
      console.error("Error al refrescar datos del usuario:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }