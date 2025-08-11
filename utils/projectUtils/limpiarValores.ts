export const limpiarValoresInvalidos = (obj: any): any => {
  for (const key in obj) {
    const valor = obj[key];

    if (typeof window !== 'undefined' && valor instanceof File) {
      continue; // 🔐 no tocar archivos
    }

    if (valor !== null && typeof valor === 'object') {
      if (Object.keys(valor).length === 0) {
        obj[key] = null; // objeto vacío real
      } else if (!Array.isArray(valor)) {
        obj[key] = limpiarValoresInvalidos(valor); // recursividad
      }
    }
  }

  return obj;
};



  // export const limpiarValoresInvalidos = (obj: any): any => {
  //   // console.log('limpiarValoresInvalidos',obj);
  //   for (const key in obj) {
  //       // console.log('limpiarValoresInvalidos 1...',key,obj[key]);
  //     if (obj[key] !== null && typeof obj[key] === 'object' && Object.keys(obj[key]).length === 0) {
  //       obj[key] = null; // o "" si el campo es string obligatorio
  //     } else if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
  //       // console.log('limpiarValoresInvalidos 2...',key,obj[key]);
  //       obj[key] = limpiarValoresInvalidos(obj[key]); // Recursivo para objetos anidados
  //     }
  //   }
  //   return obj;
  // }