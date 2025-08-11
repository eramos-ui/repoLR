//api/files/download-file
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB, getDb } from '@/lib/db'; 
import { GridFSBucket } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido. Usa GET.' });
  }
  const { idProject, nroInstalacion, nroAgua, fileClass } = req.query;
  try {
    await connectDB();
    const db = await getDb();
    const bucket = new GridFSBucket(db, { bucketName: "uploads" });

    // Validar parámetros
    const query: any = { "metadata.fileClass": fileClass }; //todas las consultas tiene fileClass y idProject 
    const projectNumber = Number(idProject);
    if (isNaN(projectNumber)) {
        return res.status(400).json({ error: 'El parámetro idProject debe ser numérico.' });
    }
    if (!fileClass) {
        return res.status(400).json({ error: 'El parámetro fileClass es obligatorio.' });
      }
    const installationNumber = nroInstalacion ? Number(nroInstalacion) : null;
    const waterNumber = nroAgua ? Number(nroAgua) : null;
    query["metadata.idProject"] = projectNumber;
      // Validación de parámetros adicionales
      switch (fileClass) {
        case 'imagenTecho':
          if (!installationNumber || isNaN(installationNumber)) {
            return res.status(400).json({ error: 'El parámetro nroInstalacion es obligatorio y debe ser numérico.' });
          }
          query["metadata.nroInstalacion"] = installationNumber;
  
          if (waterNumber) {
            if (isNaN(waterNumber)) {
              return res.status(400).json({ error: 'El parámetro nroAgua debe ser numérico.' });
            }
            query["metadata.nroAgua"] = waterNumber;
          }
          break;
  
        case 'memoriaCalculo':
          if (!installationNumber || isNaN(installationNumber)) {
            return res.status(400).json({ error: 'El parámetro nroInstalacion es obligatorio y debe ser numérico.' });
          }
          query["metadata.nroInstalacion"] = installationNumber;
          break;
  
        case 'kmlFile':
        case 'excelFile':
        case 'rutCliente':
          // No se requieren parámetros adicionales
          break;
  
        default:
          return res.status(400).json({ error: `El parámetro fileClass no es válido. Recibido: ${fileClass}` });
      }

    // if (fileClass === 'imagenTecho') {
    //     const installationNumber = Number(nroInstalacion);
    //     const waterNumber = nroAgua ? Number(nroAgua) : null;
        
    //     if (isNaN(installationNumber)) {
    //     return res.status(400).json({ error: 'El parámetro nroInstalacion debe ser numérico.' });
    //     }
    //     if (waterNumber && isNaN(waterNumber)) {
    //     return res.status(400).json({ error: 'El parámetro nroAgua debe ser numérico si está presente.' });
    //     }    
    //     // Construir la consulta de búsqueda        
    //     query["metadata.nroInstalacion"] = installationNumber;
    //     if (nroAgua) {
    //         query["metadata.nroAgua"] = waterNumber;
    //     }
    //     console.log('Consulta a MongoDB:', query);

    // }else if (fileClass === 'memoriaCalculo') {
    //       // Validar parámetros
    //     const installationNumber = Number(nroInstalacion);
    //     if (isNaN(installationNumber)) {
    //         return res.status(400).json({ error: 'El parámetro nroInstalacion debe ser numérico.' });
    //     }
    //     // Construir la consulta de búsqueda 
    //     query["metadata.nroInstalacion"] = installationNumber;
    // }
    // else if ( fileClass === 'kmlFile' || fileClass === 'excelFile' 
    //     || fileClass === 'rutCliente') {//no tiene parámetros adicionales

    // }
    // Buscar el archivo
    const fileDoc = await db.collection("uploads.files").findOne(query);

    if (!fileDoc) {
        return res.status(404).json({ error: 'Archivo no encontrado con los parámetros proporcionados.' });
    }

    const fileId = fileDoc._id;

    // Iniciar la descarga
    const downloadStream = bucket.openDownloadStream(fileId);

    downloadStream.on('error', (err) => {
    console.error('Error al descargar el archivo:', err);
    return res.status(404).json({ error: 'Archivo no encontrado en GridFS.' });
    });
    downloadStream.pipe(res);
  } catch (error) {
    console.error('Error en la API download-file:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}
