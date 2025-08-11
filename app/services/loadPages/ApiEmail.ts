import {  getUsersFullByPerfil } from "@/app/services/users/getUsersFullByPerfil";
import { ActivityEmailFilesType, EmailTemplateType, FilesType, ProveedorType } from "@/types/interfaces";
import { replacePlaceholders } from '../../../utils/replacePlaceholders';


const dominio= process.env.NEXT_PUBLIC_DOMAIN; 
export const sendingEmails= async ( vals:any, userId: string, idTask:number )=>{
    let filteredProveedor = vals.proveedores.filter((obj:any) => vals.proveedoresSelected.includes(obj._id.toString()));
    // console.log('sendingEmails filteredProveedor',filteredProveedor);
    filteredProveedor=filteredProveedor.map((prov:any) =>{//el email del usuario no se repite, por eso se usa el de adicionalData
      return {...prov, email:prov.aditionalData.email};
    });
    // console.log('sendingEmails filteredProveedor',filteredProveedor);
        
    const urlsConTokensPlaceholder = await generateTokensForProveedores(filteredProveedor,vals.selectedTemplate);
    if (!urlsConTokensPlaceholder || urlsConTokensPlaceholder.length ===0)  return alert("Error no están definidos los meta datos.");
    // console.log('vals.anexosSelected',vals.anexosSelected); 
    const filteredAttachments = vals.jsFiles.filter((obj:any) => vals.anexosSelected.includes(obj.descripcion+'-'+obj._id.toString()));
    // console.log('filteredAttachments',filteredAttachments); 
    const attach=filteredAttachments.map((file:any) =>{ 
      return {filePath:file.filePath,fileType:file.fileType, filename:file.filename}});
    console.log('attach',attach);  
    const emailData = {
        sendTo: urlsConTokensPlaceholder,//inluge body:cuerpoEmail y asunto
        attachments: attach,
    };
    const proveedores=urlsConTokensPlaceholder.map((dt:any)=>{//data para laBD
    return {email:dt.email,contacto:dt.contacto,asunto:dt.asunto,'cuerpoEmail':dt.cuerpoEmail,userId,
      url:dt.url,proveedorId:dt.proveedor._id.toString(),attach,token:dt.token};  
    });
    console.log('proveedores',proveedores);

    try {
      const response = await fetch("/api/sendEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailData),
  
      });
      const result = await response.json();
      if (response.ok) {
        alert("📩 Email enviado correctamente.");
        console.log("✅ Respuesta del servidor:", result);
      } else {
        alert("⚠️ Error al enviar el email.");
        console.error("❌ Error:", result.error);
      }
    } catch (error) {
      alert("⚠️ Error en la conexión con el servidor.");
      console.error("❌ Error:", error);
    }
    // saveProveedorToken(idTask,userId,vals.idTransaction,vals.numActividad,vals.actividad,vals.fechaInicio ,//guarda token en la BD
    //         vals.fechaTermino, vals.presupuesto, proveedores, attach );
  }
  export const saveProveedorToken= async (idTask:number,userId:string,idTransaction:number, numActividad:string,
    actividad:string, fechaInicio: string ,fechaTermino:string, presupuesto:number,
    proveedores:any[],attach:any[] ) =>{
    
    const storedProcedure='UpdateProveedorToken';
    const parameters={idTask, userId,idTransaction, numActividad, actividad, fechaInicio ,fechaTermino, presupuesto,
      proveedores, attach };    
    try {
      const response = await fetch('/api/saveWithJson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storedProcedure, parameters }),
      });
  
      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || response.statusText };
      }
  
      const result = await response.json();
      return { success: true, result };
    } catch (error) {
      return { success: false, error: error};
    }    

  }
  const generateTokensForProveedores = async (proveedores:ProveedorType[],selectedTemplate:any) => {
    //proveedores: { id: number; email: string, contacto:string, label:string  }[]
    // console.log('generateTokensForProveedores proveedores',proveedores,selectedTemplate);
    if (!proveedores || proveedores.length ===0 ) return;  
    if (!selectedTemplate) return;
    const bodyTemplate=selectedTemplate.bodyTemplate;
    const subjectTemplate=selectedTemplate.subjectTemplate;
    const urls =[];
    for (const proveedor of proveedores) {
     const asunto=replacePlaceholders(subjectTemplate, proveedor.placeholders); 
     let  cuerpoEmail=replacePlaceholders(bodyTemplate, proveedor.placeholders); 
     const proveedorId=proveedor._id.toString();
    //  console.log('proveedor',proveedor,proveedor._id);
     try { // 📌 Generar token en el backend
       const response = await fetch("/api/generateToken", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ proveedorId: proveedorId }),
       });
       const data = await response.json();
       if (!data.token) throw new Error("No se pudo generar el token");
       const token = data.token;
       const urlCotizacion = `http://${dominio}/cotizar?token=${encodeURIComponent(token)}`;
       cuerpoEmail= cuerpoEmail.replace("{CotizacionURL}", urlCotizacion) ;
       urls.push({ proveedorId: proveedorId, email: proveedor.email, contacto:proveedor.contacto, label:proveedor.label,proveedor,
         placeholders: proveedor.placeholders,asunto,cuerpoEmail, url: urlCotizacion ,token });
       // console.log('urls',urls);
     } catch (error) {
       console.error(`Error generando token para proveedor ${proveedorId}:`, error);
     }
    }
   return urls; // 📌 Retorna las URLs generadas con sus respectivos tokens
}; 
