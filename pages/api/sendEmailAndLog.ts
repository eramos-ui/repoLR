//api/sendEmailAndLog
//se usa para enviar emails y registrar los logs de los emails enviados
import type { NextApiRequest, NextApiResponse } from "next";
import { getDb } from "@/lib/db";
import {  GridFSBucket, ObjectId } from "mongodb";
import nodemailer from "nodemailer";
import { ProjectEmail } from "@/models/ProjectEmail";
import { v4 as uuidv4 } from "uuid";
import { finishTask, getCompletedTaskKeys, getDiagramByIdProcess } from "@/app/services/processEngine";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }, 
});
const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || "localhost:3000";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido. Usa POST." });
  }

  try {
    const { sendTo, attachments, idProject, idProjectActivity, idActivity,  idTask, idProcessInstance, tipoDocumento,
       nroDocumento, userFinish, attributes, nameActivity, finListaProveedores,idProcess,actividad  } = req.body;
    // console.log('sendEmailAndLog idProject, idProjectActivity, idActivity, idTask, idProcessInstance, tipoDocumento, nroDocumento ',idProject, idProjectActivity, idActivity, idTask, idProcessInstance, tipoDocumento, nroDocumento);
    if (!sendTo || !attachments) {
      return res.status(400).json({ error: "Faltan parámetros obligatorios" });
    }
// console.log('en sendEmailAndLog attachments',attachments)
    const db = await getDb(); 
    const enrichedAttachments = await Promise.all(//prepara los archivos adjuntos para el email
      attachments.map(async (file: any) => {
        const fileDoc = await db.collection("uploads.files").findOne({ _id: ObjectId.createFromHexString(file.fileId) });//este es uploads.files
        if (!fileDoc) return null;
        // ⚠️ Aquí debes leer el contenido del archivo desde GridFS
        const chunks: Buffer[] = [];
        const bucket = new GridFSBucket(db, { bucketName: "uploads" });
        const stream = bucket.openDownloadStream(ObjectId.createFromHexString(file.fileId));//busca el archivo en el bucket(en uploads.chunks)
        //console.log('en attachement.map stream ',stream)    
        return new Promise((resolve, reject) => {
          stream.on('data', (chunk) => chunks.push(chunk));
          stream.on('end', () => {
            resolve({
              fileId: file.fileId,
              fileName: file.fileName,
              fileClass: file.fileClass ?? '',
              fileType: file.fileType,
              fileSize: fileDoc.length ?? 0,
              content: Buffer.concat(chunks), // ✅ este es el contenido real
            });
          });
          stream.on('error', (err) => {
            console.error(`Error leyendo archivo ${file.fileName} desde GridFS:`, err);
            resolve(null); // o reject(err);
          });
        });
      })
    );
    //  console.log('enrichedAttachments ',enrichedAttachments)
    // Enviar Email
    for (const to of sendTo) {
      const token = uuidv4(); // ✅ Generar un token único por proveedor
       // Construir la URL de cotización
      const urlCotizacion = `${DOMAIN}/cotizar?token=${encodeURIComponent(token)}`;
      console.log('sendEmailAndLog urlCotizacion-token',urlCotizacion,token);
      const cuerpoEmail = to.cuerpoEmail
        ? to.cuerpoEmail.replace("{CotizacionURL}", urlCotizacion)
        : "No se ha definido el cuerpo del email.";
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to.email,
        subject: to.asunto,
        html: cuerpoEmail.replace(/\n/g, "<br>"),
        attachments: enrichedAttachments.map((file: any) => ({
          filename: file.fileName,
          content: file.content, // ✅ este es el Buffer con el contenido real
          contentType: file.fileType,
        })),
      };
      // console.log('sendEmailAndLog mailOptions',mailOptions)      
      try{
        await transporter.sendMail(mailOptions);
        //Registrar el log del email enviado
        const newLog = new ProjectEmail({
          idProject,
          idProjectActivity,
          emailProveedor: to.email,
          nombreProveedor: to.nombreProveedor,   
          contacto: to.contacto,
          idActivity: idActivity,
          actividad,//nombre de la actividad
          mensaje: {
            email: to.email,
            asunto: to.asunto,
            cuerpoEmail,
          },
          token: token,
          anexos: enrichedAttachments,
        });
        await newLog.save();
        } catch (error) {
          console.error(`Error al enviar email a ${to.email}:`, error);
        }
     }
     if (finListaProveedores === 'completada') {
      //console.log('sendEmailAndLog finListaProveedores',finListaProveedores,idProcessInstance,idActivity);      
      // ✅ Invocar la API `/api/process/finish-task` después del envío y registro
      const diagram = await getDiagramByIdProcess(idProcess);
      const activityProperties = diagram.activityProperties;
      const context = { ...attributes,finListaProveedores }; //río de datos
      // console.log('en sendEmailAndLog context',context);
      const completedKeys = await getCompletedTaskKeys(idProcessInstance);
      // const activityProperty = await getActivityPropertiesByIdTask(idTaskExisting);
      const activityProperty = activityProperties.find((activity:any) => activity.idActivity === idActivity);
      const nameActivity = activityProperty?.nameActivity ?? '';

      const currentKey = activityProperty?.key ?? ''; 
      // console.log('en sendEmailAndLog idActivity',idActivity,context,tipoDocumento,nroDocumento); 
      const idTaskExisting = idTask;
      // // console.log('en saveProject antes de finishTask',idProcessInstance); 
      await finishTask(
        diagram.diagram,//que tiene los connectors, shapes y las pages attributes-dibujo 
        diagram.context,//que contiene los atributos del diagrama del proceso (río de datos)            
        activityProperties,//que tiene las propiedades de las actividades y se relaciona con las shapes vía [key]
        context,//que tiene los atributos del process (ría de datos)
        completedKeys,//que tiene las keys de las actividades/shapes ya completadas
        currentKey,//que tiene la key de la actividad actual
        userFinish,//que tiene el usuario que finalizó la actividad
        idProcessInstance,//que tiene el id del instancia del proceso
        idTaskExisting,//que tiene la task
        tipoDocumento,
        nroDocumento,
        nameActivity,
        idActivity
      );
      return res.status(200).json({ success: true, message: 'Emails enviados y tarea finalizada' });
     }
  } catch (error) {
    console.error("Error en sendEmailAndLog:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}