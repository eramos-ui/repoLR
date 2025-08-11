
  
"use client";

import { useState } from 'react';
import { CustomUploadExcel } from '@/components/controls';
import { useRouter } from 'next/navigation';

const ExcelPage = () => {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const handleSuccess = (data: any[]) => {
    console.log("Datos procesados del archivo:", data);
  };


  const handleError = (error: string) => {
    console.error("Error al subir el archivo:", error);
  };
  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Por favor, selecciona un archivo.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("/api/upload", { 
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        console.log("Datos procesados:", result.data);
        alert("Archivo subido exitosamente.");
      } else {
        const error = await res.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error al subir el archivo:", error);
      alert("Error al procesar el archivo.");
    }
  }
  return (
    <div className="p-4">
      {/* <h1 className="text-3xl font-bold">Open excel</h1> */}
      <div>
      <h1>Subir Archivo Excel</h1>
                {/* <CustomUploadExcel
                  onUploadSuccess={handleSuccess}
                  onUploadError={handleError}
                  endpoint="/api/uploadExcel"
                  onFileSelect={(file: File | null) => {  console.log("Archivo seleccionado:", file); }}
                /> */}
                 <button onClick={handleUpload}>Subir Archivo</button>
              </div>
      <button
      onClick={() =>  router.push('/') }
      > Volver a página pricipal
      </button>
    </div>
  );
};
export default ExcelPage;