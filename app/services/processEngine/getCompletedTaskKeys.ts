import { Task } from '@/models/Task'; 
import { ObjectId } from 'mongodb';

/**
 * Obtiene las keys de las actividades completadas de una instancia de proceso
 * @param idProcessInstance El id de la instancia del proceso
 * @returns Array de keys completadas (como strings)
 */
export const getCompletedTaskKeys = async (idProcessInstance: string | ObjectId): Promise<string[]> => {
  const completedTasks = await Task.find({
    idProcessInstance,
    taskStatus: 'F' // Finished
  }).lean();

  if (!completedTasks.length) {
    console.warn(`No se encontraron tareas completadas para idProcessInstance=${idProcessInstance}`);
    return [];
  }

  // Supongo que en cada Task guardas la 'key' de la activity asociada
  const completedKeys = completedTasks.map((task: any) => task.key).filter((key: any) => key !== undefined);

  return completedKeys;
};
 