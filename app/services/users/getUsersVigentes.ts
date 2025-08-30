
import  { User }   from '@/models/User';
import { ReturnDocument } from 'mongodb';

export const getUsersVigentes = async () => {
    const users= await User.aggregate([
      { $match: { valid: 'vigente' } }, // 🔹 Solo documentos donde isValid es true
      { $sort: { email: 1, createdAt: -1 } },
      { $group: { _id: "$email", doc: { $first: "$$ROOT" } } },
      { $replaceRoot: { newRoot: "$doc" } }
    ]);
    //console.log('en api service/etUsersVigentes',users.sort((a,b) => a.name.localeCompare(b.name)) )
    return users.sort((a,b) => a.name.localeCompare(b.name));
    //return users;;
  };
  