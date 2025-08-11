import { OptionsSelect } from "@/types/interfaces";
import { fetchOptions } from "./apiHelpers";

export const loadResponsables= async () =>{
    const data = await fetchOptions("getResponsables");
    if (data) {
        const regiones:OptionsSelect[]= data; 
        return regiones;        
    }
}