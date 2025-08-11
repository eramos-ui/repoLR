import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { Empresa } from '@/models/Empresa';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const { idProject } = req.query;

//   if (!idProject || isNaN(Number(idProject))) {
//     return res.status(400).json({ error: 'Parámetro idProject inválido' });
//   }

  try {
    await connectDB();
    const empresa = await Empresa.findOne().lean();

    if (!empresa) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }
    res.status(200).json(empresa);
  } catch (error) {
    console.error('❌ Error al buscar empresa:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
