import { MapState } from "./MapProvider";
import { Map, Marker } from "mapbox-gl";
import { FeatureCollection, Geometry } from "geojson"; 

type MapAction = 
| { type: 'setMap', payload: Map}
| { type: 'setMarkers', payload: Marker[]}
| { type: 'setGeoJSONData', payload: FeatureCollection<Geometry> | null }
| { type: 'setSelectedKmlFile', payload: File | null };


export const mapReducer = ( state: MapState, action: MapAction): MapState =>{
   // console.log('en mapReducer',action.type,state);
   switch ( action.type ){
      case 'setMap':
        return {
            ...state,
            isMapReady: true,
            map: action.payload,             
        }
        case 'setMarkers':
         return {
             ...state,
             markers: action.payload,             
         }
        case 'setGeoJSONData': // Manejar el estado de GeoJSON
         return {
             ...state,
             isMapReady: true,
             geoJSONData: action.payload,
         }
         case 'setSelectedKmlFile': // ✅ Nueva acción en el reducer
         return {
             ...state,
             selectedKmlFile: action.payload,
         }
        //  case "setMapCenter":
        //     return {
        //         ...state,
        //         center: action.payload,
        //     };
     default:
        return state;
   }

}