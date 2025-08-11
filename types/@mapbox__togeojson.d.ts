declare module "@mapbox/togeojson" {
    // export function toGeoJSON(kml: Document): GeoJSON.FeatureCollection;
    export function kml(doc: Document): GeoJSON.FeatureCollection;
    export function gpx(doc: Document): GeoJSON.FeatureCollection;
  }
  