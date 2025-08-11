
//Utilizado en activity/administrarActivity/page.tsx y busca una tarea por usuario por idTask y email y revisa si es specificUser
export const getTaskByUser = async (idTask: number, email: string) => {
    const res = await fetch(`/api/tasks/by-task-user?idTask=${idTask}&email=${encodeURIComponent(email)}`);
  
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Error al obtener la tarea');
    }  
    return res.json(); // Devuelve el objeto Task
  };
  