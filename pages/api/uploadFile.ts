import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import formidable from "formidable";
import fs from "fs";

const MAX_FILE_SIZE_BYTES = parseInt(process.env.MAX_FILE_SIZE_MB || "5") * 1024 * 1024;
const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), "public/uploads");

export const config = { api: { bodyParser: false } };

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Método no permitido" });
  }
  try {
    const form = formidable({ uploadDir, keepExtensions: true, maxFiles: 10, maxFileSize: MAX_FILE_SIZE_BYTES });
    const [fields, files] = await form.parse(req);

    if (!files) {
      return res.status(400).json({ success: false, message: "No se envió ningún archivo" });
    }

     const userId = parseInt(fields.user_id?.[0] || "0"); // Obtener el ID del usuario
    // const projectId = parseInt(fields.project_id?.[0] || "0"); // Obtener el ID del proyecto si aplica

    //const uploadedFiles: Record<string, string> = {};
    let uploadedFiles: Record<string, { originalName: string; storedName: string; url: string, userId:number }> = {};


    for (const key in files) {
      //const file = files[key]?.[0];
      const file = Array.isArray(files[key]) ? files[key][0] : files[key];
      if (!file) continue;
        console.log(`📄 Procesando archivo: ${file.originalFilename}`);
    //   const fileUrl = `/uploads/${file.newFilename}`;
    //   uploadedFiles[key] = fileUrl;
    // const newPath = path.join(uploadDir, file.newFilename);
    // fs.renameSync(file.filepath, newPath); // 📌 Mover archivo a la ubicación final
    // uploadedFiles[key] = `/uploads/${file.newFilename}`;
    //console.log(`✅ Archivo guardado en: ${newPath}`);
        const originalName = file.originalFilename || "archivo_sin_nombre";
        const storedName = file.newFilename;
        uploadedFiles[key] = {
            originalName,
            storedName,
            url: `/uploads/${storedName}`, // URL accesible del archivo
            userId,
        };
    }
    console.log(`✅ Archivos guardado con 'exito`,uploadedFiles);
    return res.status(200).json({ success: true, files: uploadedFiles });
  } catch (error) {
    console.error("❌ Error al subir archivo:", error);
    return res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
}