//lib/projectManager/uploadFiles.ts

import fs from 'fs';
import { gfs } from '@/lib/gridfs';

async function isFileAlreadyUploaded(filename: string, metadata: any): Promise<boolean> {
  const existing = await gfs.find({
    filename,
    'metadata.idProject': metadata.idProject,
    'metadata.gridName': metadata.gridName || metadata.fileClass,
    'metadata.userId': metadata.userId,
  }).toArray();

  return existing.length > 0;
}
// Aquí se suben los archivos a GridFS
export const uploadFiles = async (files: any, idProject: number, email: string, state: string) => {
  const fileKeys = Object.keys(files);

  for (const key of fileKeys) {
    const fileArray = files[key];
    if (!fileArray || fileArray.length === 0) continue;

    const file = fileArray[0];
    const fileClass = key.split('_')[0];
    const nroInstalacion = Number(file.nroInstalacion);
    const nroAgua = Number(file.nroAgua);
    const metadata = {
      idProject,
      nroInstalacion,
      nroAgua: nroAgua,
      fileClass: fileClass,
      email,
      state,
    };

    const alreadyExists = await isFileAlreadyUploaded(file.originalFilename || 'archivo', metadata);
    if (alreadyExists) {
      console.log(`🟡 Archivo ${file.originalFilename} ya existe. Se omite carga.`);
      continue;
    }

    const readStream = fs.createReadStream(file.filepath);
    const uploadStream = gfs.openUploadStream(file.originalFilename || 'archivo', { metadata });

    await new Promise((resolve, reject) => {
      readStream.pipe(uploadStream).on('error', reject).on('finish', resolve);
    });
  }
};
