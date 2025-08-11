import { useEffect, useReducer, ReactNode } from "react";
import { PlacesContext } from "./PlacesContext";
import { placesReducer } from "./placesReducer";
//import { getUserLocation } from "../../helpers";
import { getUserLocation } from "@/helpers";

import { searchApi } from "@/app/services/mapbox"; 
//import { Feature, PlacesResponse } from '../../../types/places';//creado con una Extension desde postman
import { Feature, PlacesResponse } from '../../../types/places';



export interface PlacesState {
    isLoading: boolean;
    userLocation?:[ number, number ];
    isLoadingPlaces: boolean;
    places: Feature[];
}

const INITIAL_STATE:PlacesState ={
    isLoading:true,
    userLocation: undefined,
    isLoadingPlaces:true,
    places: [],
}
interface Props {
    children: ReactNode | ReactNode[]
}

export const PlacesProvider = ({ children }: Props) => {
  const [state, dispatch] =   useReducer(placesReducer, INITIAL_STATE ); 
  //console.log('PlacesProvider state', state); 
  useEffect(() =>{
    getUserLocation()
    .then ( lngLat => dispatch({ type: 'setUserLocation',payload:lngLat }))
  },[]);

  const searchPlacesByTerm = async( query: string ): Promise<Feature[]> => {
    if ( query.length === 0 ) {
      dispatch({ type: 'setPlaces', payload: [] });
      return [];
    }
    if ( !state.userLocation )  throw new Error('No hay ubicación del usuario'); 

   
    dispatch({ type: 'setLoadingPlaces' });

    const resp = await searchApi.get<PlacesResponse>(`/${ query }.json`, {
        params: {
            proximity: state.userLocation.join(',')
        }
    });
    //console.log('features',resp.data.features);

    dispatch({ type: 'setPlaces', payload: resp.data.features });
    return resp.data.features;
  }
  return (
    <PlacesContext.Provider value ={{
      ...state,
      //methods
      searchPlacesByTerm,
    }}>
      { children }
    </PlacesContext.Provider>

  );
};

