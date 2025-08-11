// pages/api/files/changeEstado.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { FileMeta } from '@/models/FileMeta';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    await connectDB();    
    const values = req.body;
    let parsed = values;
    if (typeof values === 'string') {//para que ande en postman y en el fetch
        parsed = JSON.parse(values);
    }
    const { fileMetaId, idUserModification: changedBy, aprueba, comentario, filename } = parsed;
    let estado='';
    let reason=comentario;
    if (aprueba === 'A'){
         estado='APROBADO';
         reason='Documento revisado por supervisor'
    }else{
         estado='RECHAZADO';
    }
    console.log('gridFsId,changedBy,estado,reason',fileMetaId,changedBy,estado,reason)
    // res.status(200).json({ message: 'Estado actualizado correctamente'}); return;

    if (!fileMetaId || !estado) {
      return res.status(400).json({ error: 'Faltan datos obligatorios: gridFsId o estado' });
    }

    const file = await FileMeta.findOne({ _id:fileMetaId });

    if (!file) {
      return res.status(404).json({ error: 'Archivo no encontrado:'+fileMetaId +', filename: '+filename });
    }
// res.status(200).json({ message: 'Estado actualizado correctamente'}); return;

    await file.cambiarEstado(estado, { changedBy, reason });

    res.status(200).json({ message: 'Estado actualizado correctamente', file });
  } catch (error: any) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({ error: 'Error interno del servidor', detail: error.message });
  }
}
