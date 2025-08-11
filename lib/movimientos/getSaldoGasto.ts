import { CarteraGasto } from '@/models/CarteraGasto';

export async function getSaldoGasto(idOrganizacion:number) {
    const resultado = await CarteraGasto.aggregate([
        {
            $match: {
              entradaSalida: "E"
            }
          },
            {
            $lookup: {
              from: "claseMovimiento",
              localField: "claseMovimiento",
              foreignField: "idClaseMovimiento",
              as: "claseInfo"
            }
          },
          { $unwind: "$claseInfo" },
          {
            $group: {
              _id: {
                tipoDocumento: "$tipoDocumentoRef",
                nroDocumento: "$nroDocumentoRef",
                claseMovimiento: "$claseMovimiento",
                descripcion: "$claseInfo.descripcion"
              },
              saldo: {
                $sum: {
                  $cond: [
                    { $eq: ["$entradaSalida", "E"] },
                    "$monto",
                    { $multiply: ["$monto", -1] }
                  ]
                }
              }
            }
          },
          {
            $match: {
              saldo: { $gt: 0 }
            }
          },
      {
        $project: {
          tipoDocumentoRef: '$_id.tipoDocumento',
          nroDocumentoRef: '$_id.nroDocumento',
          claseMovimiento: '$_id.claseMovimiento',
          descripcion: '$_id.descripcion',
          ingresoSalda: '$info.ingresoSalda',
          saldo: 1,
          _id: 0
        }
       }
    ]);
    // console.log('en getSaldoGasto resultado',resultado.length)
    // console.log('en getSaldoGasto resultado[0]',resultado[0])
    // console.log('en getSaldoGasto resultado[1]',resultado[1])
    return resultado;
  }