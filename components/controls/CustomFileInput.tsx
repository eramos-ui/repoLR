"use client";

import { useFormikContext, FieldProps  } from "formik";
import React, { useEffect, useState } from "react";
import './CustomInput.css';
import { CustomLabel } from "./CustomLabel";

interface Props  extends Partial<FieldProps> {//similar a CustomUploadExcel pero no sube el archivo
  label?: string; 
  captionPosition?: 'left' | 'top';
  onUploadSuccess?: (data: File) => void; // Callback para manejar los datos procesados
  onUploadError?: (error: string) => void; // Callback para manejar errores
  name?: string; // Nombre para Formik
  id?: string;
  type?: string;
  accept: string; // Tipos de archivo permitidos
  className?: string;
  width?: string;
  value?: File | null;
  style?: React.CSSProperties;
  uploadButtonLabel?: string;
  onUploadClick?: () => void;
  useStandaloneForm?: boolean; 
  showUploadButton?:boolean; 
  putFilenameInMessage?: boolean; 
  disabled?: boolean;
  required?: boolean;
}
//type CombinedProps = Props & Partial<FieldProps>; // Soporte para Formik
const MAX_FILE_SIZE_MB = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || "10") * 1024 * 1024;
export const CustomFileInput: React.FC<Props> = ({
  field,
  label = "",
  captionPosition ='top',
  onUploadSuccess,
  onUploadError,
  type = "file",
  className = "",
  width='100%',
  name,
  accept,
  value, 
  uploadButtonLabel='Subir archivo',
  onUploadClick,
  useStandaloneForm = true,
  showUploadButton=true,  
  putFilenameInMessage=false,
  disabled= false,
  required=false,
  style,
  ...props
}) => {
  //const { values, getFieldHelpers }      = useFormikContext(); // ✅ Usamos Formik v3
  const [ file, setFile ]                = useState<File | null>(null);
  const [ message, setMessage ]          = useState("");
  const [ messageType, setMessageType ]  = useState<"success" | "error" | "">("");
  //const [selectedFile, setSelectedFile]  = useState<File | null>(null); // Estado local para no-Formik
  const inputRef                         = React.useRef<HTMLInputElement>(null);
  //const { setValue }                     = getFieldHelpers(name!); 
  // console.log('CustomFileInput MAX_FILE_SIZE_MB',MAX_FILE_SIZE_MB);
  useEffect(() => {
    const actualValue = value ?? field?.value;
    if (actualValue) {
      if (typeof actualValue === "string") {
        setMessage(actualValue);
      } else if (actualValue instanceof File) {
        setMessage(actualValue.name);
        setFile(actualValue);
      }
      setMessageType("success");
    }
  }, [value, field?.value]);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files?.[0] || null;
       if (selectedFile.size > MAX_FILE_SIZE_MB ) {
        alert(`El archivo supera el tamaño máximo permitido de ${MAX_FILE_SIZE_MB}MB.`);
        return;
      }
      setFile(selectedFile);
      onUploadSuccess?.(selectedFile);
      setMessageType('success');
      setMessage((putFilenameInMessage)?event.target.files[0].name:'archivo subido OK');
      //setValue(selectedFile); // ✅ Actualizar el valor en Formik
    }else {
       onUploadError?.("Archivo no subido");
       setMessageType('error');
    }
  };
  const miniIcon=(file?.name)?String.fromCodePoint((0x1F4C2)):String.fromCodePoint((0x274C));
  //console.log('miniIcon',miniIcon,file?.name,message);
  const req= (required)? '*':'';
  const labelFull=`${label} ${req} `
  return (
    <>
    {/* { console.log('JSX', file?.name,message,messageType,putFilenameInMessage)} */}
      <div className={`custom-input-container ${captionPosition}`}>
      <CustomLabel size='normal+' label={labelFull} />
        <div className="flex items-center space-x-2" style={{...style, width }} >
        <input
          ref={inputRef}
          //className={`file-input ${className}`}
          id={name || "file-upload"}
          name={name}
          type="file"
          accept={accept}
          //style={{ width }}
          onChange={handleFileChange }
          disabled={ disabled}
        />
        </div>
        {message && (
        <p
          className={`mt-2 text-sm font-medium ${
            messageType === "success" ? "" : "text-red-600"
          }`}
        >
          { 
          (putFilenameInMessage!)?  `${miniIcon} ${message} ` : (file?.name)?`${miniIcon} ${file.name}`:`${miniIcon} ${message} `
          }
        </p>
        )}
      </div>
    </>
  );
};
