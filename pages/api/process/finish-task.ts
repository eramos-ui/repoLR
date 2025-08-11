//esta api se usa para finalizar una tarea de un proceso consumida por el front
//modelo de API Routes tradicionales en /pages/api/process/finish-task.ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { finishTask } from '@/app/services/processEngine/finishTask';
// import { getDiagramByIdProcess } from '@/app/services/processEngine/getDiagramByIdProcess';
// import { getCompletedTaskKeys } from '@/app/services/processEngine/getCompletedTaskKeys';
// import { getActivityPropertiesByIdTask } from '@/app/services/processEngine/getActivityPropertiesByIdTask';
// import { connectDB } from '@/lib/db';
// import { Process } from '@/models/Process';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//     if (req.method !== 'POST') {
//       return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
//     }
//   try { 
//     await connectDB();
//     const {
//         idProcessInstance,
//         idTask,
//         tipoDocumento,
//         nroDocumento,
//         userFinish,
//         attributes,
//         nameActivity
//       } = req.body;
//       const activityProperty = await getActivityPropertiesByIdTask(idTask);
//       const idActivity = activityProperty?.idActivity ?? 0;   
//       const currentKey = activityProperty?.key ?? '';
//       const diagramDoc = await getDiagramByIdProcess(activityProperty?.idProcess ?? 0);
//       const activityProperties = diagramDoc.activityProperties ?? [];
//       const completedKeys = await getCompletedTaskKeys(idProcessInstance);
//  console.log('en API finish-task',idProcessInstance,idTask,tipoDocumento,nroDocumento,userFinish,attributes,nameActivity);

//     await finishTask(
//       diagramDoc.diagram,
//       activityProperties,
//       attributes,
//       completedKeys,
//       currentKey,
//       userFinish,
//       idProcessInstance,
//       idActivity,
//       tipoDocumento,
//       nroDocumento,
//       nameActivity
//     );
//     await Process.updateOne(
//         { idProcessInstance },
//         {
//           $set: {
//             'attributes': Object.entries(attributes).map(([idAttribute, value]) => ({
//               idAttribute,
//               value,
//             }))
//           }
//         }
//       );
//       return res.status(200).json({ message: 'Tarea finalizada correctamente' });
//   } catch (error) {
//     console.error('❌ Error en finish-task:', error);
//     return res.status(500).json({ error: 'Error al finalizar la tarea' });
//   }
// }
