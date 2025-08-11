// pages/api/diagram/by-process-activity.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { IDiagram } from '@/types/IDiagram';
import { Diagram } from '@/models/Diagram';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido. Usa GET.' });
  }

  const { idProcess, idActivity } = req.query;
  console.log('en by-process-activity idProcess',idProcess, 'idActivity',idActivity);

  if (!idProcess || !idActivity) {
    return res.status(400).json({ error: 'Faltan parámetros idProcess o idActivity.' });
  }

  try {
    await connectDB();

    const diagramDoc = await Diagram.findOne({ idProcess: Number(idProcess) }).lean() as unknown as IDiagram;
    if (!diagramDoc) {
      return res.status(404).json({ error: 'No se encontró el diagrama con el idProcess proporcionado.' });
    }

    const activity = diagramDoc.activityProperties?.find(
      (a: any) => a.idActivity === Number(idActivity)
    );

    if (!activity) {
      return res.status(404).json({ error: 'No se encontró la actividad con el idActivity proporcionado.' });
    }

    return res.status(200).json(activity);
  } catch (error) {
    console.error('❌ Error en API by-process-activity:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
