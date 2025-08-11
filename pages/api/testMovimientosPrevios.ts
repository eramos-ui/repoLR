// pages/api/testMovimientosPrevios.ts
//Sólo para probar el funcionamiento de la función getMovimientosPrevios
import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { getMovimientosPrevios } from '@/lib/movimientos/getMovimientosPrevios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const { email, fechaInicio, tipoFondo } = req.query;

  if (!email || !fechaInicio  || !tipoFondo) {
    return res.status(400).json({ error: 'Faltan parámetros: email, fechaInicio o tipoFondo' });
  }

  try {
    const movimientos = await getMovimientosPrevios(
      email.toString(),
      new Date(fechaInicio.toString()),
      tipoFondo.toString().toUpperCase()
    );

    res.status(200).json(movimientos);
  } catch (error) {
    console.error('Error al obtener movimientos previos:', error);
    res.status(500).json({ error: 'Error al obtener movimientos previos' });
  }
}