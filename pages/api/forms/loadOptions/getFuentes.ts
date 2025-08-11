// /pages/api/forms/loadOptions/getFuentes.ts
//Para agregar documento


import { connectDB } from '@/lib/db';
import { Fuente } from '@/models/Fuente';
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        await connectDB();
        const fuentes = await Fuente.find().lean();
        const opciones = fuentes.map((fuente) => ({
            value: fuente.idFuente,
            label: fuente.descripcion
        }));
        //const cards=data.sort((a:Card, b:Card) => (a.orden ?? 0) - (b.orden ?? 0));
        // console.log('fuentes',opciones)
        res.status(200).json(opciones);
    } catch(error){
        return res.status(500).json({error: 'Error al obtener las fuentes'});
    }
}
