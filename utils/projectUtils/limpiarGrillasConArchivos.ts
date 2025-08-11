export const limpiarGrillasConArchivos = (project: any) => {
  const limpiarGrilla = (grilla: any[], campos: string[]) =>
    grilla.map((fila) => {
      const nuevaFila = { ...fila };
      for (const campo of campos) {
        const valor = nuevaFila[campo];
        // console.log('en limpiarGrillasConArchivos valor y otros',campo ,valor, typeof valor, (valor instanceof File),(typeof window !== 'undefined'));
        if (typeof valor === 'string') {
          continue; // ya está bien
        }

        // Si es un File, reemplazar con su nombre
        if (typeof window !== 'undefined' && valor instanceof File) {
          nuevaFila[campo] = valor.name;
        } else if (typeof window !== 'undefined' && typeof valor === 'object' && valor !== null) {
          //console.log('en limpiarGrillasConArchivos name',campo ,valor.name);
          nuevaFila[campo] = valor.name;
        } 
        else {
          // Si es un objeto vacío o no válido, dejar "No subido"
          nuevaFila[campo] = 'No subido';
        }
      }
      return nuevaFila;
    });
// console.log('en limpiarGrillasConArchivos project.empalmesGrid',project.empalmesGrid);
  if (Array.isArray(project.empalmesGrid)) {
    project.empalmesGrid = limpiarGrilla(project.empalmesGrid, [
      'rutCliente', 'boleta', 'poder', 'f2', 'diagrama', 'otrasImagenes'
    ]);
  }

  if (Array.isArray(project.instalacionesGrid)) {
    project.instalacionesGrid = limpiarGrilla(project.instalacionesGrid, [
      'memoriaCalculo'
    ]);
  }

  if (Array.isArray(project.techoGrid)) {
    project.techoGrid = limpiarGrilla(project.techoGrid, [
      'imagenTecho'
    ]);
  }

  return project;
};




// export const limpiarGrillasConArchivos = (project: any) => {
//     const limpiarGrilla = (grilla: any[], campos: string[]) =>
//       grilla.map((fila) => {
//         const nuevaFila = { ...fila };
//         for (const campo of campos) {
//           const campoValor = nuevaFila[campo];
//           //typeof window !== 'undefined': Esta parte se asegura de que el código se está ejecutando en el navegador (frontend) y no en el servidor
//           if (typeof window !== 'undefined' && typeof campoValor === 'object' && campoValor !== null) {
//             // Si tiene un File dentro
//             const contieneFile = Object.values(campoValor).some(v => v instanceof File);
//             // console.log('contieneFile campo',campo,contieneFile);
//             if (contieneFile) {
//               nuevaFila[campo] = null; // o "No subido", si prefieres
//             }
//           }
//         }
//         // console.log('nuevaFila',nuevaFila);
//         return nuevaFila;
//       });
  
//     if (Array.isArray(project.empalmesGrid)) {
//       // console.log('project.empalmesGrid',project.empalmesGrid);
//       project.empalmesGrid = limpiarGrilla(project.empalmesGrid, [
//         'rutCliente', 'boleta', 'poder', 'f2', 'diagrama', 'otrasImagenes'
//       ]);
//     }
  
//     if (Array.isArray(project.instalacionesGrid)) {
//       project.instalacionesGrid = limpiarGrilla(project.instalacionesGrid, [
//         'memoriaCalculo'
//       ]);
//     }
  
//     if (Array.isArray(project.techoGrid)) {
//       project.techoGrid = limpiarGrilla(project.techoGrid, [
//         'imagenTecho'
//       ]);
//     }
//   // console.log('en limpiarGrillasConArchivos project',project);
//     return project;
//   };
  