import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { ProjectEmail } from '@/models/ProjectEmail';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { idProject, idProjectActivity } = req.query; 
    console.log('idProject', idProject);
    console.log('idProjectActivity', idProjectActivity);
    if (!idProjectActivity || isNaN(Number(idProjectActivity))) {
      return res.status(400).json({ error: 'idProjectActivity es requerido y debe ser numérico' });
    }
  
    try {
       await connectDB();
  
      const projectEmails = await ProjectEmail.find({
        idProject: Number(idProject),
        idProjectActivity: Number(idProjectActivity)
      });
  console.log('projectEmails', projectEmails);
    //   if (!projectActivity) {
    //     return res.status(404).json({ error: 'No se encontró la actividad del proyecto' });
    //   }
  
       return res.status(200).json({projectEmails});
     } catch (error) {
      console.error('❌ Error al obtener emailStatus:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
     }
  }