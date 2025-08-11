// pages/api/diagram/getByIdProcess.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { Diagram } from '@/models/Diagram';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { idProcess } = req.query;

  if (!idProcess || isNaN(Number(idProcess))) {
    return res.status(400).json({ error: 'Parámetro idProcess inválido' });
  }

  try {
    await connectDB();
    const diagram = await Diagram.findOne({ idProcess: Number(idProcess) }).lean();

    if (!diagram) {
      return res.status(404).json({ error: 'Diagrama no encontrado para el idProcess especificado' });
    }

    res.status(200).json(diagram);
  } catch (error) {
    console.error('❌ Error al buscar el diagrama:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
