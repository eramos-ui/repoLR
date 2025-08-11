import { ActivityType } from "@/types/interfaces";


export const loadDataActivityDefineEjecutor= async (idTask: number,email:string,
    setInitialValues:(x:ActivityType) => void)=>{
    if (idTask <=0 || email===''){
      return;
    }
    //console.log('loadDataActivityDefineEjecutor ,idTask,email',idTask,email);
    try {
        const response = await fetch(`/api/tasks/by-task-user?idTask=${idTask} &email=${email}`);    
        // const res = await fetch(`/api/getToDoListTaskUser?userId=${userId} &idProcessidActivity=${idActivity}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch form data: ${response.statusText}`);
        }
        const dataTask = await response.json();  
        // console.log(' en loadDataActivity dataTask',dataTask);
        const responseProcess = await fetch(`/api/process/by-id?idProcessInstance=${dataTask.idProcessInstance}`);//lee el proceso
        if (!responseProcess.ok) {
            throw new Error(`Failed to fetch form data: ${responseProcess.statusText}`);
        }
        const processData = await responseProcess.json();
        //  console.log('response en processData process',processData);

        const responseProjectActivity=await fetch(`/api/projectActivity/by-id?idProjectActivity=${processData.nroDocumento}`);//Lee el documento de la actividad
        if (!responseProjectActivity.ok) {
            throw new Error(`Failed to fetch form data: ${responseProjectActivity.statusText}`);
        }
        const projectActivityData = await responseProjectActivity.json();
        // console.log('response en projectActivityData projectActivity',projectActivityData);
        const responseProject=await fetch(`/api/projects/${projectActivityData.idProject}`);
        const dataProject=await responseProject.json();
        // console.log(' en loadDataActivity dataProject',dataProject);
        const fechaInicio=(projectActivityData.fechaInicio)?projectActivityData.fechaInicio: new Date();
        const fechatermino=(projectActivityData.fechaTermino)?projectActivityData.fechaTermino: new Date();
        const fechaOriginal = new Date(fechaInicio);
        const fechaPlazoCotizacion = restarDias(fechaOriginal, 5).toLocaleDateString();//dd-mm-yyyy

        setInitialValues( {numActividad:projectActivityData.numActividad,actividad:projectActivityData.actividad,fechaInicio:projectActivityData.fechaInicio, 
            fechaTermino:projectActivityData.fechaTermino, duracion:projectActivityData.duracion,presupuesto:projectActivityData.presupuesto, 
            userResponsable:projectActivityData.userResponsable, formaEjecucion:projectActivityData.formaEjecucion,periodoControl:projectActivityData.periodoControl, 
            userEjecutor:projectActivityData.userEjecutor, idProjectActivity:projectActivityData.idProjectActivity,idTask:dataTask.idTask, idTransaction:dataTask.idTransaction, 
            idProject:projectActivityData.idProject, projectName: dataProject.projectName,
            ubicacionPanel:dataProject.ubicacionPanel,nroInstalaciones:dataProject.nroInstalaciones,
            tipoTerreno:dataProject.tipoTerreno, nivelPiedras:dataProject.nivelPiedra, nivelFreatico:dataProject.nivelFreatico,   
            idProcessInstance:dataTask.idProcessInstance, idActivity:dataTask.idActivity ,// FechaEntregaTrabajo:fechaPlazoCotizacion, 
            //PlazoRespuestaCotizacion:fechaPlazoCotizacion ,
            //attributes:processData.attributes
           })      
          return ;
    } catch (error) {
        console.error('Error fetching form data:', error);
    }
}
const restarDias= (fecha: Date, dias: number): Date => {
    const nuevaFecha = new Date(fecha);
    nuevaFecha.setDate(nuevaFecha.getDate() - dias);
    return nuevaFecha;
  }