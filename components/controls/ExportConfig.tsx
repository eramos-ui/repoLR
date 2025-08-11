import React, { useState } from "react";
import { CustomButton } from "./CustomButton";
import { faFileExcel } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CustomInput } from "./CustomInput";

type ExportConfigProps = {
  onExport: (fileName: string) => void;
  defaultFileName?: string; // Nombre predeterminado del archivo
};

export const ExportConfig: React.FC<ExportConfigProps> = ({
  onExport,
  defaultFileName = "",
}) => {
  const [fileName, setFileName] = useState(defaultFileName);

  const handleExport = () => {
    if (!fileName.trim()) {
      alert("Por favor, ingrese un nombre válido para el archivo.");
      return;
    }
    onExport(fileName);
  };


  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <CustomInput
        label=''
        type="text"
        value={fileName}
        onChange={(e) => setFileName(e.target.value)}
        placeholder="Nombre del archivo excel"
        tooltipContent={'Nombre sin extensión, con el que se guardará el archivo en Descargas'}
        tooltipPosition = "bottom"
        width='200px'
        style={{
          padding: "0.5rem",
          border: "1px solid #ccc",
          borderRadius: "4px",
          fontSize: "14px",
          height: '2.00rem',
        }}
      />
      <CustomButton
        label="Exportar a Excel"        
        onClick={handleExport}
        buttonStyle="secondary"
        size="small"
        theme={'light'}
        disabled = {(fileName.length === 0) ? true:false}
        tooltipContent={(fileName.length === 0) ?`Para bajar Excel a su computadora primero ingrese Nombre del archivo`:`Bajar Excel a Descargas\\${fileName}.xlsx`}
        tooltipPosition = "bottom"
        icon={<FontAwesomeIcon icon={faFileExcel} />}
        style={{ color: "green", 
            backgroundColor:"white" ,
            border: `1px solid  black`,
            height: '2.00rem',
            marginTop:'0.4rem',
        }}  
      />
    
    </div>
  );
};
