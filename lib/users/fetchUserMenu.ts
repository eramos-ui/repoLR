export const fetchUserMenu = async (email: string, perfil: string, roleswkf: any[]) => {
    const query = new URLSearchParams({
      email,
      perfil,
      roles: JSON.stringify(roleswkf),
    });  
    // console.log('fetchUserMenu query',query.toString());
    const res = await fetch(`/api/user-menu?${query.toString()}`);

    if (!res.ok) throw new Error('Error al cargar el menú del usuario');
    const menu=await res.json();
    // console.log('fetchUserMenu menu',menu);
    return menu;
  };
  