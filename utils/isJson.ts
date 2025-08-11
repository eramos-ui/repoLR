export const isJson=(str:string)=> {//verifica si str es Json
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
  };