//service/projectEmails/sendEmailAndRegister.ts
/**
 * se usa para enviar emails y registrar los logs de los emails enviados
 * y tambien ejecuta el finishTask
 */

// import { ProveedorType } from "@/types/interfaces";
 import { replacePlaceholders } from "@/utils/replacePlaceholders";
// import { updateActivity } from "../projectActivity/updateActivity";
// const dominio= process.env.NEXT_PUBLIC_DOMAIN; 
export const sendingEmails= async ( vals:any, userEmail: string, idTask:number, finListaProveedores:string )=>{
  const idProjectActivity=vals.idProjectActivity;
  const idActivity=vals.idActivity;
  const idProject=vals.idProject;
  // console.log('sendingEmails vals',vals);
  let filteredProveedor = vals.proveedores.filter((obj:any) => 
      vals.proveedoresSelected.includes(obj._id.toString())
  );
  // console.log('sendingEmails filteredProveedor',filteredProveedor);
    const sendTo = filteredProveedor.map((prov: any) => {
      let Observacion=prov.placeholders.Observacion;
      // console.log('sendingEmails observacion',Observacion);
      Observacion=(Observacion.length>0)?Observacion:' ';//para eliminar el placeholder de {Observacion}
      
      const newAsuntoWithMatada= replacePlaceholders(vals.emailTemplate[0].subjectTemplate, prov.asuntoPlaceholders);
      const newBodyWithMatada= replacePlaceholders(vals.emailTemplate[0].bodyTemplate, {...prov.placeholders, Observacion});
      const nombreProveedor=prov.name;
      const contacto=prov.placeholders.Contacto;
      return {
      email: prov.aditionalData.email,
      nombreProveedor: nombreProveedor,  // ✅ Agregar nombre del proveedor
      asunto: newAsuntoWithMatada,
      cuerpoEmail:newBodyWithMatada,
      contacto:contacto,
      }}
    );
     
    const attachments = vals.jsFiles
    .filter((obj: any) => vals.anexosSelected.includes( obj._id.toString()))
    .map((file: any) => { 
      // console.log('sendingEmails file',file);

      return {
      fileId: file._id.toString(),
      fileName: file.filename,
      fileType: file.fileType,
      fileClass: file.fileClass,
      nroAgua: file.nroAgua,
      nroInstalacion: file.nroInstalacion,
      fileSize: file.fileSize,
    }});
    const attributes=vals.attributes;
    // console.log('sendTo',sendTo);
    const emailData = {
      sendTo,
      attachments,
      idProject,
      idProjectActivity,
      idActivity,
      idTask,
      idProcessInstance:vals.idProcessInstance,
      nroDocumento:vals.idProjectActivity,
      tipoDocumento:vals.tipoDocumento,
      userFinish:userEmail,
      attributes,
      actividad:vals.actividad,
      finListaProveedores,
      idProcess:3,
   
     };
      // console.log('emailData',emailData);
    try {
      // console.log("Payload enviado a /api/sendEmailAndLog:", emailData);
      const response = await fetch("/api/sendEmailAndLog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailData),  
      });
      const result = await response.json();
      if (response.ok) {
        alert("📩 Email enviado correctamente.");
        console.log("✅ Emails enviados y logs registrados:", result);
      } else {
        alert("⚠️ Error al enviar el email.");
        console.error("❌ Error en envío o registro:", result.error);
      }
    } catch (error) {
      alert("⚠️ Error en la conexión con el servidor.");
      console.error("❌ Error en la conexión:", error);
    }
}

    