 // 📌 Función para calcular el siguiente ID de actividad en la jerarquía padre-hijo-nieto
 export const getNextActivityId = (currentId: string | number, existingIds: Set<string>) => {
    if (!currentId) {
      // console.error("**currentId es inválido:", typeof currentId); 
      return "1"; // Retornar un valor por defecto si el ID es null o undefined
    }
  
    // Convertimos a string por si viene como número
    let idStr = String(currentId);
  
    // Dividimos en niveles
    const parts = idStr.split(".");
    const lastIndex = parts.length - 1;
  
    let newId: string;
    let counter = parseInt(parts[lastIndex], 10);
  
    do {
      counter += 1;
      parts[lastIndex] = counter.toString();
      newId = parts.join(".");
    } while (existingIds.has(newId)); // Si el ID ya existe, intentamos el siguiente
  
    return newId;
  };
  