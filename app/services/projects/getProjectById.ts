

export const getProjectById = async (idProject: number) => { 
    const res = await fetch(`/api/projects/${idProject}`);
    if (!res.ok) throw new Error('Error al obtener el proyecto');
    return await res.json();
  };