//api/sendEmail
import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import path from "path";

// 📌 Configurar el transporte de correo (SMTP)
const transporter = nodemailer.createTransport({
  service: "gmail", // 📌 Puedes cambiar a otro SMTP
  auth: {
    user: process.env.EMAIL_USER, // 📌 Usa variables de entorno para seguridad
    pass: process.env.EMAIL_PASS,
  },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  try {
    const { sendTo,  attachments  } = req.body;
    
    if (!sendTo ) {
      return res.status(400).json({ message: "Faltan parámetros requeridos" });
    }
    if (sendTo.length === 0 ){
      return res.status(400).json({ message: "No se encontraron destinatarios." });
    }
    console.log('sendTo en API',attachments);

    // 📌 Procesar los archivos adjuntos
    //const formattedAttachments = attachments?.map((file: { filePath: string; fileType: string; filename: string }) => ({
      // filename: file.filename, // Nombre visible en el correo
      // path: file.filePath, //path.join(process.cwd(), file.filePath), // Ruta absoluta del servidor
      // contentType: file.fileType, // Tipo de archivo (MIME type)
    //})) || [];
    for (const to of sendTo) {  // 📌 Configurar el email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to:to.email,
        subject:to.asunto,
        html: to.cuerpoEmail.replace(/\n/g, "<br>") , // 📌 Se envía en formato HTML
        attachments: attachments, // 📌 Agregar adjuntos
      };

       console.log('mailOptions',mailOptions);
      // 📌 Enviar el email
      await transporter.sendMail(mailOptions);
      console.log(`📩 Email enviado a ${to.email} ${to.placeholders.NombreProveedor}`);

     }
    return res.status(200).json({ message: "Correo enviado con éxito" });
 
  } catch (error: any) {
    console.error("Error enviando email:", error);
    return res.status(500).json({ message: "Error enviando email", error: error.message });
  }
}
