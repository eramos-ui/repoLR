// pages/api/forms/loadGrid/getUltimosAportes.ts
/* Explicación del use de find o findOne (JavaScript) o aggregate de MongoDB (como getUltimosGastos)
Objetivo	Mejor opción
Obtener 1 documento sin transformación	findOne()
Obtener muchos sin lógica extra	find()
Agrupar, sumar, ordenar, transformar	aggregate()
Unir con otra colección	aggregate() + $lookup
*/
import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { DocIngreso } from '@/models/DocIngreso';
import { Familia } from '@/models/Familia';
import { Casa } from '@/models/Casa';

const  formatDateToDDMMYYYY =(date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // los meses empiezan en 0
  const year = date.getFullYear();
//    console.log('en formatDateToDDMMYYYY', `${day}-${month}-${year}`)
  return `${day}-${month}-${year}`; 
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectDB();
    
    const hoy = new Date();
    const mes = hoy.getMonth() + 1;
    const año = hoy.getFullYear();
    const añoMesActual = año * 100 + mes;

    try{
        const casas = await Casa.find({});
        const familias = await Familia.find({ //devuelve un array? y findOne no anda
            mesInicio: { $lte: añoMesActual },
            mesTermino: { $gte: añoMesActual }
            }).lean();
        const ultimosIngresos = await DocIngreso.find({})
        .sort({ createAt: -1 })
        .limit(20)
        .lean();
 
        const ingresosConFamilia = await Promise.all(
         ultimosIngresos.map(async (ingreso) => {
            const familiaIngreso = familias.find(familia => familia.idCasa === ingreso.idCasa);
            const idCasa = ingreso.idCasa;
            const casaIngreso = casas.find(casa => casa.idCasa === idCasa);
            const codigoCasa = casaIngreso?.codigoCasa;
            const idFamilia = familiaIngreso?.idFamilia;
            const nombreFamilia = familiaIngreso?.familia;
            // console.log('familiaIngreso',familiaIngreso,idFamilia,nombreFamilia);
            const dateObj = new Date(ingreso.createAt); 
            return {
                ...ingreso,
                fechaDocumento: formatDateToDDMMYYYY(dateObj),
                familia: nombreFamilia,
                idFamilia: idFamilia,
                codigoCasa: codigoCasa
              };
            })
          );
        res.status(200).json(ingresosConFamilia);
    } catch (error) {
      console.error('Error obteniendo documentos:', error);
      res.status(500).json({ error: 'Error al obtener documentos' });
    }
}
