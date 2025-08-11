import _ from 'lodash';
import  { getUserVigenteByEmail }  from "./getUserVigenteByEmail";
import { User } from "@/models/User";

export const addUserVersion = async (userData: any) => {
   console.log('en addUserVersion userData',userData);
    try {
      const email = userData.email;
      // console.log('en addUserVersion email',email);
        const vigente = await getUserVigenteByEmail(email);        
        // Excluir campos "meta" del documento vigente
        const {
          createdAt,
          updatedAt,
          __v,
          _id,
          userModification,
          aditionalData,
          resetToken,
          resetTokenExpires,
          roleswkf,
          ...prev
        } = vigente?.toObject() || {};
        // console.log('en addUserVersion prev',prev);
        // Excluir los mismos campos de userData (por si vienen desde el cliente)
        const {
          createdAt: _c1,
          updatedAt: _c2,
          __v: _c3,
          _id: _c4,
          userModification: _c5,
          aditionalData: _c8,
          resetToken: _c6,
          resetTokenExpires: _c7,
          roleswkf: _c9,
          ...current
        } = userData;
        // console.log('en addUserVersion current',current);
        
        // Mostrar claves que existen en ambos pero con valores distintos
        /*
        console.log("🔍 Comparando prev y current:");
        for (const key in prev) {
          if (!_.isEqual(prev[key], current[key])) {
            console.log(`🔸 Diferencia en '${key}': prev=${JSON.stringify(prev[key])} | current=${JSON.stringify(current[key])}`);
          }
        }

        // Mostrar claves que están en current pero no en prev
        for (const key in current) {
          if (!(key in prev)) {
            console.log(`➕ Campo adicional en current: '${key}' = ${JSON.stringify(current[key])}`);
          }
        }

        // Mostrar claves que están en prev pero no en current
        for (const key in prev) {
          if (!(key in current)) {
            console.log(`➖ Campo faltante en current: '${key}' (prev tenía ${JSON.stringify(prev[key])})`);
          }
        }
          */
        if (_.isEqual(prev, current)) 
          {
            console.log('en addUserVersion prev y current son iguales');
            return vigente;
          }
        else
          {
            console.log('en addUserVersion prev y current son diferentes');
            const { _id, createdAt, updatedAt, __v, ...cleanData } = userData;
            return await User.create(cleanData);
          }
    } catch (error) {
        console.error('Error en addUserVersion',error);
        throw error;
    }
  };