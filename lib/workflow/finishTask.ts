
//servicio de Server que finaliza una tarea y determina la siguiente task en el workflow
import { Task } from '@/models/Task';
import { Process } from '@/models/Process';
import { Diagram } from '@/models/Diagram';
import { findNextActivities } from './findNextActivities';

// Definición de tipos para mayor claridad
type DecisionValue = string | number;

interface Transition {
  /** ID de la actividad de destino a la que conduce esta transición */
  targetActivity: string;
  /** Valor de decisión que activa esta transición (opcional, si aplica) */
  conditionValue?: DecisionValue;
}

interface ActivityProperty {
  /** Valor de decisión seleccionado en esta actividad (si aplica) */
  decisionValue?: DecisionValue;
  /** Lista de posibles transiciones salientes desde esta actividad */
  transitions?: Transition[];
  // ...otros campos relevantes de la actividad (si existen)...
}

interface DiagramDoc {
  /** Mapa de propiedades de cada actividad, con la clave siendo el id de la actividad */
  activityProperties: Record<string, ActivityProperty>;
  // ...otros campos del documento de diagrama (si existen)...
}
 
/**
 * Finaliza la tarea actual y determina la siguiente transición en el workflow.
 * @param diagramDoc - Documento del diagrama de flujo que contiene las propiedades de actividades.
 * @param idActivity - ID (clave) de la actividad actual en el diagrama.
 * @returns El ID de la siguiente actividad a ejecutar, o `null` si no hay transición (por ejemplo, fin del flujo).
 * @throws Error si la actividad no existe en activityProperties o si no se puede determinar la transición siguiente.
 */
interface FinishTaskParams {
  idTask: number;
  attributes: Record<string, string>;
  userFinish: string;
}

export const finishTask = async ({ idTask, attributes, userFinish }: FinishTaskParams) => {
 console.log('en finishTask', idTask, attributes, userFinish);

  // 1. Buscar la Task
  const taskDoc = await Task.findOne({ idTask });
//   console.log('en finishTask taskDoc',taskDoc);
  if (!taskDoc) {
    throw new Error(`Task con idTask=${idTask} no encontrada`);
  }
  // 2. Buscar la instancia del Process
  const processDoc = await Process.findOne({ idProcessInstance: taskDoc.idProcessInstance });
  if (!processDoc) {
    throw new Error(`Proceso con idProcessInstance=${taskDoc.idProcessInstance} no encontrado`);
  }
// console.log('en finishTask processDoc',processDoc);
  // 3. Actualizar attributes del Process
  const nuevosAttributes = processDoc.attributes.map((attr: any) => {
    if (attributes.hasOwnProperty(attr.idAttribute)) {
      return { idAttribute: attr.idAttribute, value: attributes[attr.idAttribute] };
    }
    return attr;
  });
//   console.log('en finishTask nuevosAttributes',nuevosAttributes);
  processDoc.attributes = nuevosAttributes;
  await processDoc.save();

  // 4. Buscar el Diagram
  const diagramDoc = await Diagram.findOne({ idProcess: taskDoc.idProcess });
  if (!diagramDoc) {
      throw new Error(`Diagram para idProcess=${taskDoc.idProcess} no encontrado`);
    }
// console.log('en finishTask diagramDoc',diagramDoc);
  // Obtener las propiedades de todas las actividades del diagrama
  const properties = diagramDoc.activityProperties;
  if (!properties || typeof properties !== 'object') {
    throw new Error('El campo diagramDoc.activityProperties está ausente o no es un objeto.');
  }
    // Obtener las propiedades de todas las actividades del diagrama
//   console.log('en finishTask properties',properties);
  // Obtener las propiedades de la actividad actual utilizando su idActivity como clave
  const idActivityActual = taskDoc.idActivity;
  //console.log('en finishTask idActivity',idActivity,diagramDoc.activityProperties);
  let activityPropsArray: any[] = [];

  try {
    activityPropsArray = diagramDoc.activityProperties || '[]';
    if (!Array.isArray(activityPropsArray)) {
        //console.error('activityProperties no es un array válido', activityPropsArray);
        activityPropsArray = [];
    }
  } catch (error) {
    //console.error('Error al parsear activityProperties:', error);
    activityPropsArray = [];
  }
  //console.log('en finishTask activityPropsArray',activityPropsArray);
// 1. Tomamos la activity actual
  const activityActual = diagramDoc.activityProperties.find(
    (act: any) => act.idActivity === idActivityActual
  );
  
  if (!activityActual) {
    throw new Error(`No se encontró actividad con idActivity = ${idActivityActual}`);
  }
  
  // 2. Sacamos su 'key'
  const currentKey = activityActual.key;
  
 console.log('en finishTask currentKey',currentKey,activityActual);
  // 3. Buscamos las siguientes actividades
  const nextActivities = findNextActivities(diagramDoc.diagram, activityPropsArray, currentKey);

  console.log('Actividades siguientes:', nextActivities);



  return { success: true };
}
