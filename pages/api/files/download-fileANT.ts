import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB, getDb } from '@/lib/db';
import { Project } from '@/models/Project';
import { GridFSBucket, ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido. Usa GET.' });
  }
  const { _id, idProject, nroInstalacion, nroAgua, gridName } = req.query;
  console.log('en DownloadFile  _id, idProject, nroInstalacion, nroAgua, gridName',  _id, idProject, nroInstalacion, nroAgua, gridName)

  try {
    await connectDB();
    const db = await getDb();
    const bucket = new GridFSBucket(db); 

    let fileId: ObjectId | null = null;

    if (_id) {
      fileId = new ObjectId(_id as string);
    } else if (idProject && gridName) {
      const project = await Project.findOne({ idProject: Number(idProject) });
      if (!project) {
        return res.status(404).json({ error: 'Proyecto no encontrado.' });
      }

      const { techoGrid, empalmesGrid, instalacionesGrid } = project;
      // console.log('en DownloadFile techoGrid, empalmesGrid, instalacionesGrid', techoGrid, empalmesGrid, instalacionesGrid)
      const findFileInGrid = (grid: any[], key: string) => {//funcion para buscar el archivo en el grid con el nombre de la key
        for (const item of grid) {
          console.log('en DownloadFile key', key, item[key])
          if (item[key]) return item[key];
        }
        return null;
      };
      
      const gridPaths = ['imagenTecho', 'boleta', 'poder', 'f2', 'diagrama', 'otrasImagenes', 'memoriaCalculo'];
      console.log('en DownloadFile instalacionesGrid', instalacionesGrid)
      console.log('en DownloadFile techoGrid', techoGrid)
      console.log('en DownloadFile empalmesGrid', empalmesGrid)
      for (const path of gridPaths) {
        console.log('en DownloadFile path', path)
        const foundFile = findFileInGrid(techoGrid || [], path) ||
                          findFileInGrid(empalmesGrid || [], path) ||
                          findFileInGrid(instalacionesGrid || [], path);
        console.log('en DownloadFile foundFile', foundFile)
        if (ObjectId.isValid(foundFile as string)) {
            fileId = new ObjectId(foundFile as string);
        } else {
            return res.status(400).json({ error: 'El ID proporcionado no es válido.' });
        }
      }
    }

    if (!fileId) {
      return res.status(404).json({ error: 'Archivo no encontrado.' });
    }

    const downloadStream = bucket.openDownloadStream(fileId);

    downloadStream.on('error', () => {
      return res.status(404).json({ error: 'Archivo no encontrado en GridFS.' });
    });

    downloadStream.pipe(res);

  } catch (error) {
    console.error('❌ Error en la API download-file:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}
