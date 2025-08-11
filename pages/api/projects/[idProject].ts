import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { Project } from '@/models/Project';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { idProject } = req.query;

  if (!idProject || isNaN(Number(idProject))) {
    return res.status(400).json({ error: 'Parámetro idProject inválido' });
  }

  try {
    await connectDB();
    const project = await Project.findOne({ idProject: Number(idProject) }).lean();

    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    res.status(200).json(project);
  } catch (error) {
    console.error('❌ Error al buscar proyecto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
