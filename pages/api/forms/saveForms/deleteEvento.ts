// api/forms/saveForms/deleteEvento.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import { Evento } from '@/models/Evento';

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI as string);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // console.log('en deleteEvento')
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    await connectDB();

    const { id } = req.query; // si el _id viene como query param: /api/evento?id=...

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Debe proporcionar un ID válido' });
    }

    const deleted = await Evento.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    res.status(200).json({ message: 'Evento eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    res.status(500).json({ message: 'Error al eliminar evento' });
  }
}
