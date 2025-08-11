import { OptionsSelect } from "@/types/interfaces";
import { fetchOptions } from "./apiHelpers";

export const loadEjecutores= async () =>{

    const data = await fetchOptions("getEjecutores");
    if (data) {
        const regiones:OptionsSelect[]= data; 
        return regiones;        
    }
}