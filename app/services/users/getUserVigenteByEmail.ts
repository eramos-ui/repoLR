//servicio consumido por: /api/usuarios/vigenteByEmail
import { User } from "@/models/User";

export const getUserVigenteByEmail = async (email: string) => {
    // console.log('en getUserVigenteByEmail email',typeof email,email);
    const usuarios=await User.find({email: email});
    // const usuarios=await User.find();
    // console.log('en getUserVigenteByEmail usuarios',usuarios);
    const user = await User.findOne({ user: email, valid:'vigente' }).sort({ createdAt: -1 });
    //console.log('en getUserVigenteByEmail user',user);
    return user;
};