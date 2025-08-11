// pages/api/movSaldoInicial.ts
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
    // const movimientosUnidos = movimientos.ingresos;
    const movimientosFull = movimientos.ingresos.concat(movimientos.gastos).sort(
        (a, b) => new Date(a.fechaDocumento).getTime() - new Date(b.fechaDocumento).getTime()
      );

    res.status(200).json(movimientosFull);
  } catch (error) {
    console.error('Error al obtener movimientos saldo inicial:', error);
    res.status(500).json({ error: 'Error al obtener movimientos saldo inicial' });
  }
}