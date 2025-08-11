// /pages/api/forms/loadOptions/getTemas.ts
//Para agregar documento


import { connectDB } from '@/lib/db';
import { Tema } from '@/models/Tema';
import { NextApiRequest, NextApiResponse } from "next";



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        await connectDB();
        const temas = await Tema.find().lean();
        const opciones = temas.map((tema) => ({
            value: tema.idTema,
            label: tema.descripcion
          })).sort((a, b) => a.label.localeCompare(b.label));
        //   setYearsOptions(data.map((year: any) => ({ label:  String(year._id), value: Number(year._id) }))
        //   .sort((a: { value: number; }, b: { value: number; }) => b.value - a.value));
     // console.log('yearsOptions',data);
          res.status(200).json(opciones);
    } catch(error){
        return res.status(500).json({error: 'Error al obtener los temas'});
    }

}
