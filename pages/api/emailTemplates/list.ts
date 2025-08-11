import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { EmailTemplates } from '@/models/EmailTemplates';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    await connectDB();
    const templates = await EmailTemplates.find({ isValid: true }).sort({ createdAt: -1 }).lean();
    return res.status(200).json(templates);
  } catch (error) {
    console.error('❌ Error al obtener los templates de email:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
