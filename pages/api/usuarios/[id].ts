//api/usuarios/1

import { connectDB } from '@/lib/db';
import { NextApiRequest, NextApiResponse } from "next";
import { getUserVigenteById } from '@/app/services/users/getUserVigenteById';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  console.log('en api/usuarios/[id]',id);
  await connectDB();

  const user = await getUserVigenteById(id as string);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  res.status(200).json(user);
}