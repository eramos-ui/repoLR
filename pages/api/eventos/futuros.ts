// api/eventos/futuros.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { Evento } from '@/models/Evento'; // Ajusta la ruta según tu estructura
// Función para formatear fecha y hora
const formatDateTime = (date: Date) => {
  const opciones: Intl.DateTimeFormatOptions = {
    timeZone: 'America/Santiago',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };

  // El formateo por defecto de Intl.DateTimeFormat en es-CL agrega un espacio raro, lo limpiamos
  const partes = new Intl.DateTimeFormat('es-CL', opciones).formatToParts(date);
  const dia = partes.find(p => p.type === 'day')?.value;
  const mes = partes.find(p => p.type === 'month')?.value;
  const anio = partes.find(p => p.type === 'year')?.value;
  const hora = partes.find(p => p.type === 'hour')?.value;
  const minuto = partes.find(p => p.type === 'minute')?.value;

  return `${dia}/${mes}/${anio} ${hora?.padStart(2, '0')}:${minuto?.padStart(2, '0')}`;
};
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    await connectDB();

    // Obtener el inicio del día de hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Buscar eventos con fecha >= hoy
    const eventos = await Evento.find({
      fechaEvento: { $gte: hoy }
    }).sort({ fechaEvento: 1 }); // Ordena por fecha ascendente
    // Formatear fecha y hora de cada evento
    const eventosFormateados = eventos.map(evento => ({
      ...evento.toObject(),
      fechaEvento: formatDateTime(new Date(evento.fechaEvento))
    }));
    res.status(200).json({ eventos:eventosFormateados });
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({ message: 'Error al obtener eventos' });
  }
}
