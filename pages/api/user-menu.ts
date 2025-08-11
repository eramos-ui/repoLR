import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { Menu } from '@/models/Menu';
import { Task } from '@/models/Task';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email, perfil, roles } = req.query;
  console.log('en API user_menu email',email,perfil,roles);
  if (!email || !perfil || !roles || typeof email !== 'string' || typeof perfil !== 'string') {
    return res.status(400).json({ error: 'Parámetros requeridos: email, perfil, roles' });
  }

  let parsedRoles: { idProcess: number; idActivity: number }[] = [];
  try {
    parsedRoles = typeof roles === 'string' ? JSON.parse(roles) : [];
  } catch {
    return res.status(400).json({ error: 'roles inválido' });
  }
  
    // console.log('en API user_menu parsedRoles',parsedRoles);
  const rolesArray=parsedRoles.map(r => ({
    idProcess: r.idProcess,
    idActivity: r.idActivity
  }));
  // console.log('en API user_menu rolesArray',rolesArray);
  try {
    await connectDB();
    // console.log('en API user_menu email',email);
    const allMenus = await Menu.find({ isValid: true }).lean();
    // console.log('en API user_menu allMenus',allMenus);
    let tasks=[];
    if (parsedRoles.length > 0) {//si hay roles, se obtienen las tareas de los roles
      tasks = await Task.find({
        taskStatus: { $in: ['A', 'L'] },
        $or: [
          { specificUser: email },
          {
            specificUser: { $in: [null, ''] },
            $or: parsedRoles.map(r => ({
              idProcess: r.idProcess,
              idActivity: r.idActivity
            }))
          }
        ]
      }).lean();
      //  console.log('tasks 1',tasks);
      }else {//si no hay roles, se obtienen las tareas del usuario
        tasks = await Task.find({
          taskStatus: { $in: ['A', 'L'] },
          specificUser: email
        }).lean();
        // console.log('tasks 2',tasks);
    }
    // console.log('en API user_menu tasks',tasks);
    // Agrupar tareas por idProcess + idActivity
    const taskMap = new Map();
    for (const task of tasks) {
      const key = `${task.idProcess}-${task.idActivity}`;
      const current = taskMap.get(key);
      if (current) {
        current.count++;
      } else {
        taskMap.set(key, {
          idProcess: task.idProcess,
          idActivity: task.idActivity,
          nameActivity: task.nameActivity,
          count: 1,
        });
      }
    }
    // Armar menú filtrado
    const menuFiltrado = allMenus.map(menu => {
        const perfilSubmenus = (menu.submenus || []).filter((sub: any) =>{
          if (sub.isValid) {
            return sub.perfiles.includes(perfil);
          }
          return false;
        }).filter(Boolean);
      const taskSubmenus = (menu.submenus || [])
        .map((sub: any) => {
          const key = `${sub.idProcess}-${sub.idActivity}`;
          const group = taskMap.get(key);
          if (
            sub.idProcess != null &&
            sub.idActivity != null &&
            group &&
            group.count > 0
          ) {
            return {
              ...sub,
              // title: `${group.nameActivity} (${group.count})`,
              title: `${sub.title} (${group.count})`,
              origen: 'task',
              count: group.count,
            };
          }
          
          return null;
        })
        .filter(Boolean); // Elimina los null
    const submenus = [...perfilSubmenus, ...taskSubmenus];
    // console.log('en API user_menu submenus',submenus);
    const totalTasks = submenus
    .filter(sub => sub.origen === 'task' && sub.count)
    .reduce((acc, sub) => acc + (sub.count ?? 0), 0);
    //  console.log('totalTasks',totalTasks);
      return {
          ...menu,
            submenus,
            countTasks: totalTasks > 0 ? totalTasks : undefined, // opcional
            title: totalTasks > 0 ? `${menu.title} (${totalTasks})` : menu.title,
        };
      }).filter(menu => menu.submenus.length > 0);
    // console.log('menuFiltrado',menuFiltrado);
    return res.status(200).json(menuFiltrado);
  } catch (error) {
    console.error('❌ Error en /api/user-menu:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
