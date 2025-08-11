// le pone '' a los campos que son string y no tienen valor para que opere la validationSchema

import { FormFieldDFType } from "@/types/interfaceDF";

export const normalizeStringValues = (values: Record<string, any>, fields: FormFieldDFType[]): Record<string, any> => {
    const fixedValues = { ...values };
  
    fields.forEach(field => {
      const isStringType = ['text', 'input', 'textarea', 'RUT', 'email'].includes(field.type);
      if (isStringType && (fixedValues[field.name] === undefined || fixedValues[field.name] === null)) {
        fixedValues[field.name] = '';
      }
    });
  
    return fixedValues;
  }