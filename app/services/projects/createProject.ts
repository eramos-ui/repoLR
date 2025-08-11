export const createProject = async (projectData: any) => {
    const res = await fetch('/api/projects/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData),
    });
  
    if (!res.ok) throw new Error('Error al crear el proyecto');
    return await res.json();
  };