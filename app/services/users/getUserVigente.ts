import _ from 'lodash';
// import  { User }   from '@/models/User';
const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000';
export const getUserVigente = async (id: string) => {
  // console.log('En getUserVigente id:', id);
  const res = await fetch(`${baseUrl}/api/usuarios/${id}`);
  const user = await res.json();
  return user;
};