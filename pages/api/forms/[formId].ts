// /pages/api/forms/[formId].ts
/*
Aquí carga el formulario dinámico desde la BD Form
*/
import type { NextApiRequest, NextApiResponse } from 'next';
import { Form } from '@/models/Form'; // Asegúrate de que esta ruta sea correcta

import { connectDB } from '@/lib/db'; // Ajusta a tu conexión Mongo

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const { formId } = req.query;
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }  
  if (!formId || Array.isArray(formId)) {
    return res.status(400).json({ message: 'ID inválido' });
  }
  
  //console.log('...en api forms/[formId]',formId);

  try {
    // const forms=await Form.find({});

    // console.log('...en api forms forms',formId);
    const form = await Form.findOne({ formId: parseInt(formId,10)});
    // const form = await Form.findOne({ formId: 1006});
    // console.log('...en api forms form',form);
    if (!form) {
      return res.status(404).json({ message: 'Formulario no encontrado o no válido' });
    }
    // console.log('en api forms [formId]',form.jsonForm);
    
    return res.status(200).json(form.jsonForm);
  } catch (error) {
    console.error('Error al obtener formulario:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}
