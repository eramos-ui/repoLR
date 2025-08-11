export const normalizeRut = (rut: string): string => {
    return rut.replace(/[^0-9kK]/g, '').toUpperCase();
  };
  
  export const formatRut = (rut: string): string => {
    const cleanRut = normalizeRut(rut);
  
    if (cleanRut.length < 2) {
      return cleanRut;
    }
  
    const number = cleanRut.slice(0, -1);
    const verifier = cleanRut.slice(-1);
  
    const formattedNumber = number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
    return `${formattedNumber}-${verifier}`;
  };