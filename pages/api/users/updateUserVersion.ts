// pages/api/users/updateVersion.ts
import { addUserVersion } from '@/app/services/users/addUserVersion';
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // console.log('en updateUserVersion',req.body.user);
  if (req.method !== 'POST') return res.status(405).end();

  try {
    await connectDB();
    const updatedUser = await addUserVersion(req.body.user);
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('❌ Error en updateVersion:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
