//api/movimientos/movimientosEntreFechas.ts
import { connectDB } from '@/lib/db';

import { NextApiRequest, NextApiResponse } from 'next';
import { CarteraGasto } from '@/models/CarteraGasto';
import { CarteraIngreso } from '@/models/CarteraIngreso';
import { User } from '@/models/User';
// import { formatGrillaMovimientos } from '@/utils/formatGrillaMovimientos';

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
  console.log('en movimientosEntreFechas',email, fechaInicio, fechaFin, tipoFondo, idCasa);
  const claseMovimiento =  'GASTO_'+tipoFondo;
  const clasesGastoPermitidas = claseMovimientoMap[claseMovimiento as keyof typeof claseMovimientoMap] || [];
  // Paso 1: obtener organización del usuario
  const usuario = await User.findOne({ email,vigente: true });
    
  const idOrganizacion = usuario?.idOrganizacion;
  const clasesIngresoPermitidas= tipoFondo === 'NORMAL' ? [1000] : [1001];
  const fechaInicioDate = new Date(fechaInicio?.toString() || '');
  const fechaFinDate = new Date(fechaFin?.toString() || '');
 // Paso 2: ingresos previos
  const rawIngresoPreviosResults = await CarteraIngreso.aggregate([ 
    {   //convierte fechaDocumento de string a Date
        $addFields: {
        fechaDate: { $toDate: "$fechaDocumento" }
        }
    },  
    {
        $match: {     
        tipoDocumento: 'INGRESO',
        entradaSalida: 'S',
        claseMovimiento: { $in: clasesIngresoPermitidas },
        fechaDate: { $lte: fechaInicioDate },
        idCasa: { $gt: 0 } 
        }
    },
   {
    $lookup: {
        from: "familia",
        let: { idCasa: "$idCasa", mesPago: "$mesPago" },
        pipeline: [
        {
            $match: {
            $expr: {
                $and: [
                { $eq: ["$idCasa", "$$idCasa"] },
                { $lte: ["$mesInicio", "$$mesPago"] },
                { $gte: ["$mesTermino", "$$mesPago"] }
                ]
            }
            }
        }
        ],
        as: "familia"
    }
    },
    { $unwind: "$familia" },
    {
        $lookup: {
            from: "casa",
            localField: "idCasa",
            foreignField: "idCasa",
            as: "casa"
            }
    },
    { $unwind: "$casa" },   
    {
        $group: {
            _id: {
                fechaDocumento: "$fechaDocumento",
            },
            ingreso: { $sum: "$monto" },
            salida: { $sum: 0 }
        }
    },
    {
            $sort: { fechaDocumento: 1, comentario: 1  } 
    },
  ]);
  const saldoInicialIngreso = rawIngresoPreviosResults.reduce((acc, mov) => {
    return acc + (mov.ingreso || 0);
  },  0 );
// Paso 3: obtener gastos anteriores
  const rawGastoPreviosResults = await CarteraGasto.aggregate([
        {//convierte fechaDocumento de string a Date
            $addFields: {
            fechaDate: { $toDate: "$fechaDocumento" }
            }
        },  
        {
            $match: {
            claseMovimiento:{ $in: clasesGastoPermitidas},
            tipoDocumento: 'GASTO',
            entradaSalida: 'E',
            fechaDate: { $lt: fechaInicioDate }
            }
        },
        {
        $lookup: {
        from: "docGasto",
        let: { tipo: "$tipoDocumento", nro: "$nroDocumento" },
        pipeline: [
            {
            $match: {
                $expr: {
                $and: [
                    { $eq: ["$tipoDocumento", "$$tipo"] },
                    { $eq: ["$nroDocumento", "$$nro"] }
                ]
                }
            }
            }
        ],
        as: "doc"
        }
    },
    { $unwind: "$doc" },
    {
        $lookup: {
            from: "claseMovimiento",
            localField: "claseMovimiento",
            foreignField: "idClaseMovimiento",
            as: "clase"
        }
    },
    { 
        $unwind: {
            path:"$clase", 
            preserveNullAndEmptyArrays: true
        }
    },
    {
    $addFields: {
        descripcion: {
        $cond: [
            { $in: ["$claseMovimiento", [98]] },
            "$doc.comentario",
            "$clase.descripcion"
        ]
        }
    }
    },
    {
        $group: {
        _id: "$fechaDocumento",
        comentario: { $first: "$descripcion" },
        ingreso: { $sum: 0 },
        salida: { $sum: "$monto" }
        }
    },
    {
        $sort: { _id: 1 } // ← Ordenar por fechaDocumento (que está en _id)
    }
  ]);

