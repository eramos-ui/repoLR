import { CustomFileInput } from "@/components/controls/CustomFileInput";
import { CustomButton } from "@/components/controls";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapLocation, faFileExcel } from "@fortawesome/free-solid-svg-icons";

interface FileUploadSectionProps {
  handleFileChange: (file: File | null) => void;
  handleOpenMap: () => void;
  handleUploadExcel: () => void;
  geoJSONDataL: boolean;
  selectedExcel: boolean; 
}

export const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  handleFileChange,
  handleOpenMap,
  handleUploadExcel,
  geoJSONDataL,
  selectedExcel,
}) => {
  console.log('FileUploadSection');
  return (
    <div>
      <div className="mb-4 flex items-center space-x-4">
        <CustomFileInput
          label="Suba archivo KML o KMZ"
          accept=".kml,.kmz"
          putFilenameInMessage={false}
          // onChange={handleFileChange} 
          onUploadSuccess={(file: File | null) => {
            handleFileChange(file);
            // if (file) { //console.log(`📂 Archivo subido (${col.field}):`, file.name);
            //   setFieldValue(col.field, file.name); // ✅ Actualiza Formik con el nombre del archivo
            //   handleFileUpload?.(file, rowIndex, col.field);  // ✅ Envía el archivo con el nombre del campo
            // }
          }}
        />
        <CustomButton
          buttonStyle="primary"
          size="small"
          htmlType="button"
          label="Abrir mapa"
          icon={<FontAwesomeIcon icon={faMapLocation} size="lg" />}
          onClick={handleOpenMap}
          disabled={!geoJSONDataL}
        />
      </div>
      <div className="mb-4 flex items-center space-x-4">
        <CustomButton
          buttonStyle="primary"
          size="small"
          htmlType="button"
          label="Subir Excel"
          icon={<FontAwesomeIcon icon={faFileExcel} size="lg" />}
          onClick={handleUploadExcel}
          disabled={!selectedExcel}
        />
      </div>
    </div>
  );
};
