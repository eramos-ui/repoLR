// pages/api/testMovimientosPeriodo.ts
//Sólo para probar el funcionamiento de la función getMovimientosPeriodo
import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { getMovimientosPeriodo } from '@/lib/movimientos/getMovimientosPeriodo';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const { email, fechaInicio, fechaFin, tipoFondo } = req.query;

  if (!email || !fechaInicio  || !fechaFin || !tipoFondo) {
    return res.status(400).json({ error: 'Faltan parámetros: email, fechaInicio, fechaFin o tipoFondo' });
  }

  try {
    const movimientos = await getMovimientosPeriodo(
      email.toString(),
      new Date(fechaInicio.toString()),
      new Date(fechaFin.toString()),
      tipoFondo.toString().toUpperCase()
    );
    res.status(200).json(movimientos);
  } catch (error) {
    console.error('Error al obtener movimientos periodo:', error);
    res.status(500).json({ error:    'Error al obtener movimientos periodo' });
  }
}