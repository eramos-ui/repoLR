//api/usuarios/vigenteByEmail
import { connectDB } from '@/lib/db';
import { NextApiRequest, NextApiResponse } from "next";
import { getUserVigenteByEmail } from '@/app/services/users/getUserVigenteByEmail';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const { email } = req.query;
  //console.log('En api/usuarios/vigenteByEmail',email);
  
  const user = await getUserVigenteByEmail(email as string);
  res.status(200).json(user);
}