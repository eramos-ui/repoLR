
  // Actualiza los campos generales del proyecto, excluyendo 'activities'

export const updateProjectGeneral = async (data: { idProject: number; [key: string]: any }) => {
    const res = await fetch('/api/projects/updateGeneral', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data), 
    });
  
    if (!res.ok) throw new Error('Error al actualizar los datos generales del proyecto');
    return await res.json();
  };
