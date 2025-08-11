// pages/api/carteraIngreso/years.ts
import { connectDB } from '@/lib/db';
import { CarteraIngreso } from '@/models/CarteraIngreso';
import { NextApiRequest, NextApiResponse } from 'next';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectDB();

    const result=await CarteraIngreso.aggregate([
        {
        $project: {
            anio: { $floor: { $divide: ["$mesPago", 100] } }
        }
        },
        {
        $group: {
            _id: "$anio"
        }
        },
        {
        $sort: {
            _id: 1
        }
        }
    ]);

  res.status(200).json(result);
}