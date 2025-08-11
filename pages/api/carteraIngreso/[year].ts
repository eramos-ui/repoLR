// /pages/api/carteraIngreso/[año].ts
/*
lee la cartera de ingresos de un año
*/
import { connectDB } from '@/lib/db';
import { CarteraIngreso } from '@/models/CarteraIngreso';
import { CarteraAggregated } from '@/types/interfaceGastosComunes';
import { NextApiRequest, NextApiResponse } from 'next';

const monthMap: { [key: number]: string } = {
  1: 'ene', 2: 'feb', 3: 'mar', 4: 'abr', 5: 'may', 6: 'jun',
  7: 'jul', 8: 'ago', 9: 'sep', 10: 'oct', 11: 'nov', 12: 'dic'
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB(); 

  const { year } = req.query;
  const año = parseInt(year as string, 10);

  const mesInicio = año * 100 + 1;
  const mesFin = año * 100 + 12;

  // const rawResults = await CarteraIngreso.aggregate([

  const rawResults: CarteraAggregated[] = await CarteraIngreso.aggregate([    
    {
      $match: { mesPago: { $gte: mesInicio, $lte: mesFin } }
    },
    {
      $lookup: {
        from: "casa",
        localField: "idCasa",
        foreignField: "idCasa",
        as: "casaInfo"
      }
    },
    { $unwind: "$casaInfo" },
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
        as: "familiaInfo"
      }
    },
    {
      $unwind: {
        path: "$familiaInfo",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $group: {
        _id: {
          idCasa: "$idCasa",
          codigoCasa: "$casaInfo.codigoCasa",
          familia: "$familiaInfo.familia",
          mes: { $mod: ["$mesPago", 100] }
        },
        totalMonto: { $sum: "$monto" }
      }
    },
    {
      $project: {
        idCasa: "$_id.idCasa",
        codigoCasa: "$_id.codigoCasa",
        familia: { $ifNull: ["$_id.familia", "Sin familia"] },
        mes: "$_id.mes",
        totalMonto: 1,
        _id: 0
      }
    }
  ]);

  const grilla: Record<string, any> = {};

  rawResults.forEach(({ idCasa, codigoCasa, familia, mes, totalMonto }) => {
    const key = `${idCasa}_${familia}`;
    if (!grilla[key]) {
      grilla[key] = { idCasa, codigoCasa, familia };
      Object.values(monthMap).forEach(m => {
        grilla[key][m] = 0;
      });
    }
    const mesStr = monthMap[mes];
    grilla[key][mesStr] = totalMonto;
  });

  Object.values(grilla).forEach((fila: any) => {
    fila.totalAnual = Object.values(monthMap)
      .map(m => fila[m] || 0)
      .reduce((acc, val) => acc + val, 0);
  });

  const resultado = Object.values(grilla);

  res.status(200).json(resultado);
}


/*
import type { NextApiRequest, NextApiResponse } from 'next';
import { CarteraIngreso } from '@/models/CarteraIngreso'; // Asegúrate de que esta ruta sea correcta

import { connectDB } from '@/lib/db'; // Ajusta a tu conexión Mongo

const monthMap: { [key: number]: string } = {
  1: 'ene', 2: 'feb', 3: 'mar', 4: 'abr', 5: 'may', 6: 'jun',
  7: 'jul', 8: 'ago', 9: 'sep', 10: 'oct', 11: 'nov', 12: 'dic'
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // console.log('...en api carteraIngreso');
  await connectDB();
  const { year } = req.query;
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }  
  if (!year || Array.isArray(year)) {
    return res.status(400).json({ message: 'año inválido' });
  }
  // const annoNum=Number(anno);
  // console.log('...en api carteraIngreso/[anno]',annoNum);

  try {
    const año = Number(year);
    const mesInicio = año * 100 + 1;
    const mesFin = año * 100 + 12;


const rawResults  = await CarteraIngreso.aggregate([
  {
    $match: {
      mesPago: { $gte: mesInicio, $lte: mesFin }
    }
  },
  {
    $group: {
      _id: {
        idCasa: "$idCasa",
        mesPago: "$mesPago"
      },
      totalMonto: { $sum: "$monto" }
    }
  },
  {
    $lookup: {
      from: "casa",
      localField: "_id.idCasa",
      foreignField: "idCasa",
      as: "casaInfo"
    }
  },
  {
    $unwind: "$casaInfo"
  },
  {
    $project: {
      _id: 0,
      codigoCasa: "$casaInfo.codigoCasa",
      mesPago: "$_id.mesPago",
      año: { $floor: { $divide: ["$_id.mesPago", 100] } },
      mes: { $mod: ["$_id.mesPago", 100] },
      totalMonto: 1
    }
  },
  {
    $sort: {
      codigoCasa: 1,
      mesPago: 1
    }
  }
  ]);
  // Transformar a estructura por casa
  const grilla: Record<string, any> = {};
  rawResults.forEach(({ codigoCasa, mes, totalMonto }) => {
    if (!grilla[codigoCasa]) {
      grilla[codigoCasa] = { codigoCasa };
      Object.values(monthMap).forEach(m => {
        grilla[codigoCasa][m] = 0;
      });
    }
    const mesStr = monthMap[mes];
    grilla[codigoCasa][mesStr] = totalMonto;
  });
    // Agregar total anual por casa
  Object.values(grilla).forEach((fila: any) => {
      fila.totalAnual = Object.values(monthMap)
        .map(m => fila[m] || 0)
        .reduce((acc, val) => acc + val, 0);
  });
  const resultado = Object.values(grilla);
  if (!resultado ) {
      return res.status(404).json({ message: 'Añosin movimientos' });
    }
    return res.status(200).json(resultado );
  } catch (error) {
    console.error('Error al obtener formulario:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}
*/