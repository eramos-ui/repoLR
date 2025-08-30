// /pages/api/forms/saveForms/updateEvento.ts
/*
Aquí se graba el formulario dinámico de la coleción Evento de la BD 
*/
import { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { Evento } from '@/models/Evento';
import { chileLocalToUTC} from '@/utils/timeChile';


  
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('en updateEvento')
  

  if (req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const {    row, idUserModification,action } =  JSON.parse(JSON.stringify(req.body));

     console.log('en updateEvento row, idUserModification,action',row, idUserModification,action);
    //  return res.status(500).json({ message: 'Evento NO creado'});  
    // NO tiene update y el DELETE esta en otro m+etodo
      const fechaEvento=row.fechaEvento;
      const descripcion=row.descripcion;
      const ubicacion=row.ubicacion;
      try{
        await connectDB();
        const id = (row.id as string) || (row?.id as string | undefined);                 

        const update: Record<string, any> = {};
        if (typeof ubicacion === 'string') update.ubicacion = ubicacion;
        if (typeof descripcion === 'string') update.descripcion = descripcion;
    
        if (typeof fechaEvento === 'string' && fechaEvento.trim()) {
          // Soporta "dd-MM-yyyy" o "dd-MM-yyyy HH:mm" y también “..., 20:30 hrs.”
          update.fechaEvento = chileLocalToUTC(fechaEvento);
        } else if (fechaEvento instanceof Date) {
          update.fechaEvento = fechaEvento; // asumimos ya está en UTC
        }

        // preparar $set y $setOnInsert SIN solapar campos
        const setOnInsert: Record<string, any> = {};
        if (!('ubicacion' in update)) setOnInsert.ubicacion = '';
        if (!('descripcion' in update)) setOnInsert.descripcion = '';
        // si quieres createdAt al insertar:
        setOnInsert.createdAt = new Date();

        const updateDoc: any = { $set: update };
        if (Object.keys(setOnInsert).length) {
          updateDoc.$setOnInsert = setOnInsert;
        }
        // upsert por _id (update si existe, insert si no)
        // Si viene id válido -> upsert por _id (actualiza si existe, crea si no)
        if (id && mongoose.isValidObjectId(id)) {
          console.log('actualización',update)
          const updated = await Evento.findOneAndUpdate(
            { _id: id },            // o tu filtro
            updateDoc,
            {
              new: true,
              upsert: true,         // inserta si no existe
              runValidators: true,
              setDefaultsOnInsert: true,
            }
          );
          // Determinar si fue insert o update mirando isNew no es fiable aquí.
          // Podemos verificar existencia previa con una consulta previa si necesitas distinguir.
          return res.status(200).json({
            message: 'Evento guardado (upsert por id)',
            evento: updated,
          });
        }
        // Si NO viene id: creamos un nuevo documento
        if (!update.fechaEvento || !update.ubicacion || !update.descripcion) {
          return res.status(400).json({ message: 'Faltan campos requeridos para crear: fechaEvento, ubicacion, descripcion' });
        }
        console.log('creación', update)
        const created = await Evento.create(update);
        return res.status(201).json({ message: 'Evento creado', evento: created });

      } catch (err) {
        console.error('Error en upsert de evento:', err);
        return res.status(500).json({ message: 'Error al guardar evento' });
      }
}



      //   // 🆕 INSERT: completar campos faltantes
      //   const newEvento = new Evento({
      //       descripcion,
      //       ubicacion,
      //       fechaEvento:fechaUTC,
      //       userModification:idUserModification,
            
      //   });
      //   console.log('newEvento',newEvento)
      //   await newEvento.save();
      //   return res.status(201).json({ message: 'Evento creado', evento: newEvento });
  
    
      // } catch (error) {
      // console.error('Error en updateUsuario:', error);
      // return res.status(500).json({ message: 'Error interno', error });
  //}
//}
