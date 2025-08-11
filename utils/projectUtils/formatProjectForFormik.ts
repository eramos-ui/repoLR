// utils/projectUtils/formatForFormik.ts

export const formatProjectForFormik = (project: any) => {
    return {
      ...project,
  
      // Inicialmente usamos 'No subido', pero se sobrescribirá en el useEffect si se carga el File real
      kmlFile: project.kmlFileName ? 'No subido' : null,
      excelFile: project.excelFileId ? 'No subido' : null,
  
      empalmesGrid: Array.isArray(project.empalmesGrid)
        ? project.empalmesGrid.map((fila: any) => ({
            ...fila,
            rutCliente: fila.rutCliente || null,
            boleta: fila.boleta || null,
            poder: fila.poder || null,
            f2: fila.f2 || null,
            diagrama: fila.diagrama || null,
            otrasImagenes: fila.otrasImagenes || null,
          }))
        : [],
  
      instalacionesGrid: Array.isArray(project.instalacionesGrid)
        ? project.instalacionesGrid.map((fila: any) => ({
            ...fila,
            memoriaCalculo: fila.memoriaCalculo || null,
          }))
        : [],
  
      techoGrid: Array.isArray(project.techoGrid)
        ? project.techoGrid.map((fila: any) => ({
            ...fila,
            imagenTecho: fila.imagenTecho || null,
          }))
        : [],
    };
  };
  
  