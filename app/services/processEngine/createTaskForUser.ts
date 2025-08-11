import { Task } from '@/models/Task';
import { Counter } from '@/models/Counter'; 
import { NextActivity, ProcessDocument } from './types';
import { Process } from '@/models/Process';

const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000';
/**
 * Crea una nueva Task asociada a una actividad
 * @param activity La actividad siguiente
 * @param idProcessInstance ID de la instancia del proceso
 * @param context Contexto actual (como objeto plano)
 * @param userExecutor Usuario que creó la nueva task
 */
export const createTaskForUser = async (
  activity: NextActivity,
  idProcessInstance: number,
  context: Record<string, string>,
  userExecutor: string,
  tipoDocumento: string,
  nroDocumento: number, 
  userSpecific: string
) => {
  console.log('en createTaskForUser context', context);
  // 1️⃣ Obtener el proceso para idProcess + nombre
//   const processDoc = await Process.findOne({ idProcessInstance }).lean();
  const processDoc = await Process.findOne({ idProcessInstance }).lean<ProcessDocument>();

  const idProcess = processDoc?.idProcess;
  const activityProps = await fetch(`${baseUrl}/api/diagram/by-process-activity?idProcess=${idProcess}&idActivity=${activity.idActivity}`);
  const activityPropsData = await activityProps.json();
  const specificUser = userSpecific
  ? context[userSpecific] ?? undefined
  : undefined;
   console.log('en createTaskForUser activityPropsData',activityPropsData);
   console.log('en createTaskForUser specificUser',specificUser);
  const nameActivityInDiagram = activityPropsData?.nameActivity;
  if (!processDoc) {
    console.warn(`No se encontró proceso con idProcessInstance=${idProcessInstance}`);
    return;
  }
  // 2️⃣ Obtener nuevo idTask autoincremental
  const counter = await Counter.findByIdAndUpdate(
    { _id: 'task' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const idTask = counter?.seq || Date.now(); // fallback si no hay counter
  const nameOfActivity = (activity.nameActivity )  ? activity.nameActivity : nameActivityInDiagram ;
  // 3️⃣ Construir la nueva Task

  const newTask = new Task({
    idTask,
    taskStatus: activity.isAutomatic ? 'F' : 'A',
    taskFinishDate: activity.isAutomatic ? new Date() : undefined,
    userFinish: activity.isAutomatic ? 'system' : undefined,
    idProcessInstance,
    idProcess: processDoc.idProcess,
    processName: processDoc.processName,
    idActivity: activity.idActivity,
    nameActivity: nameOfActivity ,
    isAutomatic: String(activity.isAutomatic ?? false),
    url: activity.url ?? '',
    specificUser: specificUser ?? '',
    fecha: new Date(),
    idUserCreate: userExecutor
  });
  console.log('en createTaskForUser newTask',newTask);
   await newTask.save();

  console.log(`✅ Nueva Task creada: idTask=${idTask}, actividad=${activity.nameActivity}, tipoDocumento=${tipoDocumento}, nroDocumento=${nroDocumento}, taskStatus=${newTask.taskStatus}, specificUser=${specificUser}`);

};
