import { Task } from '@/models/Task';
import { Diagram } from '@/models/Diagram';
import { TaskDocument, DiagramDocument, NextActivity } from './types';

/**
 * Obtiene el activityProperty asociado a un idTask
 * @param idTask El idTask (de tipo Number, no el _id de Mongo)
 * @returns El objeto activityProperty correspondiente, o null si no se encuentra
 */
export const getActivityPropertiesByIdTask = async (idTask: number): Promise<NextActivity | null> => {
  // 1. Buscar la Task por idTask (no por _id)
  const task = await Task.findOne({ idTask }).lean<TaskDocument>();

  if (!task) {
    console.warn(`No se encontró la Task con idTask=${idTask}`);
    return null;
  }

  const {  idActivity,idProcess } = task;
//   console.log('en getActivityPropertiesByIdTask task',task);
  if (idProcess == null || idActivity == null) {
    console.warn(`La Task idTask=${idTask} no tiene idProcessInstance o idActivity`);
    return null;
  }

  // 2. Buscar el diagrama asociado al proceso
  const diagramDoc = await Diagram.findOne({ idProcess }).lean<DiagramDocument>();

  if (!diagramDoc) {
    console.warn(`No se encontró el diagrama para idProcessInstance=${idProcess}`);
    return null;
  }

  const activityProperty = diagramDoc.activityProperties.find(
    (act) => act.idActivity === idActivity
  );

  if (!activityProperty) {
    console.warn(`No se encontró activityProperty con idActivity=${idActivity}`);
    return null;
  }
//   console.log('en getActivityPropertiesByIdTask activityProperty',activityProperty);
  // 3. Devolver el activityProperty con tipo NextActivity
  return {
    key: activityProperty.key,
    idActivity: activityProperty.idActivity,
    isAutomatic: activityProperty.isAutomatic,
    isJoin: activityProperty.isJoin,
    tipoJoin: activityProperty.tipoJoin,
    decisionValue: activityProperty.decisionValue,
    type: activityProperty.type,
    conditionText: undefined, // Se calcula sólo desde conectores si es necesario
    idProcess,
  };
};
