import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { Process } from '@/models/Process';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { idProcessInstance } = req.query;

  if (!idProcessInstance || isNaN(Number(idProcessInstance))) {
    return res.status(400).json({ error: 'idProcessInstance es requerido y debe ser numérico' });
  }

  try {
    await connectDB();

    const processDoc = await Process.findOne({ idProcessInstance: Number(idProcessInstance) }).lean();

    if (!processDoc) {
      return res.status(404).json({ error: 'No se encontró el proceso con ese idProcessInstance' });
    }

    return res.status(200).json(processDoc);
  } catch (error) {
    console.error('❌ Error al obtener proceso:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
