//Está probado sólo para activity/administrarActivity.tsx
import { pickFields } from '@/utils/pickedFields';

export const updateActivity =async( values:any) =>{//viene de DefineEjecutorPage
  console.log('en updateActivity values',values);
  const userEjecutorAsignado=values.responsable;//se trata de ajecutor definido en la actividad
  try {
    const responseUser = await fetch(`/api/usuarios/${userEjecutorAsignado}`);
    if (!responseUser.ok) throw new Error('Error fetching user data');
    const userData = await responseUser.json();
    // console.log('en updateActivity userData',userData);
    values.userEjecutor=userData.email;
  } catch (error) {
    console.error('Error fetching user data:', error);
  }

   console.log('en updateActivity values',values);
  //rawAttributes tiene más valores que los de ProjectActivities, estos incluyen al río de datos de la instancia y hay de más
  let rawAttributes =pickFields(values, [
    'idProjectActivity',
    'idActivity',
    'numActividad',
    'actividad',
    'fechaInicio',
    'fechaTermino',
    'duracion',
    'presupuesto',
    'usuarioModificacion',
    'idProject',
    'idProcessInstance',
    'formaEjecucion',
    'userEjecutor',
    'finListaProveedores'
  ]); 
  // console.log('updateActivity idTask',values.idTask,values  );
  rawAttributes={...rawAttributes,userResponsable:values.userEjecutor};//sól vien userEjecutor y la formaEjecucion=externa requiere userResponsable
  // console.log('updateActivity rawAttributes',rawAttributes);
  // console.log('updateActivity url',`${process.env.NEXT_PUBLIC_DOMAIN}/api/projectActivity/update`);
 const body = {
  // idProjectActivity:values.idProjectActivity,//está en attributes 
  idTask:values.idTask,
  // idProcessInstance:values.idProcessInstance,,//está en attributes  
  attributes:rawAttributes, 
  usuarioModificacion:values.usuarioModificacion ,
  formaEjecucion:values.formaEjecucion,
  ubicacionPanel:values.ubicacionPanel,
  idProcess:3,
  // idActivity:values.idActivity,//está en attributes 
 }
//  console.log('updateActivity body',body);
 //en la siguiente api se actualiza la projectActivity,se realiza el finishTask lanzando las siguientes task
 try {
 const response = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/projectActivity/update`, {
    method: 'POST',
    body: JSON.stringify(body),
 });
 if (!response.ok) throw new Error('Error al actualizar la actividad'); 
 const data = await response.json();
 console.log('en updateActivity data',data);
 } catch (error) {
  console.error('Error al actualizar la actividad:', error);
 }









  // 1. Actualizar la projectActivity
 /*
  const res = await fetch('/api/projectActivity/update', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rawAttributes),
  });
  if (!res.ok) throw new Error('Error al actualizar la actividad');
  // 2. Ejecutar finishTask
  // let attributes: Record<string, string> = {};
  // attributes = { ...attributes, formaEjecucion:payload.formaEjecucion, userResponsable:payload.responsable ?? '', userEjecutor:payload.ejecutor ?? '' };
  const attributes: Record<string, string> = Object.entries(rawAttributes).reduce((acc, [key, value]) => {//río de datos del process
    if (value != null && value !== '') {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, string>);
  const idProcessInstance = rawAttributes.idProcessInstance;
  const tipoDocumento = 'ACTIVIDAD';
  const nroDocumento = rawAttributes.idProjectActivity;
  const userFinish = rawAttributes.usuarioModificacion;
  const nameActivity = rawAttributes.actividad;
  const idTask = values.idTask;
  // console.log('en updateActivity finishTask',idProcessInstance,idTask,tipoDocumento,nroDocumento,userFinish,attributes, nameActivity);
  console.log('en updateActivity attributes',attributes);
  */
/*
  await finishTask(
    diagram.diagram,//que tiene los connectors, shapes y las pages attributes-dibujo          
    activityProperties,//que tiene las propiedades de las actividades y se relaciona con las shapes vía [key]
    context,//que tiene los atributos del process (ría de datos)
    completedKeys,//que tiene las keys de las actividades/shapes ya completadas
    currentKey,//que tiene la key de la actividad actual
    userFinish,//que tiene el usuario que finalizó la actividad
    idProcessInstance,//que tiene el id del instancia del proceso
    idActivity,//que tiene el id de la actividad actual  
    tipoDocumento,
    nroDocumento,
    nameActivity
  );
*/
 

}
