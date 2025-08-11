"use client";
import React, { useEffect, useRef, useContext, useState } from "react";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapContext } from "@/app/context";
import { FeatureCollection, Geometry } from "geojson"; 

interface MapComponentProps {
  geoJSONData?: FeatureCollection<Geometry> | null; // GeoJSON para renderizar
  onClose?: () => void; 
}

const MapComponent: React.FC<MapComponentProps> = ({ geoJSONData, onClose }) => {
  const mapContainerRef               = useRef<HTMLDivElement | null>(null);
  const mapInstance                   = useRef<mapboxgl.Map | null>(null);
  const { setMap }                    = useContext(MapContext);
  const [ placemarks, setPlacemarks ] = useState<{ name: string; coordinates: [number, number] }[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstance.current) {
        mapInstance.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: "mapbox://styles/mapbox/streets-v11",
            center: [-70.64827, -33.45694],
            zoom: 12,
        });
        mapInstance.current.on("load", () => {
            if (geoJSONData) {
                addGeoJSONToMap(geoJSONData);
                extractPlacemarks(geoJSONData);
            }
            if (mapInstance.current) {
                setMap(mapInstance.current); // Notifica que el mapa está listo
            }
        });
        mapInstance.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    }
  }, [geoJSONData, setMap]);

  const addGeoJSONToMap = (geoJSON: GeoJSON.FeatureCollection) => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;
    // Eliminar capas y fuentes previas si existen
    if (map.getSource("geojson-data")) {
      map.removeLayer("geojson-layer");
      map.removeSource("geojson-data");
    }
    // Agregar nueva fuente y capa
    map.addSource("geojson-data", {
      type: "geojson",
      data: geoJSON,
    });
    map.addLayer({
      id: "geojson-layer",
      type: "line",
      source: "geojson-data",
      paint: {
        "line-color": "#ff0000",
        "line-width": 2,
      },
    });
    // Ajustar el mapa para encajar las entidades del GeoJSON
    const bounds = new mapboxgl.LngLatBounds();
    geoJSON.features.forEach((feature) => {
      if (feature.geometry.type === "Point") {
        bounds.extend(feature.geometry.coordinates as [number, number]);
      } else if (feature.geometry.type === "LineString") {
        (feature.geometry.coordinates as [number, number][]).forEach((coord) =>
          bounds.extend(coord)
        );
      } else if (feature.geometry.type === "Polygon") {
        (feature.geometry.coordinates[0] as [number, number][]).forEach((coord) =>
          bounds.extend(coord)
        );
      }
    });
    // 📌 Ajustar zoom si hay datos en el GeoJSON
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 50, maxZoom: 15 }); // 🔍 Ajusta el zoom y evita zoom extremo
    }
  };
  const extractPlacemarks = (geoJSON: GeoJSON.FeatureCollection) => {
    const extractedPlacemarks = geoJSON.features
      .filter((feature) => feature.geometry.type === "Point") // Filtramos solo los puntos
      .map((feature) => {
        if (feature.geometry.type === "Point") {
          return {
            name: feature.properties?.name || "Marcador sin nombre",
            coordinates: feature.geometry.coordinates as [number, number],
          };
        }
        return null;
      })
      .filter((placemark): placemark is { name: string; coordinates: [number, number] } => placemark !== null); // Eliminar valores nulos
  
    setPlacemarks(extractedPlacemarks);
    extractedPlacemarks.forEach((place) => {
      const popup = new mapboxgl.Popup({ closeOnClick: true, focusAfterOpen: false }) // 📌 Evita forzar el foco en el Popup
        .setHTML(`<h3>${place.name}</h3>`);
  
      new mapboxgl.Marker()
        .setLngLat(place.coordinates)
        .setPopup(popup)
        .addTo(mapInstance.current!);
    });
  };
 return (
    <div className="relative w-full h-96">
      <div ref={mapContainerRef} 
          className="w-full h-full border rounded"
          style={{ width: "100%", height: "600px", border: "1px solid #ccc" }}
      />
      { onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded shadow hover:bg-red-700"
        >
          Cerrar
        </button>
      )}     
    </div>
  );
};
export default MapComponent;
