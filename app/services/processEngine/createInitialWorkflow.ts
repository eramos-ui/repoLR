// services/processEngine/createInitialWorkflow.ts
/*
Esta función se encarga de crear el proceso inicial y la tarea inicial que es un parámetro de entrada.
Se puede iniciar en la activity que se requiera, por ejemplo si la actividad es difernte cuando la tarea es completada o cuando queda pendiente.
*/
import { Process } from '@/models/Process';
import { Task } from '@/models/Task';
import { Counter } from '@/models/Counter';
import type { ClientSession } from 'mongoose';

interface WorkflowParams {
  idProcess: number;
  processName: string;
  idActivity: number;
  isAutomatic?: boolean;
  userSpecific?: string;
  tipoDocumento: string;
  nroDocumento: number;
  attributes: Record<string, string>;
  infotodo: string;
  userModification: string;
  nameActivity: string;
  session?: ClientSession; // para manejar la transacción si existe
}

export const createInitialWorkflowData= async(params: WorkflowParams) => {
  const {
    idProcess,
    processName,
    idActivity,
    isAutomatic=false,
    userSpecific=null,
    tipoDocumento,
    nroDocumento,
    attributes,
    infotodo,
    userModification,
    nameActivity,
    session
  } = params;
  console.log('en createInitialWorkflowData params',params);

  try{

    // Generar nuevo idProcessInstance autoincremental
    const counterProcess = await Counter.findByIdAndUpdate(
      { _id: 'processInstance' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true, session }
    );
    const idProcessInstance = counterProcess!.seq;
  
    // Generar nuevo idTask autoincremental
    const counterTask = await Counter.findByIdAndUpdate(
      { _id: 'task' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true, session }
    );
    const idTask = counterTask!.seq;
  
    // Crear el documento Process
    await Process.create([{
      idProcessInstance,
      idProcess,
      isProcessInstanceOpen: true,
      processName,
      isSubProcess: false,
      tipoDocumento,
      nroDocumento,
      infotodo,
      attributes: Object.entries(attributes).map(([idAttribute, value]) => ({ idAttribute, value })),
    }], { session });
  
    // Objecto para crear la Task inicial
    const taskData: any = {
      idTask,
      idProcessInstance,
      idProcess,
      idActivity,
      taskStatus: 'A',
      userlock: '',
      userFinish: '',
      isAutomatic,
      processName,
      nameActivity,
      url: '',
      fecha: new Date(),
      createdAt: new Date(),
      idUserCreate: userModification
    };
    if(userSpecific){
      taskData.specificUser=userSpecific;
    }
    await Task.create(taskData); //, { session }

    // await Task.create([{
    //   idTask,
    //   idProcessInstance,
    //   idProcess,
    //   idActivity,
    //   taskStatus: 'A',
    //   specificUser: userModification,
    //   userlock: '',
    //   userFinish: '',
    //   isAutomatic,
    //   processName,
    //   nameActivity,
    //   url: '',
    //   fecha: new Date(),
    //   createdAt: new Date(),
    //   idUserCreate: userModification
    // }], { session });  
    return { idProcessInstance, idTask };
  } catch (error) {
    console.error('Error al crear el proceso inicial:', error);
    throw error;
  }
}
