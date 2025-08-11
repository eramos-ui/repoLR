// pages/api/projects/update.ts
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

  try {
    await connectDB();

    const project = await Project.findOne({ idProject });

    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    // Reemplazar todos los campos del documento
    Object.assign(project, updateData);

    // Marcar los arrays modificados explícitamente
    project.markModified('activities');
    project.markModified('empalmesGrid');
    project.markModified('instalacionesGrid');
    project.markModified('techoGrid');

    const updatedProject = await project.save();

    res.status(200).json(updatedProject);
  } catch (error) {
    console.error('❌ Error al actualizar el proyecto:', error);
    res.status(500).json({ error: 'Error al actualizar el proyecto' });
  }
}

