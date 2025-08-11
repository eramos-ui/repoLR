// import fs from 'fs';
// import path from 'path';
// import { uploadFileToAzure } from './uploadFileToAzure';

// interface UploadFileParams {
//   fileName: string;
//   fileData: string;
//   fileType: string;
//   fileClass?: string;
//   userId?: string;
//   rowId?: string;
// }

// export async function uploadFile({
//   fileName,
//   fileData,
//   fileType,
//   fileClass,
//   userId,
//   rowId,
// }: UploadFileParams): Promise<string> {
//   const isAzure = process.env.STORAGE_TYPE === "azure";

//   if (isAzure) {
//     // 🔄 Sube a Azure Blob Storage
//     const url = await uploadFileToAzure({
//       fileName,
//       fileData,
//       fileType,
//       fileClass: fileClass || '',
//       userId: userId || '', 
//       rowId: rowId || '',
//     });
//     return url;
//   } else {
//     // 💾 Guarda en sistema de archivos local
//     const uploadDir = process.env.UPLOAD_DIR || './public/uploads';
//     const fullPath = path.resolve(uploadDir, fileName);

//     // Asegúrate de que exista el directorio
//     await fs.promises.mkdir(uploadDir, { recursive: true });
//     const buffer = Buffer.from(fileData, "base64");
//     // Guarda el archivo
//     await fs.promises.writeFile(fullPath, buffer);

//     // Devuelve la URL relativa para usar en el frontend
//     return `/uploads/${fileName}`;
//   }
// }
