import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db'; // Asegúrate de tener esta función configurada para conectar a MongoDB
import { ProjectEmail } from '@/models/ProjectEmail';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido. Usa GET.' });
  }

  const { token } = req.query;
console.log('en projectEmail/by-token ',token)
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'Token es requerido y debe ser un string.' });
  }

  try {
    await connectDB();

    const emailRecord = await ProjectEmail.findOne({ token });

    if (!emailRecord) {
      return res.status(404).json({ error: 'No se encontró un email con ese token.' });
    }

    return res.status(200).json(emailRecord);
  } catch (error: any) {
    console.error('❌ Error en la API by-token:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}
