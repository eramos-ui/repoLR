import { CarteraIngreso } from "@/models/CarteraIngreso"; // Asegúrate de tener el modelo definido
import { Types } from "mongoose";

interface SaldoDeuda {
  tipoDocumentoRef: string;
  nroDocumentoRef: number;
  idCasa: number;
  claseMovimiento: number;
  mesPago: number;
  saldo: number;
}

export async function getSaldoCasaFondo(
  idCasa?: number,
  claseMovimiento?: number
): Promise<SaldoDeuda[]> {
  const pipeline: any[] = [
    {
      $match: {//where
    
         ...(idCasa !== undefined && { idCasa }),
        ...(claseMovimiento !== undefined && { claseMovimiento }),
      },
    },
    {
      $group: {
        _id: {
          tipoDocumentoRef: "$tipoDocumentoRef",
          nroDocumentoRef: "$nroDocumentoRef",
          idCasa: "$idCasa",
          claseMovimiento: "$claseMovimiento",
          mesPago: "$mesPago",
        },
        saldo: {
          $sum: {
            $cond: [
              { $eq: ["$entradaSalida", "E"] },
              "$monto",
              { $multiply: ["$monto", -1] },
            ],
          },
        },
      },
    },
    {
      $match: {
        saldo: { $gt: 0 }, // solo deudas
      },
    },
    {
      $sort: {
        "_id.mesPago": 1,
        "_id.claseMovimiento": 1,
      },
    },
  ];
  const resultados = await CarteraIngreso.aggregate(pipeline);
  // console.log('resultados',resultados)

  // Reformatear salida
  return resultados.map((r) => ({
    tipoDocumentoRef: r._id.tipoDocumentoRef,
    nroDocumentoRef: r._id.nroDocumentoRef,
    idCasa: r._id.idCasa,
    claseMovimiento: r._id.claseMovimiento,
    mesPago: r._id.mesPago,
    saldo: r.saldo,
  }));
}
