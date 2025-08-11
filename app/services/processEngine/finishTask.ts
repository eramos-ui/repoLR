import { processNextActivities } from './processNextActivities';
import { NextActivity } from './types';
import { Task } from '@/models/Task';
import { Process } from '@/models/Process';
// import { NoMeals } from '@mui/icons-material';
// import { Diagram } from '@/models/Diagram';
// import { ReturnDocument } from 'mongodb';

/**
 * Finaliza una actividad (task) y procesa las siguientes
 * @param diagram El diagrama completo del proceso
 * @param activityProperties Lista de activityProperties
 * @param context Variables actuales del proceso
 * @param completedKeys Lista de keys de actividades completadas
 * @param currentKey Key de la actividad recién terminada
 * @param attributes Atributos nuevos a guardar en el contexto del proceso
 * @param userFinish Usuario que finalizó la task
 */
export const finishTask = async (
  diagram: any,
  processContext: Record<string, string>,//del diagrama
  activityProperties: NextActivity[],
  context: Record<string, string>,//son todos los atributos que potencialmente pueden ser actualizados
  completedKeys: string[],
  currentKey: string,
  userFinish: string,
  idProcessInstance: number,
  idTask: number,
  tipoDocumento: string,
  nroDocumento: number,
  nameActivity: string,
  idActivity: number,
): Promise<void> => {
    console.log(`Iniciando finishTask para key=${currentKey}, idActivity=${idActivity}, idProcessInstance=${idProcessInstance} por ${userFinish}, nameActivity=${nameActivity}, tipoDocumento=${tipoDocumento}, nroDocumento=${nroDocumento}  `);
    // console.log('en finishTask context',context,tipoDocumento,nroDocumento);  
    // console.log('en finishTask activityProperties',activityProperties);
  //  console.log('en finishTask processContext',processContext);
  //  console.log('en finishTask diagram.context ',diagram);

  // 1️⃣ Marca que esta actividad fue completada
   await markTaskAsCompleted(idTask, idProcessInstance, userFinish,nameActivity);

  // 2️⃣ Actualizar el contexto del proceso
   await updateProcessContext(idProcessInstance, context, processContext);//,currentContext
  // console.log('en finishTask context ',context)
  // 3️⃣ Procesar las actividades siguientes
  await processNextActivities(
    diagram,
    activityProperties,
    idProcessInstance,
    context , // el nuevo contexto actualizado
    [...completedKeys, currentKey],
    currentKey,
    userFinish,
    idActivity,
    tipoDocumento,
    nroDocumento,
    nameActivity
  );

  console.log('en finishTask despues de processNextActivities');
  console.log(`finishTask completado para key=${currentKey}`);
};

/**
 * Marca la tarea como finalizada en la base de datos
 */

const markTaskAsCompleted = async (
  idTask: number,
  idProcessInstance: number,
  userFinish: string,
  nameActivity: string
) => {
   console.log(`✅ Marcando como completada la actividad idTask=${idTask}, proceso=${idProcessInstance}, por ${userFinish}, nameActivity=${nameActivity}`);

  const result = await Task.updateOne(
    {
      idTask,
      taskStatus: 'A' as 'A' | 'L', // Solo tareas disponibles deben poder cerrarse  
    },      
    {
      $set: {
        taskStatus: 'F',
        taskFinishDate: new Date(),
        userFinish,
      }
    }
  );

  if (result.modifiedCount === 0) {
    console.warn(`⚠️ No se actualizó ninguna Task para idActivity=${idTask} en proceso=${idProcessInstance}`);
  }
};

/**
 * Actualiza los attributes del proceso con los nuevos valores recibidos
 */
const updateProcessContext = async (
  idProcessInstance: number,
  attributes: Record<string, string>,//los nuevos valores de los atributos
  processContext: Record<string, string>,//los atributos del diagrama
  // currentContext: Record<string, string>//los atributos actuales antes de actualizar
) => {
  const processDoc = await Process.findOne({ idProcessInstance });
  // console.log('en updateProcessContext processDoc.attributes',processDoc.attributes);
  // console.log('en updateProcessContext attributes',attributes);
  // console.log('en updateProcessContext processContext',processContext);
  if (!processDoc) {
    console.warn(`No se encontró proceso con idProcessInstance=${idProcessInstance}`);
    return;
  }

  // Generar nuevos atributos reemplazando valores existentes
  // console.log('en updateProcessContext processDoc.attributes',processDoc.attributes);
  const processContextArray = Array.isArray(processContext) ? processContext : [processContext]; //si es un array o un objeto lo convierte a array
  // const newAttributesArray = Array.isArray(attributes) ? attributes : [attributes];
  const names = processContextArray.map((item: any) => item.name);
  // console.log('en updateProcessContext names',names);
  const attributesArray = Array.isArray(attributes) ? attributes : [attributes];
// Paso 1️⃣: obtener atributos actuales del proceso
const doc = await Process.findOne({ idProcessInstance });
const currentContext = doc?.attributes || [];

// Paso 2️: hacer merge solo si cambia el valor

// const mergedAttributes: { idAttribute: string; value: any }[] = [];
const mergedAttributes = processContextArray
  .map((ctx: any) => {
    const name = ctx.name;

    const value =
      attributes?.[name] ??
      currentContext.find((item: any) => item.idAttribute === name)?.value;
      return { idAttribute: name, value };
  })
  // Solo incluir si el atributo es nuevo o cambió su valor
  .filter((attr) => {
    const currentAttr = currentContext.find(
      (c: any) => c.idAttribute === attr.idAttribute
    );
    return !currentAttr || currentAttr.value !== attr.value;
  }).filter(attr => attr.value !== undefined);

// console.log('en updateProcessContext mergedAttributes',mergedAttributes);
// incluimos los actuales NO modificados
// Paso 3️⃣: guardar en base de datos
if (mergedAttributes.length > 0) {
  // console.log('en updateProcessContext actualiza attributes',[...currentContext.filter((attr: any) =>
  //   !mergedAttributes.find(m => m.idAttribute === attr.idAttribute)), ...mergedAttributes ]);
  await Process.updateOne(
    { idProcessInstance },
    {
      // solo reemplaza los que cambian
      $set: {
        attributes: [
          // incluimos los actuales NO modificados
          ...currentContext.filter((attr: any) =>
            !mergedAttributes.find(m => m.idAttribute === attr.idAttribute)
          ),
          ...mergedAttributes
        ]
      }
    }
  );
}
  console.log(`Attributes del proceso ${idProcessInstance} actualizados correctamente.`);
};
