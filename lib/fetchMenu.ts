// lib/fetchMenu.ts
export const fetchMenu = async () => {
    const res = await fetch('/api/menu');
    if (!res.ok) {
      throw new Error('No se pudo obtener el menú');
    }
    return await res.json();
  };
  