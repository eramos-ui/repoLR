import { Task } from '@/models/Task';
import { Process } from '@/models/Process';
import { ProcessDocument, TaskDocument } from './types';

/**
 * Dado un idTask, obtiene el contexto actual (attributes) como objeto plano
 * @param idTask El ID de la task
 * @returns Un objeto plano con los atributos del proceso como contexto, estos son los process.atributes[0]--uno sólo
 */
export const getContextByIdTask = async (idTask: number): Promise<{
  idProcess: number;
  idProcessInstance: number;
  context: Record<string, string>;
} | null> => {
//   const task = await Task.findOne({ idTask }).lean();
// console.log('🔄 getContextByIdTask idTask',idTask);
  const task = await Task.findOne({ idTask }).lean<TaskDocument>();

  if (!task) {
    console.warn(`No se encontró task con idTask=${idTask}`);
    return null;
  }
//  console.log('🔄 getContextByIdTask task',task);
  const { idProcess ,idProcessInstance} = task;

  if (idProcess == null) {
    console.warn(`Task con idTask=${idTask} no tiene idProcess`);
    return null;
  }
// console.log('🔄 getContextByIdTask idProcess,idProcessInstance',idProcess,idProcessInstance);
//   const processDoc = await Process.findOne({ idProcessInstance }).lean();
  // const processDoc = await Process.findOne({ idProcess }).lean<ProcessDocument>();
  // console.log('🔄 getContextByIdTask processDoc',processDoc);

  const processDoc = await Process.findOne({ idProcessInstance }).lean<ProcessDocument>();
  // console.log('🔄 getContextByIdTask processInstnaceDoc',processDoc);
  if (!processDoc || !Array.isArray(processDoc.attributes)) {
      console.warn(`No se encontró process con idProcessInstance=${idProcess} o no tiene atributos`);
      return null;
    }
    //  console.log('🔄 getContextByIdTask idProcess-processDoc',idProcess,processDoc);
    const context = processDoc.attributes[0];
     console.log('🔄 getContextByIdTask context',context);

  return { idProcess, idProcessInstance, context };
};
