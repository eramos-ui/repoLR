// api/tasks/by-activity.ts
//obtiene el toDoList de un process && activity && user && roles
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { Task } from '@/models/Task';
import { Process } from '@/models/Process'; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email, idActivity, idProcess, roles } = req.query;
  // console.log('en by-activity email,idActivity,roles,idProcess',email,idActivity,roles,idProcess);
  if (!email || !idActivity || !roles || typeof email !== 'string') {
    return res.status(400).json({ error: 'Parámetros requeridos: email, idActivity, roles' });
  }

  let parsedRoles: { idProcess: number; idActivity: number }[] = [];

  try {
    parsedRoles = typeof roles === 'string' ? JSON.parse(roles) : [];
  } catch {
    return res.status(400).json({ error: 'roles inválido' });
  }
  try {
    await connectDB();
    const filters: any = {
      taskStatus: { $in: ['A', 'L'] },
      idActivity: Number(idActivity),
      $or: [
        { specificUser: email },
        {
          // specificUser: { $in: [null, ''] },
          $or: parsedRoles.map(r => ({
            idProcess: r.idProcess,
            idActivity: r.idActivity,
          }))
        }
      ]
    };
    if (idProcess) {
      filters.idProcess = Number(idProcess);
    }
    const tareas = await Task.find(filters).sort({ idTask: +1 }).lean();
    //  console.log('tareas',tareas.length);
    const idsProceso = tareas.map(t => t.idProcessInstance);
    const procesos = await Process.find({
      idProcessInstance: { $in: idsProceso }
    }).lean();
    const procesosMap = new Map(
      procesos.map(p => [p.idProcessInstance, p])
    );

    const tareasConInfo = tareas.map(t => {
      const proceso = procesosMap.get(t.idProcessInstance);
      //console.log('proceso',proceso);
      return {
        ...t,
        infoToDo: proceso?.infotodo ?? null,
        tipoDocumento: proceso?.tipoDocumento ?? null,
        nroDocumento: proceso?.nroDocumento ?? null,
        attributes: proceso?.attributes ?? null,

      };
    });
    console.log('🔄 Lee tareasConInfo',tareasConInfo.length);
    res.status(200).json(tareasConInfo);

  } catch (error) {
    console.error('❌ Error al obtener tareas por actividad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
