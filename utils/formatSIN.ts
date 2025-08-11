export const formatSIN = (sin: string) => {
  if (!sin) return '';
    const cleaned = sin.replace(/\D/g, ''); // Elimina caracteres no numéricos
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3'); // Formatea el SIN en grupos de tres
  };