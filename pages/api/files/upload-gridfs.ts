///api/files/upload-gridfs.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import crypto from 'crypto';
import { Types } from 'mongoose';
import { getBucket } from '@/lib/db';
import { FileMeta } from '@/models/FileMeta';
import { normalizeOriginalName } from '@/utils/filename';

export const config = {
  api: { bodyParser: false },
};

const upload = multer({ storage: multer.memoryStorage() });
const DEDUPE_MODE = (process.env.DEDUPE_MODE || 'strict') as 'strict' | 'link';

function runMw(req: any, res: any, fn: any) {
  return new Promise((resolve, reject) => fn(req, res, (r: any) => (r instanceof Error ? reject(r) : resolve(r))));
}

function toNumber(v: any): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
function toNumberArray(v: any): number[] {
  if (Array.isArray(v)) return v.map(Number).filter(Number.isFinite);
  if (v === undefined || v === null || v === '') return [];
  return [Number(v)].filter(Number.isFinite);
}
function pickKind(mime: string): 'pdf' | 'image' | 'other' {
  if (!mime) return 'other';
  if (mime === 'application/pdf') return 'pdf';
  if (mime.startsWith('image/')) return 'image';
  return 'other';
}
function isHexId(s: any): s is string {
  return typeof s === 'string' && /^[a-f\d]{24}$/i.test(s);
}

