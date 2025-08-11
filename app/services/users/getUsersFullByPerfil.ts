const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000';

export const getUsersFullByPerfil = async (perfil: string) => {
  //  console.log('en getUsersFullByPerfil perfil',perfil);
    const res = await fetch(`${baseUrl}/api/users/byPerfil?role=${encodeURIComponent(perfil)}`);
    if (!res.ok) throw new Error('Error al obtener usuarios por perfil');  
  
    return res.json();
  };
  