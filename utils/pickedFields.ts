
//Permite seleccionar los campos que se van a enviar a la API

export const pickFields = <T extends object>(obj: T, fields: (keyof T)[]): Partial<T> => {
    return fields.reduce((acc, field) => {
      if (obj[field] !== undefined) {
        acc[field] = obj[field];
      }
      return acc;
    }, {} as Partial<T>);
  };