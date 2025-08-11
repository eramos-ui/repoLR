export const getTasksByUser = async (email: string, roleswkf: { idProcess: number; idActivity: number }[]) => {
    const query = new URLSearchParams({
      email,
      roles: JSON.stringify(roleswkf),
    });
  
    const res = await fetch(`/api/tasks?${query.toString()}`);
  
    if (!res.ok) {
      throw new Error('Error al obtener las tareas');
    }
  
    return await res.json();
  };