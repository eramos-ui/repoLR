import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { ProjectActivity } from '@/models/ProjectActivity';
import { IProjectActivity } from '@/types/IProjectActivity';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { idProjectActivity } = req.query;

  if (!idProjectActivity || isNaN(Number(idProjectActivity))) {
    return res.status(400).json({ error: 'idProjectActivity es requerido y debe ser numérico' });
  }

  try {
    await connectDB();

    const projectActivity = await ProjectActivity.findOne({
      idProjectActivity: Number(idProjectActivity)
    }).lean<IProjectActivity>();

    if (!projectActivity) {
      return res.status(404).json({ error: 'No se encontró la actividad del proyecto' });
    }

    return res.status(200).json(projectActivity);
  } catch (error) {
    console.error('❌ Error al obtener ProjectActivity:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
