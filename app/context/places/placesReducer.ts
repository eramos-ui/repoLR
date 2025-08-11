import { PlacesState } from './PlacesProvider';
import { Feature } from '../../../types/places';

type PlacesAction = 
    | { type: 'setUserLocation', payload: [ number, number ]}//longitud y latitud
    | { type: 'setLoadingPlaces'}
    | { type: 'setPlaces', payload: Feature[] };

    export const placesReducer = ( state: PlacesState, action: PlacesAction ): PlacesState => {
        switch ( action.type ) {
            case 'setUserLocation':
                return {
                    ...state,
                    isLoading: false,
                    isLoadingPlaces: false,   
                    userLocation: action.payload
                }
    
            case 'setLoadingPlaces':
                return {
                    ...state,
                    isLoadingPlaces: true,                    
                    places: [],
                }
    
            case 'setPlaces': 
                return {
                    ...state,
                    isLoadingPlaces: false,
                    places: action.payload
                }
        
            default:
                return state;
        }
    
}