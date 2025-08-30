// api/forms/deleteForms/deleteUsuario
/*
Aquí seelimina User de la BD
*/
import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { getUserVigenteById } from '@/app/services/users/getUserVigenteById';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // console.log('en deleteUsuario');
    await connectDB();
  
    if (req.method !== 'DELETE') {
      return res.status(405).json({ message: 'Método no permitido' });
    }
    const {  idUserModification, row } = req.body;
    //  console.log('en deleteUsuario req.body', idUserModification, row);
    // return res.status(400).json({ message: 'Probando' });
    const id=row._id;
      //  const user = await User.findById(id);
      const user = await getUserVigenteById(id);
      if (!user) {
          return res.status(404).json({ message: 'Usuario no encontrado' });
      }
        user.isValid=false;
        user.valid="no Vigente";
        user.userModification=idUserModification;
        try{
          await user.save();
          return res.status(200).json({ message: 'Usuario eliminado' });
        }catch(error){
          console.log(error);
          return res.status(500).json({ message: 'Error al grabar usuario que se quería eliminar' });
        }
 
}  