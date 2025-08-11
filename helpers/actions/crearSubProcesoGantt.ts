import { ProjectDocument } from '@/app/services/processEngine/types';
import { Project } from '@/models/Project';
import { Counter } from '@/models/Counter';
import { calculateDuration } from '@/utils/calculateDuration';
import { ProjectActivity } from '@/models/ProjectActivity';
import { createInitialWorkflowData } from '@/app/services/processEngine/createInitialWorkflow';

export const crearSubProcesoGantt = async ( idProcessInstance: number,tipoDocumento:string,nroDocumento:number): Promise<void> => {
  console.log('🚀 Iniciando creación de subprocesos Gantt');
   // 1. Obtener el documento Project vinculado
  const proyecto = await Project.findOne({ idProject:nroDocumento }).lean<ProjectDocument>();
  if (!proyecto) throw new Error('No se encontró el proyecto asociado');
  const actividades = (proyecto.activities || []).filter((actividad: any) => actividad.presupuesto != null || actividad.presupuesto >0);
  const idProcess=3;
  const tipoDocumentoActivity="ACTIVIDAD";
  const idActivity=302;
  const processName='Administrar tarea';
  // 2. Iterar sobre cada actividad del proyecto
  for (const actividad of actividades) {
    try {
      // 3. Crear nuevo id para ProjectActivity
      const counterProjectActivity = await Counter.findByIdAndUpdate(
        { _id: 'projectActivity' }, 
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
        );
      const newIdProjectActivity = counterProjectActivity?.seq ?? Date.now();//Usa counterProjectActivity.seq si existe. Si counterProjectActivity no existe o no tiene seq, usa Date.now() como valor alternativo.

       // 4. Insertar nueva instancia y task en la colección Process y en Task
       const fechaInicio=actividad.fechaInicio ? actividad.fechaInicio:'indefinido';  
       const fechaTermino=actividad.fechaTermino ?actividad.fechaTermino:'indefinido';  
       const { idProcessInstance, idTask } = await createInitialWorkflowData(  
        {idProcess,processName,idActivity, tipoDocumento:tipoDocumentoActivity, nroDocumento:newIdProjectActivity,isAutomatic:false,
          // attributes:{finListaProcesos:'', proveedor:'',userEjecutor:'',userResponsable:'',usuarioCreador:'system',"formaEjecucion":''},
          attributes:{usuarioCreador:'system'},
          infotodo:`Proyecto: N° ${proyecto.idProject} - ${proyecto.projectName}, Actividad: ${actividad.numActividad} - ${actividad.actividad}, periodo: ${fechaInicio} - ${fechaTermino}`,
          userModification:'system', nameActivity:actividad.actividad
        });
       // 5. Calcular dureción si corresponde
       const duracion=calculateDuration(actividad.fechaInicio,actividad.fechaTermino);
       // 6. Construir objeto base para ProjectActivity
       const projectActivityData: any = {
        idProjectActivity:newIdProjectActivity,idActivity,numActividad:`${actividad.numActividad}`,actividad:`${actividad.actividad}`,
        // fechaInicio:actividad.fechaInicio,fechaTermino:actividad.fechaTermino,        
        presupuesto:actividad.presupuesto,//responsable:''
        usuarioModificacion:'system', //formaEjecucion:'',ejecutor:'',periodoControl
        idProject:proyecto.idProject,idProcessInstance
       };
       //7. incluir fechas y duración si corresponde
       if(actividad.fechaInicio && actividad.fechaTermino && duracion !== null && duracion !== undefined){
        projectActivityData.fechaInicio=actividad.fechaInicio;
        projectActivityData.fechaTermino=actividad.fechaTermino;
        projectActivityData.duracion=duracion;
       }
       // 8. Insertar ProjectActivity
       await ProjectActivity.create(projectActivityData);
       console.log(`✅ Subproceso ${idProcessInstance} creado para actividad ${actividad.numActividad} y idTask: ${idTask}`);
    } catch (error) {
      console.error(`❌ Error al crear subproceso para actividad ${actividad.numActividad}:`, error);
    }
      // break; //para procesar uno sólo
  }
    console.log(`🎯 Finalizó la creación de subprocesos Gantt para idProcessInstance: ,${idProcessInstance}, tipoDocumento: ${tipoDocumento}, nroDocumento: ${nroDocumento}`);

  return;
};


