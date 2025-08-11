import { connectDB } from '@/lib/db';
import { NextApiRequest, NextApiResponse } from "next";
import { getUsersVigentes } from '@/app/services/users/getUsersVigentes';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const users = await getUsersVigentes();
  res.status(200).json(users);
}
