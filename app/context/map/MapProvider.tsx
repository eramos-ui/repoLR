import { useContext, useEffect, useReducer, ReactNode, useState } from "react";
import { LngLatBounds, Map, Marker, Popup, GeoJSONSourceSpecification } from "mapbox-gl";
import type { FeatureCollection , Geometry} from "geojson";

import { MapContext } from './MapContext';
import { mapReducer } from './mapReducer';

import { PlacesContext } from '..';

import { directionsApi } from "@/app/services/mapbox"; 
import { DirectionsResponse } from '../../../types/directions';

export interface MapState { 
    isMapReady: boolean;
    map?: Map;    
    markers: Marker[];
    center?: [number, number] | null; 
    geoJSONData: FeatureCollection<Geometry> | null  ; 
    selectedKmlFile: File | null; 
}

const INITIAL_STATE: MapState = {
    isMapReady: false,
    map: undefined,
    markers: [],
    geoJSONData: null, 
    center:null, 
    selectedKmlFile: null, 
}

interface Props {
    children: ReactNode| ReactNode[];
}
export const MapProvider = ({ children }: Props) => {
    const [ state, dispatch ] = useReducer( mapReducer, INITIAL_STATE );
    const { places }          = useContext( PlacesContext );
    //const [selectedKmlFile, setSelectedKmlFile] = useState<File | null>(null);
    useEffect(() => {
        state.markers.forEach( marker => marker.remove() );
    }, [state.markers]);
    useEffect(() => {
        const newMarkers: Marker[] = [];

        for (const place of places) {
            const [ lng, lat ] = place.center;
            const popup = new Popup()
                .setHTML(`
                    <h6>${ place.text_es }</h6>
                    <p>${ place.place_name_es }</p>
                `);
            
            const newMarker = new Marker()
                .setPopup( popup )
                .setLngLat([ lng, lat ])
                .addTo( state.map! );
            
            newMarkers.push( newMarker );
        }
        // Todo: limpiar polyline
        dispatch({ type: 'setMarkers', payload: newMarkers });
        
    }, [ places,state.map])//,state.markers 
     

    const setMap = ( map: Map ) => {

        const myLocationPopup = new Popup()
            .setHTML(`
            <h4>Aquí estoy</h4>
            <p>En algún lugar del mundo</p>
            
        `);

        new Marker({
            color: '#61DAFB'
        })
        .setLngLat( map.getCenter() )
        .setPopup( myLocationPopup )
        .addTo( map );
        dispatch({ type: 'setMap', payload: map })
    }

    const getRouteBetweenPoints = async(start: [number, number], end: [number, number] ) => {

        const resp = await directionsApi.get<DirectionsResponse>(`/${ start.join(',') };${ end.join(',') }`);
        const { distance, duration, geometry } = resp.data.routes[0];
        const { coordinates: coords } = geometry;

        let kms = distance / 1000;
            kms = Math.round( kms * 100 );
            kms /= 100;

        const minutes = Math.floor( duration / 60 );
        //console.log({ kms, minutes });
        const bounds = new LngLatBounds(
            start,
            start
        );

        for (const coord of coords ) {
            const newCoord: [number, number] = [ coord[0], coord[1] ];
            bounds.extend( newCoord );
        }
        state.map?.fitBounds( bounds, {
            padding: 200
        });

        // Polyline
        const sourceData: GeoJSONSourceSpecification = {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'LineString',
                            coordinates: coords,
                        },
                    },
                ],
            },
        };
        
        if ( state.map?.getLayer('RouteString') ) {
            state.map.removeLayer('RouteString');
            state.map.removeSource('RouteString');
        }
        state.map?.addSource('RouteString', sourceData );
        state.map?.addLayer({
            id: 'RouteString',
            type: 'line',
            source: 'RouteString',
            layout: {
                'line-cap': 'round',
                'line-join': 'round'
            },
            paint: {
                'line-color': 'black',
                'line-width': 3
            }
        })        
    }
    const setGeoJSONData = (data: GeoJSON.FeatureCollection | null) => {
        //console.log('MapProvider/setGeoJSONData data',data);    
        dispatch({ type: 'setGeoJSONData', payload: data });
    };
    const setSelectedKmlFile = (file: File | null) => {
        //console.log('dispatch setSelectedKmlFile', file,state);
        dispatch({ type: 'setSelectedKmlFile', payload: file });
    };
    return (
        <MapContext.Provider value={{
            ...state,
            // geoJSONData: state.geoJSONData ?? null,
            // selectedKmlFile: state.selectedKmlFile ?? null ,
            // Methods
            setMap,
            setGeoJSONData,
            getRouteBetweenPoints,
            setSelectedKmlFile,
        }}>
            <>
                {/* {console.log('Current geoJSONData:', state.geoJSONData)} */}
                { children }
            </>
        </MapContext.Provider>
    )
}