// pages/api/projects/create.ts
// pages/api/project/create.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { Project } from '@/models/Project';
import { ProjectType } from '@/types/interfaces';
import { createWithAutoId } from '@/lib/createWithAutoId';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    await connectDB();

    const savedProject = await createWithAutoId<ProjectType>(
      Project,
      'project',         // nombre del contador
      'idProject',       // campo que se autoincrementa
      req.body           // datos del nuevo proyecto
    );

    res.status(201).json(savedProject);
  } catch (error) {
    console.error('❌ Error al crear proyecto:', error);
    res.status(500).json({ error: 'Error al crear el proyecto' });
  }
}

// import type { NextApiRequest, NextApiResponse } from 'next';
// import { connectDB } from '@/lib/db';
// import { Project } from '@/models/Project';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Método no permitido' });
//   }

//   try {
//     await connectDB();
//     const newProject = new Project(req.body);
//     const savedProject = await newProject.save();
//     res.status(201).json(savedProject);
//   } catch (error) {
//     console.error('❌ Error al crear proyecto:', error);
//     res.status(500).json({ error: 'Error al crear el proyecto' });
//   }
// } 
