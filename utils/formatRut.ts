export const formatRut = (rut: string): string => {
   if (!rut) return '';
    // Eliminar cualquier carácter que no sea un número o la letra 'K'
    const cleanRut = rut.replace(/[^0-9kK]/g, '');
  
    // Verificar si el RUT tiene el dígito verificador
    if (cleanRut.length < 2) {
      return cleanRut;
    }  
    // Separar el número base del dígito verificador
    const number = cleanRut.slice(0, -1);
    const verifier = cleanRut.slice(-1).toUpperCase();
  
    // Formatear el número base con puntos como separadores de miles
    const formattedNumber = number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
    // Combinar el número formateado con el dígito verificador
    return `${formattedNumber}-${verifier}`;
  };