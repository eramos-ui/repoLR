import type { NextApiRequest, NextApiResponse } from 'next';
import { getRegionesOptions } from '@/lib/cache/regionCache';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const opciones = await getRegionesOptions();
    res.status(200).json(opciones);
  } catch (error) {
    console.error('❌ Error al cargar regiones:', error);
    res.status(500).json({ error: 'Error al cargar regiones' });
  }
}
