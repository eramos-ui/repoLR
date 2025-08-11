import { processFileToGeoJSON } from "@/utils/kmzProcessor";
import { FeatureCollection, Geometry } from "geojson";

interface HandleFileChangeProps {
  file: File | null;
  onSuccess: (geoJSON: FeatureCollection<Geometry>) => void;
  onError: (error: string | null) => void;
  setSelectedKmlFile: (file: File | null) => void;
}
const MAX_SIZE = 20 * 1024 * 1024;
export const handleFileChange = async ({ file, onSuccess, onError, setSelectedKmlFile }: HandleFileChangeProps): Promise<void> => {
  console.log('en handleFileChange file', file);
  if (!file) {
    onError("No se seleccionó ningún archivo");
    setSelectedKmlFile(null);
    return;
  }
  if (file.size > MAX_SIZE) {
    onError("El archivo es demasiado grande");
    return;
  }  
  if (!file.type.includes("application/vnd.google-earth")) {
    onError("El tipo de archivo no es compatible");
    return;
  }
  try {
    const geoJSON = await processFileToGeoJSON(file);
    if (geoJSON) {
      setSelectedKmlFile(file);
      onSuccess(geoJSON);
      onError(null);
    } else {
      onError("No se pudo procesar el archivo. Verifica que sea un archivo KML o KMZ válido.");
    }
  } catch (err) {
    console.error("Error al procesar el archivo:", err);
    onError("Ocurrió un error al procesar el archivo.");
  }
};
