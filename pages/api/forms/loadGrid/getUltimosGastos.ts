// pages/api/forms/loadGrid/getUltimosGastos.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { DocGasto } from '@/models/DocGasto';

const  formatDateToDDMMYYYY =(date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // los meses empiezan en 0
  const year = date.getFullYear();
  // console.log('en formatDateToDDMMYYYY', `${day}-${month}-${year}`)
  return `${day}-${month}-${year}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();

    const docs = await DocGasto.aggregate([
      { $sort: { createAt: -1 } },
      { $limit: 20 },
      {
        $addFields: {
          fechaDate: { $toDate: "$createAt" }
        }
      },
      {
        $addFields: {
          nroGasto: { $toString: "$nroDocumento" }
        }
      },
      // {
      //   $addFields: {
      //     key: { $toString: "$nroDocumento" }
      //   }
      // },
      {
        $lookup: {
          from: 'claseMovimiento',
          localField: 'claseMovimiento',
          foreignField: 'idClaseMovimiento',
          as: 'clase'
        }
      },
      { $unwind: '$clase' }, // para obtener solo un objeto en vez de array
      {
        $project: {
          _id: 0,
          //key: 1,
          tipoDocumento: 1,
          nroGasto: 1,
          idCasa: 1,
          idUsuario: 1,
          mesPago: 1,
          monto: 1,
          comentario: 1, 
          fechaDate: 1,
          descripcion: "$clase.descripcion"
        }
      }
    ]);
    const formattedDocs = docs.map(doc => {
      const dateObj = new Date(doc.fechaDate); // 👈 Conversión necesaria
      return {
        ...doc,
        nroDocumento: doc.nroGasto,
        fechaDocumento: formatDateToDDMMYYYY(dateObj),
      };
    });
    res.status(200).json(formattedDocs);
  } catch (error) {
    console.error('Error obteniendo documentos:', error);
    res.status(500).json({ error: 'Error al obtener documentos' });
  }
}
