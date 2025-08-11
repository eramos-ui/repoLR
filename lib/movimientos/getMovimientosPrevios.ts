import { CarteraIngreso } from '@/models/CarteraIngreso';
import { CarteraGasto } from '@/models/CarteraGasto';
import { User } from '@/models/User';

const claseMovimientoMap = {
    GASTO_EMERGENCIA: [99],
    GASTO_NORMAL: Array.from({ length: 98 }, (_, i) => i + 1), // 1 al 98
    GASTO_TODOS: Array.from({ length: 99 }, (_, i) => i + 1),
  };
// const normalizarFechas = (arr: any[]) =>
//   arr.map((item) => ({
//     ...item,
//     fechaDocumento: item._id?.fechaDocumento || item.fechaDocumento
//   })
// );

//email, fechaInicio, fechaFin, tipoFondo
export async function getMovimientosPrevios(
  email: string,
  fechaInicio: Date,
  tipoFondo: string
) {
    const claseMovimiento =  'GASTO_'+tipoFondo;
    const clasesGastoPermitidas = claseMovimientoMap[claseMovimiento as keyof typeof claseMovimientoMap] || [];
    // Paso 1: obtener organización del usuario
    const usuario = await User.findOne({ email,vigente: true });
      
    const idOrganizacion = usuario?.idOrganizacion;
    const clasesIngresoPermitidas= tipoFondo === 'NORMAL' ? [1000] : [1001];
    const fechaInicioDate = new Date(fechaInicio?.toString() || '');
  // Ingresos previos
  const ingresos = await CarteraIngreso.aggregate([ 
    {
      $addFields: {
        fechaDate: { $toDate: "$fechaDocumento" }
      }
    },
    {
      $match: {
        tipoDocumento: 'INGRESO',
        entradaSalida: 'S',
        claseMovimiento: { $in: clasesIngresoPermitidas },
        fechaDate: { $lte: fechaInicio },
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
        fechaDocumento: { $first: "$fechaDocumento" },
        comentario: { $first: "$familia.familia" },
        ingreso: { $sum: "$monto" },
        salida: { $sum: 0 }
      }
    },
    { $sort: { "_id.fechaDocumento": 1 } }
  ]);

  // Gastos previos
  const gastos = await CarteraGasto.aggregate([
    {
      $addFields: {
        fechaDate: { $toDate: "$fechaDocumento" }
      }
    },
    {
      $match: {
        claseMovimiento: { $in: clasesGastoPermitidas },
        tipoDocumento: 'GASTO',
        entradaSalida: 'E',
        fechaDate: { $lt: fechaInicio }
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
        path: "$clase",
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
        fechaDocumento: { $first: "$fechaDocumento" },
        comentario: { $first: "$descripcion" },
        ingreso: { $sum: 0 },
        salida: { $sum: "$monto" }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return { ingresos, gastos };
}
