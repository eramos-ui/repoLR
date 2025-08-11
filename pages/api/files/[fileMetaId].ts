// pages/api/files/[fileId].ts
/*
Hace el download de un archivo según el fileMetaId
*/
import type { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { connectDB, getBucket } from '@/lib/db';

function contentDispositionHeader(filename: string, type: 'inline' | 'attachment' = 'inline') {
  // Fallback ASCII por compatibilidad y filename* UTF-8 oficial (RFC 5987)
  const fallback = filename
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/"/g, '')
    .slice(0, 200);

  const encoded = encodeURIComponent(filename)
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');

  return `${type}; filename="${fallback}"; filename*=UTF-8''${encoded}`;
}
function cleanId(input: unknown): string {
  const raw = Array.isArray(input) ? input[0] : String(input ?? '');
  return decodeURIComponent(raw).trim().replace(/^"|"$/g, ''); // quita comillas
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end('Method Not Allowed');
  }
   console.log('en API req.query.id',req.query.fileMetadataId)
  try {
    const id = cleanId(req.query.fileMetaId);
    const disposition = req.query.disposition === 'attachment' ? 'attachment' : 'inline';

    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return res.status(400).json({ error: 'id inválido (ObjectId de 24 hex).' });
    }

    await connectDB();
    const bucket = getBucket();
    const _id = new ObjectId(id);

    const files = await bucket.find({ _id }).toArray();
    if (!files.length) return res.status(404).json({ error: 'Archivo no encontrado..' });

    const fileDoc = files[0] as any; // GridFS file doc
    const filename = fileDoc.filename as string;     // ← ya viene correcto (ñ, tildes)
    const contentType = fileDoc.contentType || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', contentDispositionHeader(filename, disposition));
    if (fileDoc.uploadDate) res.setHeader('Last-Modified', new Date(fileDoc.uploadDate).toUTCString());
    res.setHeader('ETag', `"${id}"`);

    const stream = bucket.openDownloadStream(_id);
    stream.on('error', (e) => {
      if (!res.headersSent) res.status(500).json({ error: e.message });
      else res.end();
    });
    stream.pipe(res);
  } catch (e: any) {
    console.error('Download error:', e);
    return res.status(500).json({ error: e.message });
  }
}



// import { NextApiRequest, NextApiResponse } from 'next';
// import mongoose from 'mongoose';
// import { connectGridFS, gfs } from '@/lib/gridfs';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//  console.log('📦 API /api/files/[fileId] invocada');
//  console.log('req.query:', req.query);
//   await connectGridFS();
//   const fileIdParam = req.query.fileId;
//   console.log('fileIdParam', fileIdParam);
//   const fileId = Array.isArray(fileIdParam) ? fileIdParam[0] : fileIdParam;

//   // Asegura que sea un string simple
//   if (!fileId || !mongoose.Types.ObjectId.isValid(fileId)) {
//     return res.status(400).json({ error: 'fileId inválido' });
//   }

//   try {
//     const objectId = new mongoose.Types.ObjectId(fileId);

//     const downloadStream = gfs.openDownloadStream(objectId);

//     res.setHeader('Content-Type', 'application/octet-stream');

//     downloadStream
//       .on('error', (err) => {
//         console.error('❌ Error al leer archivo de GridFS:', err);
//         res.status(404).json({ error: 'Archivo no encontrado' });
//       })
//       .pipe(res);
//   } catch (error) {
//     console.error('❌ Error general al descargar archivo:', error);
//     res.status(500).json({ error: 'Error interno del servidor' });
//   }
// }

