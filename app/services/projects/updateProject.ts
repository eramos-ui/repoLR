import { deepClonePreservingFiles } from "@/utils/deepClonePreservingFiles";
import { limpiarGrillasConArchivos } from "@/utils/projectUtils/limpiarGrillasConArchivos";
import { limpiarValoresInvalidos } from "@/utils/projectUtils/limpiarValores";

export const updateProject = async (  
    values: any,
  ): Promise<any> => {
    // const formData = new FormData();
    // const values={...vals,userModification,userId,userName};
    //console.log('en updateProject values',values);
    const formData = new FormData();
    // const clonedValues = JSON.parse(JSON.stringify(values));
    const clonedValues = deepClonePreservingFiles(values,); //clonar los valores para evitar que se modifiquen los valores originales
    // console.log('clonedValues',clonedValues);
    const cleaned = limpiarValoresInvalidos(limpiarGrillasConArchivos(clonedValues));//saca los Files de las grillas y del project
    // console.log('cleanedValues',cleaned);
  
    formData.append('values', JSON.stringify(cleaned));// arma el formData con los valores limpios
    formData.append('state', values.state);
  
    // Agregar archivos individuales si existen
    if (values.kmlFile instanceof File) {
      formData.append('kmlFile', values.kmlFile);
    }
  
    if (values.excelFile instanceof File) {
      formData.append('excelFile', values.excelFile);
    }  
    // Agregar archivos de grillas
    const appendGridFiles = (
      grid: any[] = [],
      fileKeys: string[],
      rowIdKey: string | string[]
    ) => {
      for (const row of grid) {
        const rowId = Array.isArray(rowIdKey)
          ? rowIdKey.map(k => String(row[k])).join('_')
          : String(row[rowIdKey]);
  
        for (const key of fileKeys) {
          const file = row[key];
          if (file instanceof File) {
            formData.append(`${key}_${rowId}`, file);
          }
        }
      }
    };  
    appendGridFiles(values?.empalmesGrid ?? [], ['rutCliente', 'boleta', 'poder', 'f2', 'diagrama', 'otrasImagenes'], 'nroEmpalme');
    appendGridFiles(values?.instalacionesGrid ?? [], ['memoriaCalculo'], 'nroInstalacion');
    appendGridFiles(values?.techoGrid ?? [], ['imagenTecho'], ['nroInstalacion', 'nroAgua']);
  //D:\Documents\GitHub\fvoltadmin\pages\api\projects\saveProject.ts
    // console.log('en updateProject formData',formData);
  
    const response = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/projects/saveProject`, {
      method: 'POST',
      body: formData,
    });
  
    if (!response.ok) {
      throw new Error(`Error al actualizar el proyecto: ${response.statusText}`);
    }
  
    return await response.json();
  };
  