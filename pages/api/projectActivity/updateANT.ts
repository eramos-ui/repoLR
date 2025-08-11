import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { ProjectActivity } from '@/models/ProjectActivity';
import { IProjectActivity } from '@/types/IProjectActivity';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método no permitido. Usa PUT.' });
  }

  const {
    idProjectActivity,
    idActivity,
    numActividad,
    actividad,
    fechaInicio,
    fechaTermino,
    duracion,
    presupuesto,
    usuarioModificacion,
    idProject,
    idProcessInstance,
    userResponsable,
    formaEjecucion,
    userEjecutor
  } = req.body;

  if (!idProjectActivity) {
    return res.status(400).json({ error: 'idProjectActivity es obligatorio.' });
  }
  console.log('en updateProjectActivity',idProjectActivity,idActivity,numActividad,actividad,fechaInicio,fechaTermino,duracion,
    presupuesto,usuarioModificacion,idProject,idProcessInstance,userResponsable,formaEjecucion,userEjecutor);
  try {
    await connectDB();

    const updated = await ProjectActivity.updateOne(
      { idProjectActivity: Number(idProjectActivity) },
      {
        $set: {
          ...(idActivity !== undefined && { idActivity }),//spread operator (...) + expresiones lógicas. Si idActivity no es undefined, entonces crea el objeto {idActivity} → {idActivity: valor          ...(numActividad && { numActividad } 
          ...(actividad && { actividad }),
          ...(fechaInicio && { fechaInicio }),
          ...(fechaTermino && { fechaTermino }),
          ...(duracion !== undefined && { duracion }),
          ...(presupuesto !== undefined && { presupuesto }),
          ...(usuarioModificacion && { usuarioModificacion }),
          ...(idProject && { idProject }),
          ...(idProcessInstance && { idProcessInstance }),
          ...(userResponsable && { userResponsable }),
          ...(formaEjecucion && { formaEjecucion }),
          ...(userEjecutor && { userEjecutor })
        }
      },{ 
        returnDocument: 'after',// para que devuelve el nuevo documento actualizado 
        lean: true//updated devuelve{acknowledged: true, modifiedCount: 1, upsertedId: null, upsertedCount: 0, matchedCount: 1 }
       }
    ).exec();

    if (!updated) {
      return res.status(404).json({ error: 'No se encontró la actividad a actualizar.' });
    }
    return res.status(200).json(updated as unknown as IProjectActivity);
  } catch (error) {
    console.error('❌ Error en la actualización de ProjectActivity:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