type FMLean = {
  _id: Types.ObjectId;
  gridFsId: Types.ObjectId;
  filename: string;
  mimeType: string;
  size: number;
  sha256?: string;
  kind: 'pdf' | 'image' | 'other';
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await runMw(req as any, res as any, upload.any());

    const files: Express.Multer.File[] = ((req as any).files as Express.Multer.File[]) || [];
    const fields = (req as any).body || {};

    if (!files.length) return res.status(400).json({ error: 'No se adjuntaron archivos.' });

    // row como JSON seguro
    let row: any = {};
    try {
      row = fields.row ? JSON.parse(fields.row) : {};
    } catch {
      return res.status(400).json({ error: 'row no es JSON válido' });
    }

    // uploadedBy / authorId
    const idUserModification = String(fields.idUserModification || '');
    if (!isHexId(idUserModification)) {
      return res.status(400).json({ error: 'idUserModification debe ser un ObjectId válido.' });
    }
    const uploadedBy = new Types.ObjectId(idUserModification);

    const authorId =
      isHexId(row.authorId) ? new Types.ObjectId(row.authorId) : uploadedBy;
    const authorName = typeof row.authorName === 'string' ? row.authorName.trim() : '';

    // otros campos opcionales
    const fuente = toNumber(row.fuente);
    const temaIds = toNumberArray(row.tema);
    const linkDocument = typeof row.linkDocument === 'string' && row.linkDocument.trim() ? row.linkDocument.trim() : undefined;

    const bucket = getBucket();

    // acumuladores de resultado
    const created: any[] = [];
    const duplicates: any[] = [];

    for (const f of files) {
      const originalFixed = normalizeOriginalName(f.originalname);
      const sha256 = crypto.createHash('sha256').update(f.buffer).digest('hex');

      // 1) Dedupe pre-subida
      const existing = await FileMeta
        .findOne({ sha256, size: f.size })
        .select('_id gridFsId filename mimeType size sha256 kind')
        .lean<FMLean>()
        .exec();

      if (existing) {
        if (DEDUPE_MODE === 'strict') {
          duplicates.push({
            duplicateOf: existing._id.toString(),
            gridFsId: existing.gridFsId.toString(),
            filename: existing.filename,
            mimeType: existing.mimeType,
            size: existing.size,
            sha256: existing.sha256,
          });
          continue;
        } else {
          const meta = await FileMeta.create({
            gridFsId: existing.gridFsId,
            filename: existing.filename, // o tu convención si prefieres
            mimeType: f.mimetype,
            size: f.size,
            sha256,
            kind: existing.kind,
            uploadedBy,
            authorId,
            authorName,
            temaIds,
            fuente,
            linkDocument,
            version: 1,
          });
          created.push({
            fileId: meta._id.toString(),
            gridFsId: existing.gridFsId.toString(),
            filename: meta.filename,
            mimeType: meta.mimeType,
            size: meta.size,
            sha256: meta.sha256,
            dedup: true,
          });
          continue;
        }
      }

      // 2) Subir a GridFS
      const filename = `${idUserModification}/${originalFixed}`;
      const readStream = Readable.from(f.buffer);
      const uploadStream = bucket.openUploadStream(filename, {
        contentType: f.mimetype,
        metadata: {
          fieldname: f.fieldname,
          originalName: originalFixed, // usa el normalizado
          uploadedBy: uploadedBy.toHexString(),
        },
      });

      let gridFsId: Types.ObjectId | null = null;

      try {
        readStream.pipe(uploadStream);
        await finished(uploadStream);
        gridFsId = uploadStream.id as Types.ObjectId;

        const doc = await FileMeta.create({
          gridFsId,
          filename,
          mimeType: f.mimetype,
          size: f.size,
          sha256,
          kind: pickKind(f.mimetype),
          authorId,
          authorName,
          uploadedBy,
          temaIds,
          fuente,
          linkDocument,
          estado: 'SUBIDO',
          estadoHistory: [
            {
              estado: 'SUBIDO',
              changedBy: uploadedBy,
              reason: 'pendiente de evaluación',
            },
          ],
          version: 1,
        });

        created.push({
          fileId: doc._id.toString(),
          gridFsId: gridFsId.toString(),
          filename: doc.filename,
          mimeType: doc.mimeType,
          size: doc.size,
          sha256: doc.sha256,
        });
      } catch (e: any) {
        // carrera por índice único (sha256,size)
        if (e?.code === 11000) {
          if (gridFsId) {
            try { await bucket.delete(gridFsId); } catch {}
          }
          const ex2 = await FileMeta
            .findOne({ sha256, size: f.size })
            .select('_id gridFsId filename mimeType size sha256 kind')
            .lean<FMLean>()
            .exec();
          if (ex2) {
            if (DEDUPE_MODE === 'strict') {
              duplicates.push({
                duplicateOf: ex2._id.toString(),
                gridFsId: ex2.gridFsId.toString(),
                filename: ex2.filename,
                mimeType: ex2.mimeType,
                size: ex2.size,
                sha256: ex2.sha256,
              });
            } else {
              const meta = await FileMeta.create({
                gridFsId: ex2.gridFsId,
                filename: ex2.filename,
                mimeType: f.mimetype,
                size: f.size,
                sha256,
                kind: ex2.kind,
                uploadedBy,
                authorId,
                authorName,
                temaIds,
                fuente,
                linkDocument,
                version: 1,
              });
              created.push({
                fileId: meta._id.toString(),
                gridFsId: ex2.gridFsId.toString(),
                filename: meta.filename,
                mimeType: meta.mimeType,
                size: meta.size,
                sha256: meta.sha256,
                dedup: true,
              });
            }
            continue;
          }
        }
        throw e;
      }
    } // end for
    // Respuesta coherente
    if (DEDUPE_MODE === 'strict' && duplicates.length && created.length === 0) {
      return res.status(409).json({
        ok: false,
        error: 'DUPLICATE_FILE',
        message: 'Archivo(s) ya existe(n).',
        duplicates,
        created,
      });
    }
    return res.status(200).json({
      ok: true,
      count: created.length,
      created,
      duplicates: DEDUPE_MODE === 'strict' ? duplicates : undefined,
    });
  } catch (err: any) {
    console.error('upload-gridfs error:', err);
    return res.status(500).json({ error: err?.message || 'Error inesperado' });
  }
}