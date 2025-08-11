import { CarteraIngreso } from '@/models/CarteraIngreso';
import { CarteraGasto } from '@/models/CarteraGasto';
import { User } from '@/models/User';

const claseMovimientoMap = {
    GASTO_EMERGENCIA: [99],
    GASTO_NORMAL: Array.from({ length: 98 }, (_, i) => i + 1), // 1 al 98
    GASTO_TODOS: Array.from({ length: 99 }, (_, i) => i + 1),
  };


  export async function getMovimientosPeriodo(
    email: string,
    fechaInicio: Date,
    fechaFin: Date,
    tipoFondo: string,  
    // idCasa:string  
  ) 
  {  
    const claseMovimiento =  'GASTO_'+tipoFondo;
    const clasesGastoPermitidas = claseMovimientoMap[claseMovimiento as keyof typeof claseMovimientoMap] || [];
    // Paso 1: obtener organización del usuario
    const usuario = await User.findOne({ email,vigente: true });
    // console.log('en getMovimientosPeriodo',email, fechaInicio, fechaFin, tipoFondo, idCasa);
    const idOrganizacion = usuario?.idOrganizacion;
    const clasesIngresoPermitidas= tipoFondo === 'NORMAL' ? [1000] : [1001];
    const fechaInicioDate = new Date(fechaInicio?.toString() || '');
    const fechaFinDate = new Date(fechaFin?.toString() || '');
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
        fechaDate: { $gte: fechaInicio, $lte: fechaFin },
        // idCasa: { $in: [0, idCasa] }
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
          idCasa: "$idCasa"
        },
        comentario: { $first: { $concat: ["Casa ", { $toString: "$casa.codigoCasa" }, ", ", "$familia.familia"] } },
        fechaDocumento: { $first: "$fechaDocumento" },
        ingreso: { $sum: "$monto" },
        salida: { $sum: 0 }
      }
    },
    { $sort: { "_id.fechaDocumento": 1 } }
  ]);
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
        fechaDate: { $gte: fechaInicio, $lte: fechaFin }
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
          comentario: "$descripcion"
        },
        comentario: { $first: "$descripcion" },
        fechaDocumento: { $first: "$fechaDocumento" },
        ingreso: { $sum: 0 },
        salida: { $sum: "$monto" }
      }
    },
    { $sort: { "_id.fechaDocumento": 1 } }
  ]);

  return { ingresos, gastos };
}
