// pages/api/carteraIngreso/agrupado.ts
import { connectDB } from '@/lib/db';
import { CarteraIngreso } from '@/models/CarteraIngreso';
import { NextApiRequest, NextApiResponse } from 'next';
import { formatGrilla } from '@/utils/formatGrilla';
import { CarteraAggregated } from '@/types/interfaceGastosComunes';

const claseMovimientoMap: Record<string, number[]> = {
    INGRESO_NORMAL: [1000],
    INGRESO_EMERGENCIA: [1001],
    GASTO_NORMAL: [1000],
    GASTO_TODOS: [],
    INGRESO_TODOS: []
  };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
await connectDB();
const { year, clase_movimiento } = req.query;
const clasesPermitidas = claseMovimientoMap[clase_movimiento as string] || [];
const mesInicio = Number(year) * 100 + 1;
const mesFin = Number(year) * 100 + 12;
// const entradaSalidaCond = clase_movimiento === 'INGRESO_TODOS' ? 'S' : 'E';
const entradaSalidaCond = clase_movimiento?.toString().startsWith('INGRESO') ? 'S' : 'E';
const matchStage: any = {
    mesPago: { $gte: mesInicio, $lte: mesFin },
    entradaSalida: entradaSalidaCond
  };
if (clasesPermitidas.length > 0) {
matchStage.claseMovimiento = { $in: clasesPermitidas };
}
const rawResults: CarteraAggregated[] = await CarteraIngreso.aggregate([
    {
  // corresponde al where
       $match: matchStage
    },
        {
            $lookup: {
            from: "casa",
            localField: "idCasa",
            foreignField: "idCasa",
            as: "casaInfo"
            }
        },
        { $unwind: "$casaInfo" }, //corresponde a un inner join
        {
            $lookup: { // left join
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
            //corresponde al group by y los campos que se van a agrupar van en el _id (clvae de agrupación)
            $group: {
            _id: {
                idCasa: "$idCasa",
                codigoCasa: "$casaInfo.codigoCasa",
                familia: "$familiaInfo.familia",
                mes: { $mod: ["$mesPago", 100] }
            },
            totalMonto: { $sum: "$monto" } // operaciones agregadas como $sum, $avg, $max, $push
            }
        },
        {
            //esta da forma al resultado final
             //Extrae valores desde _id: idCasa, codigoCasa, familia, mes que estaban dentro de _id, ahora se "suben" al nivel raíz del documento.
            $project: {
                idCasa: "$_id.idCasa",
                codigoCasa: "$_id.codigoCasa",
                familia: { $ifNull: ["$_id.familia", "Sin familia"] }, //Asigna valor por defecto si familia es nulo
                mes: "$_id.mes",
                totalMonto: 1,
                _id: 0
            }
        }
    ]);
    // res.status(200).json(rawResults);
    const resultado = formatGrilla(rawResults) ;

    res.status(200).json(resultado);
}