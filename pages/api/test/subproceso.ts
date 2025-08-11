// /pages/api/test/subproceso.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { crearSubProcesoGantt } from '@/helpers/actions/crearSubProcesoGantt';
import  {connectDB}  from '@/lib/db';
/*
API para crear el proceso de las actividades de un proyecto en MongoDB
*/
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('🛠 Ejecutando acción: crearSubProcesoGantt');
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Método no permitido' });
    }
  
    const idProcessInstance = Number(req.query.idProcessInstance);
    const tipoDocumento = String(req.query.tipoDocumento || '');
    const nroDocumento = Number(req.query.nroDocumento);
  
    if (!idProcessInstance || !tipoDocumento || isNaN(nroDocumento)) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos' });
    }
  
    try {
      await connectDB(); // conecta a Mongo si no está conectado
  
      await crearSubProcesoGantt(idProcessInstance, tipoDocumento, nroDocumento);
  
      res.status(200).json({ message: '✅ Subproceso creado con éxito.' });
    } catch (error) {
      console.error('❌ Error al ejecutar crearSubProcesoGantt:', error);
      res.status(500).json({ error: 'Error interno', details: (error as Error).message });
    }
  }
