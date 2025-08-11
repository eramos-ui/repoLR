import { User } from "@/models/User";

export const getUserVigenteById = async (id: string) => {
    console.log('en getUserVigenteById id',id);
    return await User.findOne({ _id: id }).sort({ createdAt: -1 });
  };