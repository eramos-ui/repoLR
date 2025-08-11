//api/usuarios/vigente
import { connectDB } from '@/lib/db';
import { NextApiRequest, NextApiResponse } from "next";
import { getUserVigente } from '@/app/services/users/getUserVigente';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const { id } = req.query;
  // console.log('En api/usuarios/vigente',id);
  
  const user = await getUserVigente(id as string);
  res.status(200).json(user);
}