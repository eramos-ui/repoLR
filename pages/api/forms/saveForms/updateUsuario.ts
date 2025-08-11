// /pages/api/forms/saveForms/updateUsuario.ts
/*
Aquí se graba el formulario dinámico de la coleción User de la BD 
*/
import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Rol } from '@/models/Rol';
import { getUserVigenteByEmail } from '@/app/services/users/getUserVigenteByEmail';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // console.log('en updateUsuario');
  await connectDB();

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { action,idUserModification, row, password } = JSON.parse(req.body);//sólo vienen estos 4 datos
    //console.log('en updateUsuario req.body',  action,idUserModification, row);
    // return res.status(500).json({ message: 'probando update usuario' });
   if (action ==='delete') {//Marca usurio como No vigente
      const id=row._id;
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      user.valid="no Vigente"
      await user.save();
      return res.status(200).json({ message: 'Usuario se actualiza como "No vigente"' });
   }

    const roles=await Rol.find();
    const rol=roles.find(r => Number(r.value) === Number(row.roleId));
    const role=rol?.label;//para grabar también role que es el label del rol
    // console.log('en updateUsuario  -role',role,row.roleId);    
    let idUser=0;
    let clave=password;

    const id=(row._id)?row._id: null;
    
    console.log('id',id)
    if (!id || id === null){
      // console.log('newUser') ;
      // console.log('verifica email no repetido', row.email)
      const userSameEmail = await getUserVigenteByEmail(row.email as string);
      try {
        if (userSameEmail) {
          // console.log('usuario repetido')
          return res.status(404).json({ message: `Error se encontró usuario con el mismo email ${userSameEmail.email}` });
        }
        type IdUserOnly = { idUser: number };//busca idUser
        const userMax = await User.findOne({}, 'idUser')
          .sort({ idUser: -1 })
          .lean<IdUserOnly | null>();
        //  console.log('userMax',userMax,typeof userMax, userMax?.idUser)
         if  (userMax)  idUser= userMax?.idUser;
        // res.status(200).json({ maxIdUser: userMax ? NumberuserMax.idUser : null });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el mayor idUser' });
      }
      // 🆕 INSERT: un nuevo usuario
      const newUser = new User({
        name:row.name,
        email:row.email,
        userModification:idUserModification,
        aditionalData:row.aditionalData,
        phone:row.phone,
        rut:row.rut,
        role:role,
        roleId:row.roleId,
        // Campos adicionales requeridos
        user: row.email,                      // por ejemplo, usar email como user si no se define
        password,         // ⚠️ reemplazar luego por un flujo real de password
        // theme: 'light',
        system: 'repositorio',                 // por defecto, si aplica
        valid: 'vigente',
        validDate: new Date(),
        // avatar: '',                      // opcional
        roleswkf: [],
        idUser,
      });
        try{
          await newUser.save();
          return res.status(201).json({ message: 'Usuario actualizado', user: newUser.name });         
        }catch(error){
          console.log(error);
          return res.status(500).json({ message: 'Error al grabar nuevo usuario' });
        }
    }else {//User ya existe    
      const user = await User.findById(id);
      // console.log('busca usuario existente', user)
        // 🔁 UPDATE parcial
        const actualizaUser= new User({
          name:row.name,
          email:row.email,
          userModification:idUserModification,
          aditionalData:row.aditionalData,
          phone:row.phone,
          rut:row.rut,
          role:role,
          roleId:row.roleId,
          user:row.email,
          password:user.password,
          valid:'vigente',
          system:'repositorio',
          roleswkf: [],
          idUser:user.idUser,
        });
        // console.log('actualizaUser',actualizaUser)
        try{
          await actualizaUser.save();
          return res.status(201).json({ message: 'Usuario actualizado', user: actualizaUser.name });      
        
        }catch(error){
          console.log(error);
          return res.status(500).json({ message: 'Error al grabar nuevo usuario que existía' });
        }
    }
}
