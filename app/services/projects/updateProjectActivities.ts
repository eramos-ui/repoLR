// Actualiza el array 'activities' del proyecto
export const updateProjectActivities = async (data: { idProject: number; activities: any[] }) => {
    const res = await fetch('/api/projects/updateActivities', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  
    if (!res.ok) throw new Error('Error al actualizar las actividades del proyecto');
    return await res.json();
  };
  