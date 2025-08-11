"use client";

import { useContext } from "react";
import { useRouter } from "next/navigation";
import { MapContext } from "../context";
// import { LoadingIndicator } from "../components/LoadingIndicator"; 
import MapComponent from "@/components/maps/MapComponent";
//import "mapbox-gl/dist/mapbox-gl.css";


const MapPage = () => {
  const router                                = useRouter();
  const { geoJSONData, selectedKmlFile  }     = useContext(MapContext);

  //console.log('MapPage/Current geoJSONData:', geoJSONData);
  const handleClose = () => {
    // if (window.confirm("¿Está seguro de que desea cerrar el mapa?")) {
      router.back(); // Navega a la página principal
    // }
  };
  return (
    <div className="p-12">
      <h1 className="text-3xl font-bold text-center">Mapa del Proyecto</h1>
      
      {(geoJSONData && selectedKmlFile) ? (
         <MapComponent geoJSONData={geoJSONData} onClose={handleClose} />
      ) : ( 
          <p className="text-center text-red-500">No hay datos para mostrar en el mapa.</p>
      )}
    </div>
  );
};

export default MapPage;
 
  