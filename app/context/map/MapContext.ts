
import { createContext } from 'react';
import { Map, Marker } from 'mapbox-gl'; 
import { FeatureCollection, Geometry } from "geojson"; 

interface MapContextProp {
    isMapReady: boolean;
    map?: Map;
    markers: Marker[];
    geoJSONData: FeatureCollection<Geometry> | null;
    center?: [number, number] | null; 
    selectedKmlFile: File | null;
    //methods 
    setMap: ( map: Map ) => void;
    setGeoJSONData: (data: FeatureCollection<Geometry>| null ) => void;
    getRouteBetweenPoints: (start: [number, number], end: [number, number]) => Promise<void>;
    setSelectedKmlFile: (file: File | null) => void;    
}


export const MapContext= createContext ({} as MapContextProp)