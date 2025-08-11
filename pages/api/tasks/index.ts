// pages/api/tasks.ts
//lee todas las tareas de un usuario por el rol + specificUser. 
// Se utiliza la api/tasks/by-activity.ts y no esta api
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { Task } from '@/models/Task';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email, roles } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email es requerido' });
  }
  let parsedRoles: { idProcess: number, idActivity: number }[] = [];
  try {
    parsedRoles = typeof roles === 'string' ? JSON.parse(roles) : [];
  } catch {
    return res.status(400).json({ error: 'roles inválido' });
  }
  try {
    await connectDB();
    const tasks = await Task.find({
      taskStatus: { $in: ['A', 'L'] },
      $or: [
        { specificUser: email },
        ...(parsedRoles?.length
          ? [{
              // specificUser: { $in: [null, ''] },
              $or: parsedRoles.map(r => ({
                idProcess: r.idProcess,
                idActivity: r.idActivity
              }))
            }]
          : [])
      ]
    }).sort({ createdAt: -1 });
    // const tasks = await Task.find({
    //   taskStatus: { $in: ['A', 'L'] },
    //   $or: [
    //     { specificUser: email },
    //     {
    //       specificUser: { $in: [null, ''] },
    //       $or: parsedRoles.map(r => ({
    //         idProcess: r.idProcess,
    //         idActivity: r.idActivity
    //       }))
    //     }
    //   ]
    // }).sort({ createdAt: -1 });
    return res.status(200).json(tasks);
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
