import axios from 'axios';

const searchApi = axios.create({
 baseURL: 'https://api.mapbox.com/geocoding/v5/mapbox.places',
 params:{
    limit :5,
    language: 'es',
    autocomplete: true,
    access_token:process.env.NEXT_PUBLIC_ACCESS_token,
 }
})

export default searchApi;

