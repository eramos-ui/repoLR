import mapboxgl from 'mapbox-gl';
import JSZip from "jszip";
//import { toGeoJSON } from "@mapbox/togeojson";
import { kml, gpx } from "@mapbox/togeojson";


export const processFileToGeoJSON = async (file: File): Promise<GeoJSON.FeatureCollection | null> => {
  //console.log("File received:", file);
  // if (typeof toGeoJSON !== "function") {
  //   console.error("toGeoJSON no se importó correctamente");
  //   return null;
  // }
  try {
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith(".kmz")) {
      //console.log('Procesar archivo KMZ');
      const zip = await JSZip.loadAsync(file);
      const kmlFileName = Object.keys(zip.files).find((name) => name.endsWith(".kml"));
      if (!kmlFileName) {
        throw new Error("No KML file found in the KMZ archive");
      }
      const kmlText = await zip.file(kmlFileName)!.async("string");
      const kmlDocument = new DOMParser().parseFromString(kmlText, "application/xml");
      if (!kmlDocument) {
        throw new Error("Error al parsear el archivo KML");
      }
      const geoJSON = gpx(kmlDocument) as GeoJSON.FeatureCollection;
      //console.log('en processFileToGeoJSON geoJSON',geoJSON);
      return geoJSON;
    } else if (fileName.endsWith(".kml")) {
      //console.log('Procesar archivo KML');
      const kmlText = await file.text();
      const kmlDocument = new DOMParser().parseFromString(kmlText, "application/xml");
      //console.log('Procesar archivo KML kmlDocument', kmlDocument);
      return kml(kmlDocument) as GeoJSON.FeatureCollection;
    } else {
      throw new Error("Unsupported file format. Please upload a KML or KMZ file.");
    }
  } catch (error) {
    console.error("Error processing file to GeoJSON:", error);
    return null;
  }
};


  const fileToArrayBuffer = async (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      try{
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);

      } catch (error){
        reject(new Error("Error al convertir el archivo a ArrayBuffer"));
      }
    });
};
