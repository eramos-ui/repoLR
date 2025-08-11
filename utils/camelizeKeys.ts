

//api/uploadExcel.ts
//convierte todas las llaves de jsonData (array de objetos) a camelCase
import { camelCase } from 'lodash';

export const camelizeKeys = (jsonData:any):any => {
    if (Array.isArray(jsonData)) {
      return jsonData.map(v => camelizeKeys(v));
    } else if (jsonData != null && jsonData.constructor === Object) {
      return Object.keys(jsonData).reduce(
        (result, key) => ({
          ...result,
          [camelCase(key)]: camelizeKeys(jsonData[key]),
        }),
        {},
      );
    }
    return jsonData;
  };