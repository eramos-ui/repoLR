//para construir los valores iniciales del formulario dinámico 
import { FormFieldDFType } from "@/types/interfaceDF";

export const buildInitialValues = (
  fields: FormFieldDFType[],
  row: Record<string, any> = {}
): Record<string, any> => {
  const initial: Record<string, any> = {};
  initial['_id']=undefined;
  // console.log('en buildInitialValues fields',fields)
  // console.log('en buildInitialValues row',row)
  fields.forEach(field => {
    const fieldName = field.name;
    // Usa el valor de `row` si existe (modo edición)
    if (row.hasOwnProperty(fieldName)) {
      switch (field.type) {//se revisa el formato que viene de la grilla para que funcione CustomDate
        case "date":
          if ( field.format === "dd-MM-yyyy HH:mm"){
            initial[fieldName] = row[fieldName].replace(',','') .replace(/\s*hrs?\.?$/i, '').trim();  //elimina ',' y 'hrs.'
            // console.log('en buildInitialValues field,row date',field,row[fieldName],initial[fieldName])
            break;
          }
          initial[fieldName] = row[fieldName];
          break
        default:
          initial[fieldName] = row[fieldName];//el valor viene en la row que se edita
      }
    } else {
      // Si no, define un valor por defecto según tipo
      switch (field.type) {
        case "number":
          // console.log('en buildInitialValues number',(!field.value || field.value === ''));
          initial[fieldName] = (!field.value || field.value === '') ? Number(0) : Number(field.value);
          // console.log('en buildInitialValues number',initial[fieldName]);
          break
        case "selectNumber":
          // console.log('********buildInitialValue field',field)
          initial[fieldName] = (field.value)?field.value:0;
          break;
        case "select":
        case "text":
        case "email":
        case "RUT":
        case "input":
        case "textarea":          
          initial[fieldName] = field.value;
          break;
        case "date":
          // console.log('en buildInitialValue date',field)
          initial[fieldName] = null;
          break;
        // case "checkbox":
        //   initial[fieldName] = false;
        //   break;
        case "boolean":
          console.log('en buildInitialValues boolean',field)          
          initial[fieldName]= true;
          break;
        default:
          initial[fieldName] = "";
      }
    }
  });
  // console.log('en buildInitialValues',initial);
  return initial;
};
