import { FormFieldType } from "@/types/interfaces";

export const getInitialValuesDynamicForm = (formData: { fields?: FormFieldType[] }): { [key: string]: any } => {
  const initialValues: { [key: string]: any } = {};
 
   // Manejar fields escalares en la estructura principal
   if (formData?.fields?.length) {
    formData.fields.forEach((field) => {
      //console.log('field.rows',field.rows)
      if (field.type === 'grid' && field.rows) {
        // Manejar la inicialización de los valores dentro de la grilla
        initialValues[field.name] = field.rows.map(row => {
          const rowValues: { [key: string]: any } = {};
          field.columns?.forEach((column) => {
            rowValues[column.name] = row[column.name] !== undefined ? row[column.name] : '';
          });
          return rowValues;
        });
      } else {
        // Manejar campos escalares normales
        initialValues[field.name] = field.value !== undefined ? field.value : '';
      }
    });
  } else {
    console.warn('No fields found in formData.');
    console.log('formData:', formData);
  }

  //console.log('initialValues',initialValues)
  return initialValues;
};
