// /pages/api/files/upload.ts (ejemplo con Next.js Pages API)

import type { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import { connectDB, getBucket  } from '@/lib/db';
import { FileMeta } from '@/models/FileMeta';

export const config = { api: { bodyParser: false } }; // necesario para multer
// Multer en memoria
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
  });
// Helper para ejecutar middlewares estilo connect
function runMiddleware<T = any>(req: NextApiRequest, res: NextApiResponse, fn: Function) {
    return new Promise<T>((resolve, reject) => {
      fn(req, res, (result: any) => (result instanceof Error ? reject(result) : resolve(result as T)));
    });
  }
  function fixFilename(name: string) {//para salvar los caracteres con tile y ñ
    // Reinterpretar latin1->utf8 y normalizar Unicode (combina acentos)
    const utf8 = Buffer.from(name, 'latin1').toString('utf8');
    // Limpiar controles (por seguridad) y normalizar a NFC
    return utf8.normalize('NFC').replace(/[\u0000-\u001F\u007F]/g, '');
  }

  function parseArrayField(field: unknown): string[] {
    if (Array.isArray(field)) return field.map(String);
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field);
        if (Array.isArray(parsed)) return parsed.map(String);
        return [field];
      } catch {
        return [field]; // no era JSON; un solo valor
      }
    }
    return [];
  }

  function normalizeLimited<T>(arr: T[], max = 5) {
    // dedup preservando orden + límite
    const seen = new Set<string>();
    const out: T[] = [];
    for (const v of arr) {
      const key = String(v);
      if (!seen.has(key)) {
        out.push(v);
        seen.add(key);
      }
      if (out.length >= max) break;
    }
    return out;
  }

  function normalizeTags(raw: string[]) {
    const cleaned = raw.map(t => t.trim().replace(/\s+/g, ' ')).filter(Boolean);
    return normalizeLimited(cleaned, 5);
  }
  
  function normalizeTemaIds(raw: string[]) {
    // si tus IDs son numéricos: return normalizeLimited(raw.map(n => Number(n)), 5);
    return normalizeLimited(raw.map(String), 5); // strings/ObjectId
  }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  try {
    await runMiddleware(req, res, upload.single('file'));
    await connectDB();
    const bucket = getBucket();

    const file = (req as any).file as Express.Multer.File;
    if (!file) return res.status(400).json({ error: 'Falta el campo file' });
    // Validaciones opcionales
    const mime = file.mimetype || '';
    let kind: 'pdf' | 'image' | 'other' = 'other';
    if (mime.startsWith('image/')) kind = 'image';
    else if (mime === 'application/pdf') kind = 'pdf'
    // const allowed = ['application/pdf', 'image/png', 'image/jpeg']; 
    // if (!allowed.includes(file.mimetype)) return res.status(400).json({ error: 'Tipo de archivo no permitido' });

    // Campos de metadata opcionales desde form-data
    const temaIdsInput = parseArrayField((req as any).body?.temaIds ?? (req as any).body?.['temaIds[]']);
    const tagsInput = parseArrayField((req as any).body?.tags ?? (req as any).body?.['tags[]']);
    const authorId = (req as any).body?.authorId || undefined;
    const authorNameRaw = (req as any).body?.authorName || '';
    const uploadedBy = (req as any).body?.uploadedBy || undefined;
    const fuente= (req as any).body?.fuente || undefined;
    const linkDocument= (req as any).body?.linkDocument || undefined;
    const versionRaw = (req as any).body?.version;

    const temaIds = normalizeTemaIds(temaIdsInput); // máx 5
    const tags = normalizeTags(tagsInput);          // máx 5
    const authorName = String(authorNameRaw).trim().slice(0, 120) || undefined;
    const version = ((): number => {
        const v = (req as any).body?.version;
        return typeof v !== 'undefined' ? (Number(v) || 1) : 1;
      })();

    // Filename 
    const rawName = (req as any).file.originalname;
    const originalName = fixFilename(rawName);
 
    // Subir a GridFS
    const uploadStream = bucket.openUploadStream(originalName, {
     contentType: file.mimetype,
    });
    const gridFsId = uploadStream.id;

    await new Promise<void>((resolve, reject) => {
        uploadStream.on('error', reject);
        uploadStream.on('finish', resolve);
        uploadStream.end(file.buffer);
    });

     // Crear metadata
    let fileMetaId: string | undefined;
    try {
     const meta = await FileMeta.create({//Aquí grab la collection files
        gridFsId,
        filename: originalName,
        mimeType: file.mimetype,
        size: file.size,
        kind,
        authorId,
        authorName,
        uploadedBy,
        temaIds,
        fuente,
        linkDocument,
        tags,
        version,
        estado: 'SUBIDO', // estado inicial
        estadoHistory: [{
        estado: 'SUBIDO',
        changedBy: uploadedBy,
        reason: 'pendiente de evaluación',
        }],
    });
    fileMetaId = String(meta._id);
    } catch (metaErr) {
     // Si falla la metadata, el archivo ya está en GridFS. Puedes decidir borrar GridFS o dejarlo y reportar.
     console.error('Fallo guardando metadata:', metaErr);
    }

    return res.status(201).json({
        ok: true,
        gridFsId,              // _id de uploads.files
        fileMetaId,            // _id del documento en tu colección de metadata (si aplica)
        filename: originalName,
        mimeType: file.mimetype,
        size: file.size,
        temaIds,
        tags,
        authorId,
        authorName,
        version,
        estado: 'SUBIDO',
    });
    } catch (e: any) {
        console.error('Error en upload:', e);
        return res.status(500).json({ error: e.message });
    }

}