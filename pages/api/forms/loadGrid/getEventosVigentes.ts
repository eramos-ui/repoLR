// /pages/api/forms/loadGrid/getEventosVigentes.ts
//Para la grilla de mantención de form dinámico de eventos


import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { Evento } from '@/models/Evento';
import { fromDateUTCtoLocalDate } from '@/utils/fromDateUTCtoLocalDate';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectDB();
    try{
        const hoy = new Date();//UTC
        // console.log('hoy',hoy)
        //queries equivalentes
        // const eventosRaw= await Evento.aggregate([
        //     {
        //         $match: { 
        //             fechaEvento: { $gte: hoy},
        //         }
        //     }
        // ]);
        const eventosRaw= await Evento.find({
            fechaEvento:{ $gte: hoy }
        }); 
        const eventos=eventosRaw.map( evento =>{ //conversión de date a string
            return {
                id:evento._id,
                descripcion:evento.descripcion,
                ubicacion:evento.ubicacion,  
                fechaEvento:fromDateUTCtoLocalDate(evento.fechaEvento, true)
            }
        })
        // console.log(eventos,eventos)
        res.status(200).json(eventos);
    } catch (error) {
        console.error('Error obteniendo eventos:', error);
        res.status(500).json({ error: 'Error al obtener eventos' });
    }
}