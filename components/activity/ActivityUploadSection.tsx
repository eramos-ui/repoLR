import { useEffect, useState } from 'react';
import { useFormikContext } from "formik"
import { CustomButton, CustomLabel, CustomUploadExcel } from '@/components/controls';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { uploadExcelFile } from '@/utils/uploadExcelFile';
// import { transformToGridRows } from '@/utils/transformToGridRows';
import { generateColumnConfig } from '@/utils/generateColumnConfig';
import { ExcelColumn, ProjectType } from '@/types/interfaces';

// interface ActivityUploadSectionProps {
//   // setColumns: (columns: any) => void; //la de la grilla
//   // setFormColumns: (columns: any) => void;  //la del modal de edición
// }

const ActivityUploadSection: React.FC = (   ) => { //{ setColumns, setFormColumns} ,setRows, rows,
  const { values, setFieldValue }             = useFormikContext<ProjectType>();
  const [ selectedExcel, setSelectedExcel ]   = useState<File | null>(null);
  const [ disabledUpload, setDisabledUpload ] = useState(true);
  const [ uploadMessage, setUploadMessage ]   = useState("");
  const [ error, setError ]                   = useState<string | null>(null);
  //console.log('ActivityUploadSection',values);
  
  const handleUploadExcel = async (excelFile: File | null) => {
    if (!excelFile) return;
    if ( values.activities && values.activities.length>1 ){
        if (!window.confirm(`Al cargar el nuevo Excel se recargará la grilla de actividades perdiendo el actual contenido. ¿Recarga otro excel?`))  return;
    }
    const response = await uploadExcelFile(excelFile, "/api/uploadExcel");
    if (response.success) {      
      const grilla = response.data;
    //   const excelColumns: ExcelColumn[] = Array.isArray(response.excelColumns)
    //   ? response.excelColumns.map((col: any) =>
    //     typeof col === "string"
    //   ? { name: col, inputType: "text", type: "string" }
    //   : col
    // )
    // : [];
    
    // const columnsConfig = generateColumnConfig(grilla, excelColumns);
    // console.log('columnsConfig',columnsConfig,response); 
    
    // const formFields = columnsConfig.map(col => ({
    //   field: col.key,
    //   editable: (col.key !== 'NumActividad' && col.key !== 'Duracion') ,
    //   headerName: col.label,
    //   inputType: col.inputType,
    //   captionPosition: col.captionPosition || "top",
    //   validationSchema: col.validationSchema || undefined,
    //   width: col.width,
    //   row: (col.key === 'Actividad')? 1:(col.key !== 'Presupuesto')? 2:3 
    // }));
      // console.log('grilla',grilla);
      setFieldValue('activities',grilla );
      setFieldValue('excelFile', excelFile);//en saveProject se actualiza en Mongo como excelFileId
      setDisabledUpload(false);
      setUploadMessage("Archivo subido exitosamente.");
      setError(null);
    } else {
      setError(response.error?.toString() || "Error al cargar el archivo");
    }
  };
  return (
    <div className="mb-4 ml-1 flex items-center space-x-4">
      <CustomUploadExcel label="Excel con las actividades" useStandaloneForm={false} showUploadButton={false}
        onUploadSuccess={(file: File | null) => {setSelectedExcel(file); setDisabledUpload(true); setFieldValue('excelFile',file)}}
        className="100%" 
      />
      {selectedExcel && (<span className="ml-0 mt-2 text-blue-600 font-medium truncate max-w-xs">📄 {selectedExcel.name}</span>)}
      <CustomButton buttonStyle="primary" size="small" htmlType="button" label="Cargar actividades"
        icon={<FontAwesomeIcon icon={faFileExcel} size="lg" color="white" />}
        onClick={() => handleUploadExcel(selectedExcel)}
        disabled={ !selectedExcel || !disabledUpload}
        style={{ marginTop: '10px' }}
      />
      {error && <CustomLabel label={error} fontColor={'#EF4444'} />}
    </div>
  );
};
export default ActivityUploadSection;
