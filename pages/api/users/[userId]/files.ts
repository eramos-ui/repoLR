// /pages/api/users/[userId]/files.ts
/*
Lee los documentos de un userId (mongo) que le muestra los documentos que ya ha subido
*/
import type { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { connectDB } from '@/lib/db';
import { FileMeta } from '@/models/FileMeta';

function cleanId(input: unknown): string {
  const raw = Array.isArray(input) ? input[0] : String(input ?? '');
  return decodeURIComponent(raw).trim().replace(/^"|"$/g, '');
}

function makeAbsUrl(req: NextApiRequest, path: string) {
  const proto =
    (req.headers['x-forwarded-proto'] as string) ||
    (process.env.NODE_ENV === 'production' ? 'https' : 'http');
  const host = req.headers.host;
  return `${proto}://${host}${path}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end('Method Not Allowed');
  }
//  console.log('en files req.query.userId',req.query.userId)
  try {
    const userId = cleanId(req.query.userId);
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'userId inválido' });
    }
    // filtros opcionales
    const { page = '1', pageSize = '20', estado, q } = req.query as Record<string, string>;
    const pageNum = Math.max(1, Number(page) || 1);
    const sizeNum = Math.min(100, Math.max(1, Number(pageSize) || 20));
    const skip = (pageNum - 1) * sizeNum;

    await connectDB();

    const filter: any = { uploadedBy: new ObjectId(userId) };
    if (estado) filter.estado = estado;

    if (q) {
      filter.$or = [
        { filename: { $regex: q, $options: 'i' } },
        { tags: { $elemMatch: { $regex: q, $options: 'i' } } },
      ];
    }
    const [items, total] = await Promise.all([
      FileMeta.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(sizeNum),
      FileMeta.countDocuments(filter),
    ]);

    // Mapear SOLO lo que necesito en la grilla
    const mapped = items.map((it) => {
      const lastHistory = (it.estadoHistory ?? []).slice(-1)[0];
      const lastReason = lastHistory?.reason ?? null;
      const estadoActual=lastHistory?.estado ?? null;
      const gridFsId = String(it.gridFsId);
      const fechaSubido=(new Date( it.updatedAt)).toISOString().split('T')[0];
      const [year, month, day] = fechaSubido?.split("-") || [];
      const fechaSubidoFormatted = `${day}/${month}/${year}`;
      let  filename=it.filename
      if (it.filename.includes('/')){
         filename=it.filename.split('/')[1]; //para extraer el id
      }
      return {
        fileMetaId: String(it._id),
        gridFsId,
        filename,
        updatedAt: fechaSubidoFormatted,     // timestamp del doc (por timestamps:true)
        estadoActual: estadoActual,     // estado actual
        reason: lastReason,          // motivo del último cambio (si existe)
        // URLs útiles por si quieres botones Ver/Descargar:
        viewUrl: makeAbsUrl(req, `/api/files/${encodeURIComponent(gridFsId)}?disposition=inline`),
        downloadUrl: makeAbsUrl(req, `/api/files/${encodeURIComponent(gridFsId)}?disposition=attachment`),
      };
    });

    return res.status(200).json({ items: mapped, total, page: pageNum, pageSize: sizeNum });
  } catch (e: any) {
    console.error('GET /users/:userId/files error:', e);
    return res.status(500).json({ error: e.message });
  }

}
