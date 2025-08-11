
//api/projectActivity/update
//actualiza projectActivity y la task de un process (idProcessInstance) y la cierra, 
// luego, actualiza río de datos del process y genera la próxima task s/diagrama

import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { ProjectActivity } from '@/models/ProjectActivity';
import { IProjectActivity } from '@/types/IProjectActivity';
// import { isJson } from '@/utils/isJson';
import { finishTask, getCompletedTaskKeys, getContextByIdTask, getDiagramByIdProcess } from '@/app/services/processEngine';
import { getActivityPropertiesByIdTask } from '@/app/services/processEngine/getActivityPropertiesByIdTask';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }
  // console.log('en /api/projectActivity/update',JSON.parse(req.body),isJson(req.body));
   const {
      idTask,  
      attributes,//potenciales atributos de ría de datos, incluye: idProjectActivity,  idActivity, idProcessInstance,
      numActividad,
      actividad,
      fechaInicio,
      fechaTermino,
      duracion,
      presupuesto,
      usuarioModificacion,
      idProject,
      formaEjecucion,
      userEjecutor,
      userResponsable
   } = JSON.parse(req.body); 
    // console.log('en /api/projectActivity/update attributes',attributes);
  const idProjectActivity = attributes.idProjectActivity;
  const idProcessInstance = attributes.idProcessInstance;
  const idActivity = attributes.idActivity;
  const finListaProveedores = attributes.finListaProveedores;
  if (!idProjectActivity) {
    return res.status(400).json({ error: 'idProjectActivity es obligatorio.' });
  }
//   console.log('en updateProjectActivity',idProjectActivity,idActivity,numActividad,actividad,fechaInicio,fechaTermino,duracion,
//     presupuesto,usuarioModificacion,idProject,idProcessInstance,userResponsable,formaEjecucion,userEjecutor);
  let idTaskExisting = idTask;
  let idProcessInstanceExisting = idProcessInstance;
  console.log('en /api/projectActivity/update',idTaskExisting,idProjectActivity,idProcessInstanceExisting,userResponsable,formaEjecucion);
  console.log('en /api/projectActivity/update attributes',attributes);

  try {
    await connectDB();
// 1️⃣ Actualizar el documento de proyecto ProjectActivity
    const updated = await ProjectActivity.updateOne(
      { idProjectActivity: Number(idProjectActivity) },
      {
        $set: {
          ...(idActivity !== undefined && { idActivity }),//spread operator (...) + expresiones lógicas. Si idActivity no es undefined, entonces crea el objeto {idActivity} → {idActivity: valor          ...(numActividad && { numActividad } 
          ...(actividad && { actividad }),
          ...(fechaInicio && { fechaInicio }),
          ...(fechaTermino && { fechaTermino }),
          ...(duracion !== undefined && { duracion }),
          ...(presupuesto !== undefined && { presupuesto }),
          ...(usuarioModificacion && { usuarioModificacion }),
          ...(idProject && { idProject }),
          ...(idProcessInstanceExisting && { idProcessInstanceExisting }),
          ...(userResponsable && { userResponsable }),
          ...(formaEjecucion && { formaEjecucion }),
          ...(userEjecutor && { userEjecutor }),
        }
      },{ 
        returnDocument: 'after',// para que devuelve el nuevo documento actualizado 
        lean: true//updated devuelve{acknowledged: true, modifiedCount: 1, upsertedId: null, upsertedCount: 0, matchedCount: 1 }
       }
    ).exec();

    if (!updated) {
      return res.status(404).json({ error: 'No se encontró la actividad a actualizar.' });
    }

    const result = await getContextByIdTask(idTaskExisting);
    // console.log('🔄 En api/projectActivity/update.Proyecto existente. No se crea nuevo. result',result);
    if (!result) throw new Error('No se pudo obtener el contexto del proceso para idTask: ${idTaskExisting}');
    const { idProcess,idProcessInstance, context:currentContext } = result;//context es el río de datos actuales de la instancia, idProcess=3
    console.log('🔄 En api/projectActivity/update.Proyecto existente. context de la Instancia',currentContext);
    idProcessInstanceExisting = idProcessInstance;

    console.log('🔄 En api/projectActivity/update. finListaProveedores',idProcessInstanceExisting,finListaProveedores);
    if (finListaProveedores === 'completada') {
      // console.log('🔄 En api/projectActivity/update.Proyecto existente. No se crea nuevo. state',state);
       // 2️⃣ Recuperar info necesaria para finishTask
       const diagram = await getDiagramByIdProcess(idProcess);
       const activityProperties = diagram.activityProperties;
       const context = { ...attributes,finListaProveedores:'completada' }; //buscando atributo en río de datos
      //  console.log('🔄 En api/projectActivity/update.Proyecto existente. No se crea nuevo. context',context);
       const completedKeys = await getCompletedTaskKeys(idProcessInstanceExisting);
      //  const activityProperty = await getActivityPropertiesByIdTask(idTaskExisting);
       const activityProperty = activityProperties.find((activity:any) => activity.idActivity === idActivity);
       const nameActivity =activityProperty?.nameActivity ?? '';


       const currentKey = activityProperty?.key ?? ''; 
       const tipoDocumento = 'ACTIVIDAD';
       const nroDocumento = idProjectActivity;
        // console.log('en updateActivity idActivity',idActivity,tipoDocumento,nroDocumento);
       const userFinish = usuarioModificacion;
       const idProcessInstance=idProcessInstanceExisting;
       console.log('en projects/update antes de finishTask',context,currentContext); 
       // 3️⃣ Cierra la task y actualiza el río de datos del proceso
       await finishTask(
         diagram.diagram,//que tiene los connectors, shapes y las pages attributes-dibujo  
         diagram.context,//que contiene los atributos del diagrama del proceso (río de datos)           
         activityProperties,//que tiene las propiedades de las actividades y se relaciona con las shapes vía [key]
         context,//que tiene los atributos del process (ría de datos)
        //  currentContext,//tiene los atributos del process (ría de datos) antes de actualizar
         completedKeys,//que tiene las keys de las actividades/shapes ya completadas
         currentKey,//que tiene la key de la actividad actual
         userFinish,//que tiene el usuario que finalizó la actividad
         idProcessInstance,//que tiene el id del instancia del proceso
         idTask,//task actual  
         tipoDocumento,
         nroDocumento,
         nameActivity,   
         idActivity,      
        );
      
    }else {
      console.log('🔄 En api/projectActivity/update. No está implementada la actualización de finListaProveedores',finListaProveedores);
      throw new Error('No está implmentada esta opción para finListaProveedores: ${finListaProveedores} para idTask: ${idTaskExisting}');
    }

    return res.status(200).json(updated as unknown as IProjectActivity);

    // console.error('❌ Error en la actualización de ProjectActivity -No implementado');
    // return res.status(200).json({message:'Actualización de ProjectActivity exitosa'});
  } catch (error) {
    console.error('❌ Error en la actualización de ProjectActivity:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
