import { connectDB } from '@/lib/db';
import { NextApiRequest, NextApiResponse } from "next";
import { addUserVersion } from '@/app/services/users/addUserVersion';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  await connectDB();
  const user = await addUserVersion(req.body);
  res.status(200).json(user);
}
