import { connectDB } from '@/lib/db';

import { NextApiRequest, NextApiResponse } from 'next';
import { formatGrilla } from '@/utils/formatGrilla';
import { CarteraAggregated } from '@/types/interfaceGastosComunes';
import { CarteraGasto } from '@/models/CarteraGasto';

const claseMovimientoMap = {
    GASTO_EMERGENCIA: [99],
    GASTO_NORMAL: Array.from({ length: 98 }, (_, i) => i + 1), // 1 al 98
    GASTO_TODOS: Array.from({ length: 99 }, (_, i) => i + 1),
  };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const { year, clase_movimiento } = req.query;

  const clasesPermitidas = claseMovimientoMap[clase_movimiento as keyof typeof claseMovimientoMap] || [];
  
  const rawResults: CarteraAggregated[] = await CarteraGasto.aggregate([
    {
      //convierte fechaDocumento de string a Date
      $addFields: {
        fechaDate: { $toDate: "$fechaDocumento" }
      }
    },
    {
    // corresponde al where
      $match: {
       fechaDate: {
          $gte: new Date(Number(year), 0, 1),
          $lt: new Date(Number(year) + 1, 0, 1)        
       },
       tipoDocumento:'GASTO',
       entradaSalida: 'E',
       claseMovimiento: { $in: clasesPermitidas }
      }
    },
    {
      $lookup: {
        from: "docGasto",
        let: {
          tipoDoc: "$tipoDocumento",
          nroDoc: "$nroDocumento"
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$tipoDocumento", "$$tipoDoc"] },
                  { $eq: ["$nroDocumento", "$$nroDoc"] }
                ]
              }
            }
          }
        ],
        as: "docGastoInfo"
      }
    },
    {
      $unwind: {
        path: "$docGastoInfo" //INNER JOIN
        //,preserveNullAndEmptyArrays: true // LEFT JOIN
      }
    },
    {
      // LEFT JOIN con claseMovimiento
      $lookup: {
        from: "claseMovimiento",
        localField: "claseMovimiento",
        foreignField: "idClaseMovimiento",
        as: "claseMovimientoInfo"
      }
    },
     {
      //agrupación sumando monto
      $group: {
        _id: {
          claseMovimiento: "$docGastoInfo.claseMovimiento",
          comentario: "$docGastoInfo.comentario",
          mes: { $month: "$fechaDate" },
          descripcionMovimiento: "$claseMovimientoInfo.descripcion"
        },
        totalMonto: { $sum: "$monto" }
      }
    },
    {
      $unwind: {
        path: "$claseMovimientoInfo",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 0,
        claseMovimiento: "$_id.claseMovimiento",
        idCasa: "$_id.claseMovimiento",
        codigoCasa: "$_id.claseMovimiento",
        familia: {
            $cond: {
              if: { $in: ["$_id.claseMovimiento", [98, 99]] },
              then: "$_id.comentario",
              else: "$_id.descripcionMovimiento"
            }
          },
        mes: "$_id.mes",
        totalMonto: 1
      }
    },
    {
      $sort: {
        claseMovimiento: 1,
        mes: 1,  
      }
    }
  ])
//   res.status(200).json(rawResults);
  const resultado = formatGrilla(rawResults) ;
  res.status(200).json(resultado);
}