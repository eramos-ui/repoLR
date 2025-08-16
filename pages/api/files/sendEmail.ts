import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import { connectDB, getDb, getBucket } from "@/lib/db";
import { GridFSBucket, ObjectId } from "mongodb";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface Attachment {
  id: string;
  filename: string;
  contentType?: string;
}

async function getAttachments(attachments: Attachment[]) {//Aquí se obtienen los  archivos adjuntos
  const db = await getDb();
  // const bucket = new GridFSBucket(db, { bucketName: "uploads" });
  const bucket =await getBucket();
  const result = [];

  for (const attachment of attachments) {
    const fileId = new ObjectId(attachment.id);

    const fileDoc = await db.collection("uploads.files").findOne({ _id: fileId });

    if (!fileDoc) {
      console.warn(`Archivo con ID ${attachment.id} no encontrado.`);
      continue;
    }

    const downloadStream = bucket.openDownloadStream(fileId);
    const chunks: Buffer[] = [];

    for await (const chunk of downloadStream) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    result.push({
      filename: attachment.filename,
      content: buffer,
      contentType: attachment.contentType || fileDoc.contentType,
    });
  }

  return result;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  try {
    const { sendTo, attachments } = req.body;

    if (!sendTo || sendTo.length === 0) {
      return res.status(400).json({ message: "No se encontraron destinatarios." });
    }

    console.log("sendTo en API", sendTo);
    console.log("attachments en API", attachments);

    // Obtener los archivos adjuntos desde GridFS
    const formattedAttachments = await getAttachments(attachments);

    // Enviar el correo a cada destinatario
    for (const to of sendTo) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to.email,
        subject: to.asunto,
        html: to.cuerpoEmail.replace(/\n/g, "<br>"),
        attachments: formattedAttachments,
      };

      console.log("Enviando email a:", to.email);

      await transporter.sendMail(mailOptions);
      console.log(`📩 Email enviado a ${to.email}`);
    }

    return res.status(200).json({ message: "Correo enviado con éxito" });
  } catch (error: any) {
    console.error("Error enviando email:", error);
    return res.status(500).json({ message: "Error enviando email", error: error.message });
  }
}
