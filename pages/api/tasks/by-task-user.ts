
//api/tasks/by-task-user?idTask=1&email=admin@gmail.com
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { ITask } from '@/types/ITask';
import { Task } from '@/models/Task';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { idTask, email } = req.query;
// console.log('en by-task-user idTask, email',idTask, email);
  if (!idTask || !email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Parámetros idTask y email requeridos' });
  }

  try {
    await connectDB();

    const task = await Task.findOne({ idTask: Number(idTask) }).lean<ITask>();
// console.log('en by-task-user task',task);
    if (!task) {
      return res.status(404).json({ error: 'No se encontró la tarea' });
    }

    // Si hay un usuario específico, validar que coincida con el email
    if (task.specificUser && task.specificUser !== email) {
      return res.status(403).json({ error: 'Usuario no autorizado para esta tarea' });
    }

    return res.status(200).json(task);
  } catch (error) {
    console.error('❌ Error al buscar la tarea:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
