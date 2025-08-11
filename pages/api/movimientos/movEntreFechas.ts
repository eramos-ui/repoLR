import { connectDB } from '@/lib/db';

import { NextApiRequest, NextApiResponse } from 'next';
// import { CarteraGasto } from '@/models/CarteraGasto';
// import { CarteraIngreso } from '@/models/CarteraIngreso';
// import { User } from '@/models/User';
import { getMovimientosPrevios } from '@/lib/movimientos/getMovimientosPrevios';
import { getMovimientosPeriodo } from '@/lib/movimientos/getMovimientosPeriodo';

const claseMovimientoMap = {
    GASTO_EMERGENCIA: [99],
    GASTO_NORMAL: Array.from({ length: 98 }, (_, i) => i + 1), // 1 al 98
    GASTO_TODOS: Array.from({ length: 99 }, (_, i) => i + 1),
  };
const normalizarFechas = (arr: any[]) =>
  arr.map((item) => ({
    ...item,
    fechaDocumento: item._id?.fechaDocumento || item.fechaDocumento
  })
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const { email, fechaInicio, fechaFin, tipoFondo, idCasa  } = req.query;
  console.log('en movEntreFechas',email, fechaInicio, fechaFin, tipoFondo, idCasa);
  if (!email || !fechaInicio || !fechaFin || !tipoFondo) {
    return res.status(400).json({ error: 'Faltan parámetros: email, fechaInicio, fechaFin o tipoFondo' });
  }
  const fechaInicioDate = new Date(fechaInicio?.toString() || '');
  const fechaFinDate = new Date(fechaFin?.toString() || '');
  const movimientos = await getMovimientosPrevios(
    email.toString(),
    new Date(fechaInicio.toString()),
    tipoFondo.toString().toUpperCase()
  );
  const rawIngresoPreviosResults=movimientos.ingresos;
  const rawGastoPreviosResults=movimientos.gastos;
  const saldoInicialIngreso = rawIngresoPreviosResults.reduce((acc, mov) => {
    return acc + (mov.ingreso || 0);
  },  0 );
  const saldoInicialGasto = rawGastoPreviosResults.reduce((acc, mov) => {
    return acc + (mov.salida || 0);
  },  0 );
  const movimientosPeriodo = await getMovimientosPeriodo(
    email.toString(),
    new Date(fechaInicio.toString()),
    new Date(fechaFin.toString()),
    tipoFondo.toString().toUpperCase(),
  );
  // console.log('en movEntreFechas movimientosPeriodo',movimientosPeriodo);
  const rawIngresosPeriodoResults=movimientosPeriodo.ingresos;
  const rawGastosPeriodoResults=movimientosPeriodo.gastos;

const saldoInicial = saldoInicialIngreso - saldoInicialGasto;

const filaInicial = {
  //_id: new Date(fechaInicioDate.getTime() - 86400000), // un día antes
  idCasa: 0,
  fechaDocumento: new Date(fechaInicioDate.getTime() - 86400000).toISOString(),
  comentario: "Saldo inicial",
  ingreso: saldoInicialIngreso,
  salida: saldoInicialGasto,
  saldo: saldoInicial
};
const ingresos = normalizarFechas(rawIngresosPeriodoResults);
const gastos = normalizarFechas(rawGastosPeriodoResults);


const movimientosFull = ingresos.concat(gastos).sort(
    (a, b) => new Date(a.fechaDocumento).getTime() - new Date(b.fechaDocumento).getTime()
  );
const movimientosConSaldoInicial = [filaInicial, ...movimientosFull];
let saldo = 0;
const movimientosConSaldo = movimientosConSaldoInicial.map(mov => {
  const id=mov._id;
  let idCasa = 0;
  if (mov.ingreso > 0 && mov.salida === 0) idCasa =id.idCasa; //para hacer un zoom en la grilla si idCasa>0  y es ingreso
  saldo += (mov.ingreso || 0) - (mov.salida || 0);
  return {
    idCasa,
    ...mov,
    saldo
  };
})
res.status(200).json(movimientosConSaldo);

}
