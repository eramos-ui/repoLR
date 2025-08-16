// pages/api/files/[id].ts
/*
Baja un archivo para el view\[id]
*/
import type { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { getBucket  } from "@/lib/db";
import path from 'path';

// Next no necesita parsear body en GET; lo desactivamos por si acaso
export const config = { api: { bodyParser: false,  responseLimit: false, } };

function encodeRFC5987(str: string) {
  return encodeURIComponent(str)
    .replace(/['()]/g, escape)
    .replace(/\*/g, '%2A')
    .replace(/%20/g, '+');
}
// → genera un fallback ASCII seguro para `filename=`
//   - toma solo el basename
//   - quita diacríticos
//   - reemplaza no-ASCII por _
//   - elimina / \ " ; y controla longitud
function asciiFallbackFilename(input: string): string {
    // basename POSIX (GridFS puede tener '/')
    const base = path.posix.basename(input || 'archivo');
  
    // quita diacríticos (NFKD + elimina combining marks)
    let name = base.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  
    // reemplaza separadores y caracteres problemáticos
    name = name.replace(/[\/\\]/g, '_').replace(/[";]/g, '_');
  
    // reemplaza cualquier no-ASCII por _
    name = name.replace(/[^\x20-\x7E]/g, '_').trim();
  
    if (!name) name = 'archivo';
  
    // controla longitud total (ej. 150)
    const ext = path.extname(name);
    const stem = name.slice(0, Math.max(1, 150 - ext.length));
    return `${stem}${ext}`;
  }
function shouldInline(ct: string) {
    return ct.startsWith('image/') || ct.startsWith('audio/') || ct.startsWith('video/') || ct === 'application/pdf';
  }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // id viene de la ruta /api/files/[id]
  const { id, download } = req.query;
  if (!id || Array.isArray(id) || !ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  try {
    const bucket =await getBucket();

    // Busca metadatos del archivo en uploads.files
    const fileDoc = await bucket.find({ _id: new ObjectId(id) }).next();
    if (!fileDoc) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    const contentType = (fileDoc as any).contentType || 'application/octet-stream';
    const rawName = fileDoc.filename || 'archivo';

    // 👇 clave: basename y doble variante del nombre
    const filenameAscii  = asciiFallbackFilename(rawName);   // solo ASCII
    const filenameUtf8PE = encodeRFC5987(path.posix.basename(rawName)); // UTF-8 %encoded

    const length = (fileDoc as any).length as number | undefined;
    // Si pasas ?download=1 en la URL, fuerza descarga
    const forceDownload = download === '1';
    const disp = !forceDownload && shouldInline(contentType) ? 'inline' : 'attachment';



    // Headers
    res.setHeader('Content-Type', contentType);
    if (typeof length === 'number') res.setHeader('Content-Length', String(length));

       // ⚠️ IMPORTANTE: `filename=` debe ser ASCII puro.
    res.setHeader(
    'Content-Disposition',
    `${disp}; filename="${filenameAscii}"; filename*=UTF-8''${filenameUtf8PE}`
    );    
    
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');

    // Stream de descarga desde GridFS
    const stream = bucket.openDownloadStream(new ObjectId(id));
    // Ajusta tu estrategia de caché:
    stream.on('error', (err) => {
      console.error('GridFS stream error:', err);
      // si ya se enviaron headers, solo finaliza la respuesta
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error leyendo el archivo' });
      } else {
        res.end();
      }
    });

    // 200 OK y pipe
    res.status(200);
    stream.pipe(res);
  } catch (err: any) {
    console.error('files/[id] error:', err);
    return res.status(500).json({ error: err?.message || 'Error inesperado' });
  }
}
