// /pages/api/forms/loadGrid/getUsuariosVigentes.ts
//Para la grilla de mantención de form dinámico de usuarios

import { connectDB } from '@/lib/db';
import { NextApiRequest, NextApiResponse } from "next";
import { getUsersVigentes } from '@/app/services/users/getUsersVigentes';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectDB();
    const users = await getUsersVigentes();
    // console.log('en api forms/loadGrid/getUsuariosVigentes',users);
    res.status(200).json(users);
}
