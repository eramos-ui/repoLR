//http://localhost:3000/api/forms/loadOptions/getFamilias
/* select en formulario de ingreso de documentos
*/
import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { Familia } from '@/models/Familia';
import { Casa } from '@/models/Casa';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectDB();
    try{
        const casas = await Casa.find({});
        const hoy = new Date();
        const mes = hoy.getMonth() + 1;
        const año = hoy.getFullYear();
        const añoMesActual = año * 100 + mes;
    
        const familias = await Familia.find({
            idFamilia: { $gt: 0 },
            mesInicio: { $lte: añoMesActual },
            mesTermino: { $gte: añoMesActual }
            }).lean();
        const familiasCasas =
            familias.map( familia => {
                const casa = casas.find(casa => casa.idCasa === familia.idCasa);
                const idFamilia = familia.idFamilia;
                const label = casa.codigoCasa + ' ' +familia.familia;
                return { value: idFamilia, label };
            })
        // console.log('familiasCasas',familiasCasas);   
        res.status(200).json(familiasCasas);
    } catch (error) {
        console.error('Error obteniendo familias:', error);
        res.status(500).json({ error: 'Error al obtener familias' });
    }
}