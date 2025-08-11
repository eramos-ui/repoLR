export interface UploadExcelResponse {
    success: boolean;
    data?: any;
    excelColumns?: string[]; 
    error?: string;
  }
  
  export const uploadExcelFile = async (
    excelFile: File | null,
    //excelColumns: string[] | null,
    apiEndpoint: string
  ): Promise<UploadExcelResponse> => {
    
    if (!excelFile) {
      return { success: false, error: "Por favor, selecciona un archivo." };
    }
  
    const formData = new FormData();
    formData.append("file", excelFile);
    //console.log('en utils uploadExcelFile', apiEndpoint, excelFile);
    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const result = await res.json();
        //console.log('en utils uploadExcelFile result',result);   
        return { success: true, data: result.data, excelColumns:result.excelColumns };
      } else {
        const error = await res.json();
        console.log('en uploadExcelFile res,error',res,error);
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error("Error al subir el archivo:", error);
      return { success: false, error: "Error al procesar el archivo." };
    }
  };
  