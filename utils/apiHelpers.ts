import { ActivityEmailFilesType, ActivityType, EmailTemplateType, empalmesGridType, FilesType, FormValues, 
   instalacionesGridType, OptionsSelect, ProjectActivityType, ProjectType, ProveedorType, techoGridType } 
   from '@/types/interfaces';
// import { replacePlaceholders } from './replacePlaceholders';

//para upload de File
export const saveFormData = async (//updateUsuario por ejemplo
    storedProcedure: string,
    parameters: FormValues,
    formatRut: (rut: string) => string,
  ) => {
    // Formatear valores específicos si es necesario
    Object.keys(parameters).forEach((key) => {
      if (typeof parameters[key] === 'string' && key === 'rut') {
        parameters[key] = formatRut(parameters[key]);
      }
    });
  
    try {
      const response = await fetch('/api/saveWithJson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storedProcedure, parameters }),
      });
  
      if (!response.ok) {
        const error = await response.json();
        console.error("Error al consumir la API (0):", error);
        return { success: false, error: error || response.statusText };//response.statusText es 'bad request'
      }
  
      const result = await response.json();
      return { success: true, result };
    } catch (error) {
      console.error("Error al consumir la API (1):", error);
      return { success: false, error: error};
    }
  };
  
  //storedProcedure es un string con la firma del sp: getComunas(@region)
  export const fetchOptions = async (storedProcedure: string, parametersValue?: string | null): Promise<OptionsSelect[]> => {
    //console.log('fetchOptions',storedProcedure);
    let response:any;
    try {
      const [spName, arg] = storedProcedure.split('(');
      //console.log('spName',spName,arg);
      if (parametersValue){
        const parameterNames = arg.replace(')', '').split(',').map((param) => param.trim().replace('@', ''));
        const parameters = parameterNames.reduce((acc, paramName) => {// Crear un objeto con los valores de los parámetros usando sus nombres reales
          acc[`@${paramName}`] = parametersValue;
          return acc;
        }, {} as Record<string, any>);
         response = await fetch('/api/execSP', {
         method: "POST",
         headers: {"Content-Type": "application/json",},
         body: JSON.stringify({ storedProcedure:spName, parameters }),
       });
      } else {
         response = await fetch('/api/execSP', {
          method: "POST",
          headers: {"Content-Type": "application/json",},
          body: JSON.stringify({ storedProcedure:spName }),
        });
 
      } 
       if (!response.ok) {
        console.error('Error al obtener las opciones');
        // throw 'error';
        throw new Error(`Error al obtener opciones: ${response.statusText}`);
      }
      const data = await response.json();
      const formattedOptions = data.map((item: any) => ({
        value: item.id, // Ajusta estos campos según tu resultset
        label: item.label, // Ajusta estos campos según tu resultset
      }));
      const optionsSelect:OptionsSelect[]=formattedOptions;
      return optionsSelect; // Devuelve las opciones formateadas
    } catch (error) {
      console.error("Error al consumir la API:", error);
      throw error;
    }
  }; 

  export const loadDataProject = async (
    idTask: number,
    userId: number,
    setInitialValues: (x: ProjectType) => void,
    initialValues: ProjectType 
  ) => {
    try {
      const response = await fetch(`/api/getProjectFromTask?idTask=${idTask}&userId=${userId}`);
      if (!response.ok) throw new Error(`Failed to fetch form data: ${response.statusText}`);
  
      const data = await response.json();
      const transformToFile = async (fileData: any): Promise<File | null> => {
        // console.log("🔑 Archivo recibido en transformToFile fileData:", fileData);
        if (!fileData) return null;
        try {
          if (fileData.fileContent && fileData.fileContent.length > 0) {
            // console.log("🔑 Archivo recibido en transformToFile fileData.content:", fileData.fileContent.length);
            const blob = new Blob([fileData.fileContent], { type: fileData.fileType });
            return new File([blob], fileData.fileName, {
              type: fileData.fileType,
              lastModified: Date.now(),
            });
          }
          // Si viene desde Firebase: solo creamos un File "vacío"
          if (fileData.filePath && fileData.filePath.length > 0) {
            // console.log("🔑 Archivo recibido en transformToFile fileData.path:", fileData.filePath.length);
            const response = await fetch(fileData.filePath);
            if (!response.ok) throw new Error(`Error leyendo archivo: ${fileData.filePath}`);
            // console.log("🔑 Archivo recibido en transformToFile fileData.path response:", response.ok);
            const blob = await response.blob();
            // console.log("🔑 Archivo recibido en transformToFile fileData.path blob:", blob);
            // console.log("🔑 Archivo recibido en transformToFile fileData.path file:", new File([blob], fileData.fileName, {
            //     type: fileData.fileType,
            //     lastModified: Date.now(),
            //   }));
              return new File([blob], fileData.fileName, {
              type: fileData.fileType,
              lastModified: Date.now(),
            });
          }
          return null;
        } catch (err) {
          console.error(`Error en transformToFile:`, err);
          return null;
        }
      };
  
      const projectFiles = {
        kmlFile: await transformToFile(data.project.kmlFile),
        excelFile: await transformToFile(data.project.excelFile),
      };
      // console.log("🔑 Archivo recibido en transformToFile empalmesGrid-pre:", data.project.empalmesGrid);
      const empalmesGrid = await Promise.all(
        data.project.empalmesGrid.map(async (row: empalmesGridType) => ({
          ...row,
          rutCliente: await transformToFile(data.files[String(row.nroEmpalme)]?.find((f: any) => f.fileClass.includes("rutCliente"))),
          boleta: await transformToFile(data.files[String(row.nroEmpalme)]?.find((f: any) => f.fileClass.includes("boleta"))),
          poder: await transformToFile(data.files[String(row.nroEmpalme)]?.find((f: any) => f.fileClass.includes("poder"))),
          f2: await transformToFile(data.files[String(row.nroEmpalme)]?.find((f: any) => f.fileClass.includes("f2"))),
          diagrama: await transformToFile(data.files[String(row.nroEmpalme)]?.find((f: any) => f.fileClass.includes("diagrama"))),
          foto: await transformToFile(data.files[String(row.nroEmpalme)]?.find((f: any) => f.fileClass.includes("foto"))),
          otrasImagenes: await transformToFile(data.files[String(row.nroEmpalme)]?.find((f: any) => f.fileClass.includes("otrasImagenes"))),
        }))
      );
      //console.log("🔑 Archivo recibido en transformToFile empalmesGrid-post:", empalmesGrid);
      const instalacionesGrid = await Promise.all(
        data.project.instalacionesGrid.map(async (row: instalacionesGridType) => ({
          ...row,
          memoriaCalculo: await transformToFile(data.files[String(row.nroInstalacion)]?.find((f: any) => f.fileClass.includes("memoriaCalculo"))),
        }))
      );
      console.log("🔑 Archivo recibido en transformToFile instalacionesGrid :", instalacionesGrid );
      const techoGrid = await Promise.all(
        data.project.techoGrid.map(async (row: techoGridType) => ({
          ...row,
          imagenTecho: await transformToFile(data.files[`${row.nroInstalacion}_${row.nroAgua}`]?.find((f: any) => f.fileClass.includes("imagenTecho"))),
        }))
      );
      setInitialValues({
        ...data.project,
        ...projectFiles,
        empalmesGrid,
        instalacionesGrid,
        techoGrid,
      });
    } catch (err) {
      console.error("❌ Error en loadDataProject:", err);
    }
  };
  


export const loadDataProjectActivityFromToken= async(token:string, setDataProjectActivity:(x:ProjectActivityType) => void)=>{
  //console.log('en loadDataProjectActivityFromToken', token);
  try{
    const response = await fetch(`/api/leeProjectActivityFromToken?token='${token}'`);
    if (!response.ok) {
      throw new Error(`Failed to fetch form data: ${response.statusText}`);
    }
    const data = await response.json();
    const mensaje = typeof data.mensaje === 'string'? JSON.parse(data.mensaje):data.mensaje;

    setDataProjectActivity( {idProject:data.idProject,idProjectActivity:data.idProjectActivity,idProveedor:data.idProveedor,
      nombreProveedor:data.proveedor,contacto:data.contacto,idActivity:data.idActivity,actividad:data.actividad,mensaje,token:data.token,fechaEnvio:data.fechaEnvio,
      anexos:data.anexos
     })
    return data;  
  }catch(err){
    console.error( err);
  }
}
