import { ActivityEmailFilesType, EmailTemplateType, FilesType, ProveedorType } from "@/types/interfaces";
import { getUsersFullByPerfil } from "../users/getUsersFullByPerfil";

export const loadDataActivityWithFilesAndEmails= async (idTask: number,email:string,userName:string,setInitialValues:(x:ActivityEmailFilesType) => void)=>{
  if (idTask <=0 || email===''){
    return;
  }
  //  console.log('loadDataActivity',idTask,email); 
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

    const responseEmailTemplates=await fetch(`/api/emailTemplates/list`);

    const dataEmailTemplates=await responseEmailTemplates.json();//en bodyTemplate de dataEmailTemplates esta lo que se debe mostrar en el email como metadata 
    // console.log(' en loadDataActivity dataEmailTemplates',dataEmailTemplates);
    const responseEmpresa=await fetch(`/api/empresa`);
    const empresa=await responseEmpresa.json();
    console.log(' en loadDataActivity empresa',empresa);
    // const emailTemplatesFull=typeof dataEmailTemplates.bodyTemplate ==='string' ?JSON.parse( dataEmailTemplates.emailTemplate):dataEmailTemplates.emailTemplate;//para llenar el template de email
    const emailTemplatesFull=dataEmailTemplates;
    // console.log(' en loadDataActivity emailTemplatesFull',emailTemplatesFull, typeof emailTemplatesFull);
    
    const responseProject=await fetch(`/api/projects/${projectActivityData.idProject}`);
    const dataProject=await responseProject.json();
    //  console.log(' en loadDataActivity dataProject',dataProject);
    const responseUploadsFiles=await fetch(`/api/files/by-project?idProject=${dataProject.idProject}`);
    const dataUploadsFiles=await responseUploadsFiles.json();
    // console.log(' en loadDataActivity dataUploadsFiles',dataUploadsFiles);
    const jsFiles=dataUploadsFiles.map((fil:any) => {//transforma el archivo de dataUploadsFiles a jsFiles
    // console.log(' en loadDataActivity fil',fil);
    
    return {//los 2 primeros son para el selector de archivos 
      _id: fil._id?.toString() ?? '',//este además es identificado único del archivo uploads.files
      descripcion: fil.filename,
      filename: fil.filename,//es resto está acompañante
      fileSize: fil.chunkSize ?? 0,
      fileClass: fil.metadata.fileClass,
      fileType: fil.fileType,
      nroAgua: fil.metadata.nroAgua,
      nroInstalacion: fil.metadata.nroInstalacion,
      idProject: fil.metadata.idProject,
    }
  });
  //  console.log(' en loadDataActivity jsFiles',jsFiles);
  // const responseProjectFiles=await fetch(`/api/projects/files?idProject=${dataProject.idProject}`);
  // const jsFilesdataFiles=await responseProjectFiles.json();
  // const jsFiles=jsFilesdataFiles.archivos;


  let emailTemplate:EmailTemplateType[]=[];
  if (emailTemplatesFull && emailTemplatesFull.length>0){
      emailTemplate=emailTemplatesFull.map((email:any) => {
        const metadataJS=typeof email.metadataJSON ==='string' ? JSON.parse(email.metadataJSON) : email.metadataJSON;
        return {     
        idEmailTemplate: email.idEmailTemplate, templateName: email.templateName, subjectTemplate: email.subjectTemplate,
        bodyTemplate: email.bodyTemplate, metadataJSON:metadataJS } }) 
    }
  // console.log(' en loadDataActivity emailTemplate',emailTemplate);
  const dataProveedores:ProveedorType[]=await getUsersFullByPerfil('Proveedor');
  let metadataJS:any;
  // const fechaInicio=processData.attributes.find((x:any )=> x.idAttribute === 'fechaInicio').value;
  // const fechatermino=processData.attributes.find((x:any )=> x.idAttribute === 'fechaTermino').value;
  const fechaInicio=(projectActivityData.fechaInicio)?projectActivityData.fechaInicio: new Date();
  const fechatermino=(projectActivityData.fechaTermino)?projectActivityData.fechaTermino: new Date();
  const fechaOriginal = new Date(fechaInicio);
  const fechaPlazoCotizacion = restarDias(fechaOriginal, 5).toLocaleDateString();//dd-mm-yyyy
  // console.log(' en loadDataActivity fechaPlazoCotizacion',fechaPlazoCotizacion);
  
  metadataJS=emailTemplate[0].bodyTemplate;
  // console.log('metadataJS',metadataJS);
  const proveedoresMetadata=dataProveedores.map((prov:any) => {//A proveedores se le agrega placeholders (texto del email)
    const proveedor={...prov};
    // console.log('proveedor',proveedor);
    // console.log('metadataJS',metadataJS);
    const asunto=emailTemplate[0].subjectTemplate;//el asunto del email también tiene metadatos
    const asuntoPlaceholders=buildTemplateObject(asunto,{
      NombreProveedor: proveedor.name,
      Actividad: projectActivityData.actividad,
    });
    
    const placeholders = buildTemplateObject(metadataJS,{//lo que sigue con los metadatos del template del cuerpo del email
      Contacto: prov.aditionalData.contacto, 
      Actividad: projectActivityData.actividad,
      EmailProveedor: prov.aditionalData.email,
      PlazoRespuestaCotizacion:fechaPlazoCotizacion,
      FechaEntregaTrabajo: fechatermino,
      Observacion: "",
      CotizacionURL: "",
      NombreContratante: `${userName}
        Gerente de proyecto
        ${empresa.razonSocial}
        ${empresa.subNombre}
        cel: ${empresa.phone}
        ${email}`
      });
      // console.log('placeholders',placeholders);
      return {...proveedor, placeholders, asuntoPlaceholders};
      });

  const proveedoresJs:ProveedorType[]=proveedoresMetadata.map((prov:any) => {
      const placeholders=typeof prov.placeholders === 'string'? JSON.parse(prov.placeholders):prov.placeholders;
      const asuntoPlaceholders=typeof prov.asuntoPlaceholders === 'string'? JSON.parse(prov.asuntoPlaceholders):prov.asuntoPlaceholders;
      return {...prov, placeholders, asuntoPlaceholders};
  } );
  // console.log('en loadDataActivityWithFilesAndEmails proveedoresJs',proveedoresJs);
  //proveedores:, proveedoresJs trae los datos de los proveedores que incluye el contratante (firma del email)


  setInitialValues( {numActividad:projectActivityData.numActividad,actividad:projectActivityData.actividad,fechaInicio:projectActivityData.fechaInicio, 
      fechaTermino:projectActivityData.fechaTermino, duracion:projectActivityData.duracion,presupuesto:projectActivityData.presupuesto, 
      userResponsable:projectActivityData.userResponsable, formaEjecucion:projectActivityData.formaEjecucion,periodoControl:projectActivityData.periodoControl, 
      userEjecutor:projectActivityData.userEjecutor, idProjectActivity:projectActivityData.idProjectActivity,idTask:dataTask.idTask, idTransaction:dataTask.idTransaction, 
      idProject:projectActivityData.idProject, projectName: dataProject.projectName,tipoDocumento:'ACTIVIDAD',
      ubicacionPanel:dataProject.ubicacionPanel,nroInstalaciones:dataProject.nroInstalaciones,
      tipoTerreno:dataProject.tipoTerreno, nivelPiedras:dataProject.nivelPiedra, nivelFreatico:dataProject.nivelFreatico,
      jsFiles, emailTemplate, selectedTemplate:null, proveedores:proveedoresJs,anexosSelected:[],proveedoresSelected:[], selectedTemplateId:0,
      idProcessInstance:dataTask.idProcessInstance, idActivity:dataTask.idActivity , FechaEntregaTrabajo:fechaPlazoCotizacion, 
      PlazoRespuestaCotizacion:fechaPlazoCotizacion ,attributes:processData.attributes,proveedorEditing:''
     })      
    return ;
  } catch (err) {
    console.log('error',err);
  } 
}
const extractPlaceholders= (template: string): string[] => {
  const regex = /{(.*?)}/g;
  const matches = template.match(regex) || [];
  return matches.map(m => m.replace(/[{}]/g, ''));
}

//reemplaza en template los valores de la metadata que están entre llaves
const buildTemplateObject= (template: string, values: Record<string, string>): Record<string, string> => {
  const keys = extractPlaceholders(template);
  const result: Record<string, string> = {};

  keys.forEach(key => {
    result[key] = values[key] ?? '';
  });

  return result;
}
const restarDias= (fecha: Date, dias: number): Date => {
  const nuevaFecha = new Date(fecha);
  nuevaFecha.setDate(nuevaFecha.getDate() - dias);
  return nuevaFecha;
}