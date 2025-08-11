const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000';
//api/tasks/by-activity?email=admin@gmail.com&idActivity=1&roles=[{"idProcess":1,"idActivity":1}]

export const getTasksByActivity = async (
    email: string,
    idActivity: number,
    roleswkf: { idProcess: number; idActivity: number }[],
    idProcess?: number, 
  ) => {
    const query = new URLSearchParams({
      email,
      idActivity: String(idActivity),
      roles: JSON.stringify(roleswkf),
    });  
    if (idProcess !== undefined) {
      query.append('idProcess', String(idProcess));
    }
    //console.log('en processEngine-getTasksByActivity email,idActivity,idProcess',email,idActivity,idProcess,roleswkf);
    // console.log('en processEngine fetchTasksByActivity query',`/api/tasks/by-activity?${query.toString()}`);
    const res = await fetch(`${baseUrl}/api/tasks/by-activity?${query.toString()}`);  
    if (!res.ok) {
      console.log('error en processEngine-getTasksByActivity res',res);
      throw new Error('Error al obtener tareas de la actividad');
    } 
    return await res.json();
  };