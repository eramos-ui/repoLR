// /pages/api/forms/loadOptions/getClaseMovimentoGastos.ts
//Para la grilla de mantención de form dinámico de roles

import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { ClaseMovimiento } from '@/models/ClaseMovimiento';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();

    const clases = await ClaseMovimiento.find({ ingresoGasto: 'G' })
      .select('idClaseMovimiento descripcion')
      .sort({ idClaseMovimiento: 1 }); // opcional, para ordenarlos

    const opciones = clases.map((clase) => ({
      value: clase.idClaseMovimiento,
      label: clase.descripcion
    }));

    res.status(200).json(opciones);
  } catch (error) {
    console.error('Error al obtener clases de gasto:', error);
    res.status(500).json({ error: 'Error al obtener clases de gasto' });
  }
}
