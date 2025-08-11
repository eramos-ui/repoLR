export const calculaDVRut = (rut: string | number): string => {
    const rutStr = rut.toString().replace(/\D/g, ''); // Elimina todo lo que no sea dígito
    let sum = 0;
    let multiplier = 2;
  
    for (let i = rutStr.length - 1; i >= 0; i--) {
      sum += parseInt(rutStr[i], 10) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
  
    const mod = 11 - (sum % 11);
  
    if (mod === 11) return '0';
    if (mod === 10) return 'K';
    return mod.toString();
  };