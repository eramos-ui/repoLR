// /app/services/users/getUsersByPerfil.ts

const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000';
export const getUsersByPerfilForOptions = async (perfil: string) => {
    // const res = await fetch(`${baseUrl}/api/users/byPerfil?perfil=${encodeURIComponent(perfil)}`);
    const res = await fetch(`${baseUrl}/api/users/byPerfil?role=${perfil}`);
    // console.log('getUsersByPerfilForOptions',perfil);
    if (!res.ok) {
      console.log('error en getUsersByPerfilForOptions res',res);
      return [];
    }
    // Transformar a OptionsSelect
    const usuarios=await res.json();
      // console.log('usuarios',usuarios);
    const options = usuarios.map((u:any) => ({
      value: u._id?.toString(),
      label: `${u.name} (${u.user})`
    }));
    // console.log('options',options);
    return options;
  };
  