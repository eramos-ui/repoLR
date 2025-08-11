// /pages/api/forms/loadOptions/getRoles.ts
//Para la grilla de mantención de form dinámico de roles


import { connectDB } from '@/lib/db';
import { Rol } from '@/models/Rol';
import { NextApiRequest, NextApiResponse } from "next";



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        await connectDB();
        const roles = await Rol.find().lean();
        return res.status(200).json(roles);
    } catch(error){
        return res.status(500).json({error: 'Error al obtener los roles'});
    }

}
