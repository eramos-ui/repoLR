import React, { useEffect, useState } from "react";
import { FieldProps } from "formik";
import './CustomInput.css';
import { CustomLabel } from "./CustomLabel";

interface CustomUploadExcelProps {
    label?: string;
    captionPosition?: 'left' | 'top';
    endpoint?: string; // URL del endpoint de subida
    onUploadSuccess?: (data: File) => void; // Callback para manejar los datos procesados
    onUploadError?: (error: string) => void; // Callback para manejar errores
    useStandaloneForm?: boolean; // Si el componente incluye su propio <form>
    //setSelectedExcel: (file: File | null) => void;
    showUploadButton?:boolean
    uploadButtonLabel?: string;
    onUploadClick?: () => void;
    className?: string;
    value?: File | null;
    putFilenameInMessage?:string;
}
type CombinedProps = CustomUploadExcelProps & Partial<FieldProps>; // Soporte para Formik

export const CustomUploadExcel: React.FC<CombinedProps> = ({
  label = "",
  captionPosition ='top',
  onUploadSuccess,
  onUploadError,
  endpoint = "/api/uploadExcel",
  field, // Propiedades del campo de Formik
  form, // Propiedades del formulario de Formik
  className='',
  value,
  useStandaloneForm = true,
  //setSelectedExcel,
  uploadButtonLabel="Subir Excel",
  showUploadButton=true,  
  onUploadClick,
  putFilenameInMessage=false,
}) => {
  const [ file, setFile ]               = useState<File | null>(null);
  const [ loading, setLoading ]         = useState(false);
  const [ message, setMessage ]         = useState("");
  const [messageType, setMessageType]   = useState<"success" | "error" | "">("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  useEffect(() => {
    if (value) {
      //console.log('en handleFileChange value',value);
      setFile(value);
      setSelectedFile(value);
      onUploadSuccess?.(value);
    }
  }, [value, onUploadSuccess]); 
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
        const selectedFile = event.target.files[0];
        //console.log('selectedFile en CustomUploadExcel', selectedFile,useStandaloneForm);
        setFile(selectedFile);
        onUploadSuccess?.(selectedFile);
        setMessageType('success');
        if (putFilenameInMessage){
           setMessage(selectedFile.name);
        } else{
          setMessage("Archivo subido OK");
        }
        if (field && form) {// Si está dentro de Formik, actualiza el valor del campo
          form.setFieldValue(field.name, selectedFile);
        }
      }
  };
  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      setMessage("Por favor, selecciona un archivo.");
      setMessageType("error");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      setLoading(true);
      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });
      let result;
      try {
        result = await res.json(); // Intenta convertir la respuesta a JSON
      } catch (jsonError) {
        throw new Error("Error al procesar la respuesta del servidor. No es un JSON válido.");
      }
  
      if (!res.ok) {
        const errorMessage = result?.message || "Error desconocido en el servidor.";
        setMessageType("error");
        throw new Error(errorMessage);
      }
      setMessage("Archivo subido exitosamente.");
      setMessageType("success"); 
      onUploadSuccess?.(result.data);
    } catch (error) {
      console.error("Error al subir el archivo:", error);
      setMessage(`Error: ${error instanceof Error ? error.message : "Error inesperado."}`);
      setMessageType("error");
      onUploadError?.(error instanceof Error ? error.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  };  
  return (
    <div className={`custom-input-container ${captionPosition}`}>
      {/* 📌 Etiqueta para el Input */}
     <CustomLabel  size='normal+' label={label} />
      {/* 📌 Contenedor de Input y Mensaje */}
      <div className="flex items-center space-x-4">
        <input type="file" accept=".xlsx, .xls" 
           onChange={handleFileChange} 
           //className="border border-gray-300 rounded p-2" 
           className={`file-input ${className}`}
        />
        {/* 📌 Botón de Subida (opcional) */}
        {/* {(showUploadButton && file ) &&  ( 
          <button type={useStandaloneForm ? "submit" : "button"} onClick={onUploadClick || handleUpload}
            disabled={loading} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700 transition">
            {loading ? "Subiendo..." : uploadButtonLabel}
          </button>
        )} */}
      </div>
      {/* 📌 Mensaje de respuesta */}
      {message && (
        <p
          className={`mt-2 text-sm font-medium ${
            messageType === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {(putFilenameInMessage)? file?.name : message}
        </p>
      )}
    </div>
  );
};
