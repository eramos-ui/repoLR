///api/files/upload-gridfs.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import crypto from 'crypto';
import { Types } from 'mongoose';
import { connectDB, getBucket  } from '@/lib/db';
import { FileMeta } from '@/models/FileMeta';
import { normalizeOriginalName } from '@/utils/filename';

export const config = {
  api: { bodyParser: false }, // imprescindible para manejar multipart/form-data con multer
};

// ---- Multer: memoria (buffer en RAM) ----
const upload = multer({
  storage: multer.memoryStorage(),
  // limits: { fileSize: 20 * 1024 * 1024 }, // opcional: 20MB
});

// Helper para usar middlewares estilo Express en Next
function runMiddleware<T = any>(req: NextApiRequest, res: NextApiResponse, fn: any): Promise<T> {
  return new Promise((resolve, reject) => {
    fn(req as any, res as any, (result: any) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}
// Utils de normalización ------------------------------------------------------
function toNumber(v: any): number | undefined {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }
  function toNumberArray(v: any): number[] {
    if (Array.isArray(v)) return v.map(Number).filter(Number.isFinite);
    if (v === undefined || v === null || v === '') return [];
    return [Number(v)].filter(Number.isFinite);
  }
  function toStringArray(v: any): string[] {
    if (Array.isArray(v)) return v.map((s) => String(s)).filter(Boolean);
    if (v === undefined || v === null || v === '') return [];
    return [String(v)];
  }
  function pickKind(mime: string): 'pdf' | 'image' | 'other' {
    if (!mime) return 'other';
    if (mime === 'application/pdf') return 'pdf';
    if (mime.startsWith('image/')) return 'image';
    return 'other';
  }
  function isObjectIdString(s: any): s is string {
    return typeof s === 'string' && /^[a-f\d]{24}$/i.test(s);
  }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
// console.log('en upload-gridfs')
try {
    // 1) Parsear multipart con multer (aceptamos cualquier campo de archivo)
    await runMiddleware(req, res, upload.any());
 

    // Ahora tienes:
    // (req as any).files  -> archivos (array)
    // (req as any).body   -> campos de texto

    const files: Express.Multer.File[] = ((req as any).files as Express.Multer.File[]) || [];
    const fields = (req as any).body || {};
    
    // Ejemplo de campos "lógicos" que mencionaste:
    // - row.fuente (number), row.temasId (array numérica), etc.
    // Aquí solo los leemos si vinieran planos:
    // 2) Leer/normalizar campos que quieres guardar en metadata
    //const formId = toNumber(fields.formId); // opcional si te sirve para armar filename
    // const idUserModification = fields.idUserModification; // quien sube (uploadedBy)
    
    const row=JSON.parse(fields.row);
    const idUserModification = fields.idUserModification; // quien sube (uploadedBy)
    const authorId = (row.authorId)?row.authorId:idUserModification; // opcional: autor del documento
    const authorName = typeof row.authorName === 'string' ? row.authorName.trim() : '';
    const uploadedBy = idUserModification;//typeof fields.uploadedBy === 'string' ? fields.uploadedBy.trim() : '';
    const fuente = toNumber(row.fuente);
    const temaIds=row.tema;             // number

    const linkDocument= (row['linkDocument'])? row['linkDocument'] : undefined; 
    // console.log('tema',temaIds)
    // console.log('row',row,typeof row)
    // console.log('fields',fields)
    // console.log('uploadedBy',uploadedBy);
    // return res.status(401).json('Probando upload' );


    // 2) Validaciones mínimas
    if (!files.length) return res.status(400).json({ error: 'No se adjuntaron archivos.' });

    if (!idUserModification) return res.status(400).json({ error: 'idUserModification es requerido.' });
    // if (!Number.isFinite(formId)) return res.status(400).json({ error: 'formId debe ser numérico.' });

    // 3) Subir a GridFS
    const bucket = getBucket();

    const created: any[] = []
    for (const f of files) {
        
        const originalFixed = normalizeOriginalName(f.originalname); // Corrige tildes/ñ y limpia
        // 3.1 sha256 (desde buffer de multer)
        const sha256 = crypto.createHash('sha256').update(f.buffer).digest('hex');
  
        // 3.2 filename lógico dentro del bucket
        // const filename =`${formId ?? 'noform'}/${idUserModification}/${Date.now()}-${f.originalname}`;
        const filename=`${idUserModification}/${originalFixed}`;
        
        // 3.3 subir a GridFS
        const readStream = Readable.from(f.buffer);
        const uploadStream = bucket.openUploadStream(filename, {
          contentType: f.mimetype,
          metadata: {
            fieldname: f.fieldname,
            originalName: f.originalname,
            uploadedBy: uploadedBy,
            // formId: formId ?? null,
          },
        });
        readStream.pipe(uploadStream);
        await finished(uploadStream);
        const gridFsId = uploadStream.id as Types.ObjectId;

        // 3.4 construir documento FileMeta (usa tu schema exacto)
        const doc = await FileMeta.create({
          gridFsId,
          filename,
          mimeType: f.mimetype,
          size: f.size,
          sha256,
          kind: pickKind(f.mimetype),
          authorId: authorId,
          authorName,
          uploadedBy,
          temaIds,          // array de números
        //   tags,             // array de strings, máx 5 ya limitado aquí
          fuente,           // number
          linkDocument,
          estado: 'SUBIDO', // estado inicial
          estadoHistory: [{
          estado: 'SUBIDO',
          changedBy: uploadedBy,
          reason: 'pendiente de evaluación'
         }],
        });
  
        created.push({
          fileId: doc._id.toHexString(),
          gridFsId: gridFsId.toHexString(),
          filename: doc.filename,
          mimeType: doc.mimeType,
          size: doc.size,
          kind: doc.kind,
          sha256: doc.sha256,
          temaIds: doc.temaIds,
        //   tags: doc.tags,
          fuente: doc.fuente,
          estado: doc.estado,
          createdAt: doc.createdAt,
        });
      }
  
      return res.status(200).json({
        ok: true,
        count: created.length,
        files: created,
        fields, // para inspección (puedes quitarlo en prod)
      });
    } catch (err: any) {
      console.error('upload-gridfs error:', err);
      return res.status(500).json({ error: err?.message || 'Error inesperado' });
    }
  }