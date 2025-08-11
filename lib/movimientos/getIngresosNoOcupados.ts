import { CarteraIngreso } from '@/models/CarteraIngreso';
import { ClaseMovimiento } from '@/models/ClaseMovimiento';
import { DocIngreso } from '@/models/DocIngreso';
import { CarteraGasto } from '@/models/CarteraGasto';

export async function getIngresosNoOcupados(idOrganizacion: number) {
  const clases = await ClaseMovimiento.find({ idOrganizacion });
  const ingresosPagados = await CarteraIngreso.aggregate([//los ingresos que se han realizado
    {
      $match: {
        tipoDocumento: 'INGRESO',
        entradaSalida: 'S'
      }
    },
    {
      $group: {
        _id: {
          tipoDocumento: '$tipoDocumento',
          nroDocumento: '$nroDocumento',
          claseMovimiento: '$claseMovimiento',
          fechaDocumento: '$fechaDocumento'
        },
        monto: { $sum: '$monto' }
      }
    },
    {
      $match: {
        monto: { $gt: 0 }
      }
    }
  ]);
//    console.log('ingresosPagados',ingresosPagados.length) //(en SQL 1317 )

  
const ingresosPagadosConIngresoSalda=ingresosPagados.map(ingreso=>{
    const clase = clases.find(
      (c) => c.idClaseMovimiento === ingreso._id.claseMovimiento
    );
    return {
      ...ingreso,
      ingresoSalda: clase?.ingresoSalda
    };
  });
//   console.log('ingresosPagadosConIngresoSalda',ingresosPagadosConIngresoSalda.length)
  const gastosDesdeIngresoAgrupados:any[]=ingresosPagadosConIngresoSalda.map(ingreso=>{

  });

  const gastosDesdeIngreso= await CarteraGasto.aggregate([//ingresos que se han utilizado en CarteraGasto (en  SDQL 965)
    {
      $match: {
        tipoDocumento: 'INGRESO',
        entradaSalida: 'S'
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
          tipoDocumento: '$tipoDocumento',
          nroDocumento: '$nroDocumento',
          claseMovimientoIngresoSalda: '$claseInfo.ingresoSalda'
        },
        monto: { $sum: '$monto' }
      }
    }
  ]);
//   console.log('gastosDesdeIngreso',gastosDesdeIngreso.length)
  const result: any[] = [];
  for (const ingreso of ingresosPagados) {
       const tipoDocumento=ingreso._id.tipoDocumento;
       const nroDocumento=ingreso._id.nroDocumento;
       const fechaDocumento=ingreso._id.fechaDocumento;
       const claseMovimiento=ingreso._id.claseMovimiento;
       const monto=ingreso.monto;
       const gasto=gastosDesdeIngreso.find(g=>g._id.tipoDocumento===tipoDocumento && g._id.nroDocumento===nroDocumento 
        && g._id.claseMovimientoIngresoSalda === claseMovimiento);
        let saldo=0;
        if (!gasto){
            saldo=monto;
        }else{
            saldo=monto-gasto.monto;
        }
        if (saldo >0){

            const docIngreso={
                tipoDocumento: ingreso._id.tipoDocumento,
                nroDocumento: ingreso._id.nroDocumento,
                fechaDocumento,
                claseMovimiento: ingreso._id.claseMovimiento,
                monto: saldo,
              };   
              result.push(docIngreso);
        } //fin del if saldo >0

    } //fin del for
    // console.log('result',result.length);
    result.sort((a, b) => a.nroDocumento - b.nroDocumento);
    // let fila=1; const newResult=result.map(r=>{     return {...r, fila:fila++} });
    // console.log('result',newResult.filter(r=>r.fila > 300));
  return result;
}
