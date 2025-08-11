// export const fetchTasksByUser = async (email: string, roleswkf: { idProcess: number; idActivity: number }[]) => {
//     const query = new URLSearchParams({
//       email,
//       roles: JSON.stringify(roleswkf),
//     });
  
//     const res = await fetch(`/api/tasks?${query.toString()}`);
  
//     if (!res.ok) {
//       throw new Error('Error al obtener las tareas');
//     }
  
//     return await res.json();
//   };
  
  // export const fetchTasksByActivity = async (
  //   email: string,
  //   idActivity: number,
  //   roleswkf: { idProcess: number; idActivity: number }[],
  //   idProcess?: number,
 
  // ) => {
  //   const query = new URLSearchParams({
  //     email,
  //     idActivity: String(idActivity),
  //     roles: JSON.stringify(roleswkf),
  //   });  
  //   if (idProcess !== undefined) {
  //     query.append('idProcess', String(idProcess));
  //   }
  //   console.log('en fetchTasksByActivity email,idActivity,idProcess',email,idActivity,idProcess);
  //   //  console.log('en fetchTasksByActivity query',`/api/tasks/by-activity?${query.toString()}`);
  //   const res = await fetch(`/api/tasks/by-activity?${query.toString()}`);  
  //   if (!res.ok) {
  //     throw new Error('Error al obtener tareas de la actividad');
  //   } 
  //   return await res.json();
  // };