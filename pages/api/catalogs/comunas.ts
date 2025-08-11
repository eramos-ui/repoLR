import type { NextApiRequest, NextApiResponse } from 'next';
import { getComunasOptions } from '@/lib/cache/comunaCache';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const idRegion = req.query.idRegion;

  if (!idRegion || isNaN(Number(idRegion))) {
    return res.status(400).json({ error: 'Parámetro idRegion es requerido y debe ser numérico' });
  }
  try {
    const opciones = await getComunasOptions(Number(idRegion));
    res.status(200).json(opciones);
  } catch (error) {
    console.error('❌ Error en API /comunas:', error);
    res.status(500).json({ error: 'Error interno al cargar comunas' });
  }
}
