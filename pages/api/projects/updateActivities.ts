// pages/api/projects/updateActivities.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { Project } from '@/models/Project';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { idProject, activities } = req.body;

  if (!idProject || !Array.isArray(activities)) {
    return res.status(400).json({ error: 'idProject y activities son requeridos' });
  }

  try {
    await connectDB();

    const project = await Project.findOne({ idProject });

    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    // Reemplazar el array 'activities'
    project.activities = activities;

    // Marcar el campo 'activities' como modificado
    project.markModified('activities');

    const updatedProject = await project.save();

    res.status(200).json(updatedProject);
  } catch (error) {
    console.error('❌ Error al actualizar activities:', error);
    res.status(500).json({ error: 'Error al actualizar activities' });
  }
}
