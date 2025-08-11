// pages/api/projects/updateGeneral.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { Project } from '@/models/Project';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { idProject, ...updateData } = req.body;

  if (!idProject) {
    return res.status(400).json({ error: 'idProject es requerido para actualizar' });
  }

  // Excluir el campo 'activities' de la actualización
  delete updateData.activities;

  try {
    await connectDB();

    const updatedProject = await Project.findOneAndUpdate(
      { idProject },
      updateData,
      { new: true, overwrite: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    res.status(200).json(updatedProject);
  } catch (error) {
    console.error('❌ Error al actualizar el proyecto:', error);
    res.status(500).json({ error: 'Error al actualizar el proyecto' });
  }
}