const saldoInicialGasto = rawGastoPreviosResults.reduce((acc, mov) => {
    return acc + (mov.salida || 0);
  },  0 );

  // Paso 4:los ingresos del periodo
const rawIngresosPeriodoResults = await CarteraIngreso.aggregate([ 
    {  //convierte fechaDocumento de string a Date
        $addFields: {
        fechaDate: { $toDate: "$fechaDocumento" }
        }
    },  
    {
        $match: {     
        tipoDocumento: 'INGRESO',
        entradaSalida: 'S',
        claseMovimiento: { $in: clasesIngresoPermitidas },
        fechaDate: { $gte: fechaInicioDate, $lte: fechaFinDate },
        idCasa: { $gt: 0 } 
        }
    },
   {
    $lookup: {
        from: "familia",
        let: { idCasa: "$idCasa", mesPago: "$mesPago" },
        pipeline: [
        {
            $match: {
            $expr: {
                $and: [
                { $eq: ["$idCasa", "$$idCasa"] },
                { $lte: ["$mesInicio", "$$mesPago"] },
                { $gte: ["$mesTermino", "$$mesPago"] }
                ]
            }
            }
        }
        ],
        as: "familia"
    }
    },
    { $unwind: "$familia" },
    {
        $lookup: {
            from: "casa",
            localField: "idCasa",
            foreignField: "idCasa",
            as: "casa"
            }
    },
    { $unwind: "$casa" },
    {
        $group: {
            _id: {
                fechaDocumento: "$fechaDocumento",
                idCasa:"$idCasa"
            },
            comentario: { $first: { $concat: ["Casa ", { $toString: "$casa.codigoCasa" }, ", ", "$familia.familia"] } },
            ingreso: { $sum: "$monto" },
            salida: { $sum: 0 }
        }
    },
    {
            $sort: { _id: 1  } // ← Ordenar por fechaDocumento (que está en _id)
    },
]);

// Paso 5:los gastos del periodo
const rawGastosPeriodoResults = await CarteraGasto.aggregate([
    {   //convierte fechaDocumento de string a Date
        $addFields: {
        fechaDate: { $toDate: "$fechaDocumento" }
        }
    },  
    {
        $match: {
        claseMovimiento:{ $in: clasesGastoPermitidas},
        tipoDocumento: 'GASTO',
        entradaSalida: 'E',
        fechaDate: { $gte: fechaInicioDate, $lte: fechaFinDate },
        }
    },
     {
    $lookup: {
      from: "docGasto",
      let: { tipo: "$tipoDocumento", nro: "$nroDocumento" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$tipoDocumento", "$$tipo"] },
                { $eq: ["$nroDocumento", "$$nro"] }
              ]
            }
          }
        }
      ],
      as: "doc"
    }
  },
  { $unwind: "$doc" },
  {
    $lookup: {
        from: "claseMovimiento",
        localField: "claseMovimiento",
        foreignField: "idClaseMovimiento",
        as: "clase"
    }
  },
  { $unwind: "$clase" },
  {
  $addFields: {
    descripcion: {
      $cond: [
        { $in: ["$claseMovimiento", [98]] },
        "$doc.comentario",
        "$clase.descripcion"
      ]
    }
  }
  },
  {
      $group: {
        _id: {
                fechaDocumento: "$fechaDocumento",
                comentario:"$descripcion"
        },
        comentario: { $first: "$descripcion" },
        ingreso: { $sum: 0 },
        salida: { $sum: "$monto" }
        }
  },
  {
    $sort: { _id: 1 } // ← Ordenar por fechaDocumento (que está en _id)
  }
]);
// Paso 6: arma la lista de movimientos
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

const movimientos = ingresos.concat(gastos).sort(
    (a, b) => new Date(a.fechaDocumento).getTime() - new Date(b.fechaDocumento).getTime()
  );
const movimientosConSaldoInicial = [filaInicial, ...movimientos];
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
res.status(200).json(movimientosConSaldo);}
