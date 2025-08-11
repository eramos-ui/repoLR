import * as Yup from 'yup';
import { FormFieldDFType } from '@/types/interfaceDF';
import { validateRut } from '@/utils/validateRut';

const looksLikeFile = (x: any): x is { size: number; type: string; name: string } =>
  x && typeof x === 'object' &&
  typeof x.size === 'number' &&
  typeof x.type === 'string' &&
  typeof x.name === 'string';

// 🔹 Función para generar validaciones dinámicas con Yup
export const getValidationSchemaDynamicForm = (fields: FormFieldDFType[]) => {
  const schema: Record<string, Yup.AnySchema> = {};
  // console.log('getValidationSchemaDynamicForm',fields);
  fields.forEach((field, index) => {

    let fieldSchema : Yup.AnySchema = Yup.mixed();
    // Base schema según tipo
    switch (field.type) {
      case 'email':
        // console.log('email 1',field)
        fieldSchema = Yup.string();
        break;
      case 'text':
      case 'RUT':
      case 'input':
      case 'textarea':
        fieldSchema = Yup.string();
        break;
      case 'number':
        fieldSchema  = Yup.number();
        break;
      case 'date':
        const requiredRuleDate = field.validations?.find(v => v.type === "required");
        const requiredMessageDate = requiredRuleDate?.message || "Debe ingresar una fecha";
        fieldSchema = Yup.mixed()
        .transform((value, originalValue) => {
          // Si ya es Date lo dejamos
          if (value instanceof Date) return value;
          // Si es string tipo "dd-mm-yyyy", lo convertimos
          if (typeof originalValue === 'string') {
            const [day, month, year] = originalValue.split('-');
            const parsed = new Date(`${year}-${month}-${day}`);
            return isNaN(parsed.getTime()) ? originalValue : parsed;
          }
          return originalValue;
        })
        .test("is-date", "Fecha inválida", (value) => {
          return value instanceof Date && !isNaN(value.getTime());
        });
    
        if (requiredRuleDate) {
          fieldSchema = fieldSchema.required(requiredMessageDate);
        }
        break;
        case 'multiselect':
        {
          const requiredRuleMS = field.validations?.find(v => v.type === 'required');
          const requiredMessageMS = requiredRuleMS?.message || 'Seleccione al menos una opción';
         
          // Conjunto de opciones válidas (si son estáticas)
          const allowed = new Set(
            (field.options ?? []).map(opt => String(opt.value))
          );

          // Esquema de array, normalizando el valor
          let arrSchema = Yup.array()
            .transform((curr, orig) => {
              // Normaliza: undefined/null -> [], string -> [string], array -> array<string>
              if (Array.isArray(orig)) return orig.map(String);
              if (typeof orig === 'string') return orig ? [orig] : [];
              return [];
            })
            .of(Yup.string())
            // Validar que las seleccionadas existan en options (si no es dinámico)
            .test('multiselect-options', 'Opción inválida', (arr) => {
              if (!arr || arr.length === 0) return true; // lo maneja "required" (si existe)
              // Si hay opciones dinámicas cargadas, no validamos pertenencia aquí
              if (field.apiOptions && field.apiOptions.length > 0) return true;
              if (allowed.size === 0) return true; // sin opciones para validar, lo dejamos pasar
              return arr.every(v => allowed.has(String(v)));
            });

          // Si el campo es requerido, al menos 1 seleccionado
          if (requiredRuleMS) {
            arrSchema = arrSchema.min(1, requiredMessageMS);
          }

          fieldSchema = arrSchema as unknown as Yup.AnySchema;
          break;
        }
      case 'file': {
          // Reglas opcionales que puedes pasar en field.validations
          // required: { type:'required', message:'...' }
          // accept: { type:'accept', value:'application/pdf,image/png,image/jpeg', message:'...' }
          // maxFileSizeMB: { type:'maxFileSizeMB', value:25, message:'...' }
          // maxFiles: { type:'maxFiles', value:5, message:'...' }
          //console.log('en getValidationSchemaDynamicForm file', field)
          const isMultiple = !!field.multiple; // si tu definición de campo lo trae
          const reqRule = field.validations?.find(v => v.type === 'required');
          const reqMsg = reqRule?.message || (isMultiple ? 'Debe adjuntar al menos un archivo' : 'Debe adjuntar un archivo');
        
          const acceptRule = field.validations?.find(v => v.type === 'accept');
        
          const acceptList = acceptRule?.value
            ? String(acceptRule.value).split(',').map(s => s.trim())
            : []; // ej: "application/pdf,image/png,image/jpeg"
          const sizeRule = field.validations?.find(v => v.type === 'maxFileSizeMB');
          const maxBytes = sizeRule?.value ? Number(sizeRule.value) * 1024 * 1024 : undefined;
        
          const maxFilesRule = field.validations?.find(v => v.type === 'maxFiles');
          const maxFiles = maxFilesRule?.value ? Number(maxFilesRule.value) : undefined;
        
          // Helper para comparar tipo MIME aceptado (soporta "image/*")
          const matchesAccept = (mime: string) => {
            if (!acceptList.length) return true;
            return acceptList.some(a =>
              a === mime || (a.endsWith('/*') && mime.startsWith(a.slice(0, -1)))
            );
          };
        
          if (isMultiple) {
            // ---------- MÚLTIPLE ----------
            let arrSchema = Yup.array()
              .transform((curr, orig) => {
                // Normaliza: FileList -> File[], File -> [File], string/obj (id existente) -> [string/obj]
                if (orig == null) return [];
                if (Array.isArray(orig)) return orig;
                if (typeof FileList !== 'undefined' && orig instanceof FileList) return Array.from(orig);
                if (typeof File !== 'undefined' && orig instanceof File) return [orig];
                if (typeof orig === 'string') return orig ? [orig] : [];
                if (typeof orig === 'object') return [orig];
                return [];
              })
              .of(Yup.mixed());
        
            if (reqRule) {
              arrSchema = arrSchema.min(1, reqMsg);
            }
        
            // Validación de tipos MIME (solo aplica a File; ignora strings/ids existentes)
            if (acceptList.length) {
              arrSchema = arrSchema.test(
                'file-type',
                acceptRule?.message || 'Tipo de archivo no permitido',
                (value?: unknown) => {
                  const arr = Array.isArray(value) ? value : [];
                  return arr.every(f => !looksLikeFile(f) || matchesAccept(f.type));
                }
              );
            }
        
            // Tamaño máximo por archivo
            if (maxBytes) {
              arrSchema = arrSchema.test(
                'file-size',
                sizeRule?.message || `El archivo excede ${sizeRule?.value} MB`,
                (value?: unknown) => {
                  const arr = Array.isArray(value) ? value : [];
                  return arr.every(f => !looksLikeFile(f) || f.size <= maxBytes);
                }
              );
            }
        
            // Máximo de archivos
            if (maxFiles) {
              arrSchema = arrSchema.max(maxFiles, maxFilesRule?.message || `Máximo ${maxFiles} archivos`);
            }
        
            fieldSchema = arrSchema as unknown as Yup.AnySchema;
          } else {
            // ---------- SIMPLE ----------
            let singleSchema = Yup.mixed()
              .nullable()
              .transform((curr, orig) => {
                // Mantén File | string (id/URL) | null
                if (orig == null || orig === '') return null;
                return orig;
              });
        
            if (reqRule) {
              singleSchema = singleSchema.test('required-file', reqMsg, (val: any) => !!val);
            }
        
            if (acceptList.length) {
              singleSchema = singleSchema.test('file-type', acceptRule?.message || 'Tipo de archivo no permitido', (val: any) => {
                if (!val) return true;
                if (typeof File !== 'undefined' && val instanceof File) return matchesAccept(val.type);
                return true; // Si es string/id existente, se acepta
              });
            }
        
            if (maxBytes) {
              singleSchema = singleSchema.test('file-size', sizeRule?.message || `El archivo excede ${sizeRule?.value} MB`, (val: any) => {
                if (!val) return true;
                if (typeof File !== 'undefined' && val instanceof File) return val.size <= maxBytes;
                return true;
              });
            }
        
            fieldSchema = singleSchema as unknown as Yup.AnySchema;
          }
        
          break;
        }
          
      case 'select': 
      //console.log('en getValidationSchemaDynamicForm para select',field)
      break;
      case 'selectNumber': {
      // console.log('en getValidationSchemaDynamicForm para selectNumber',field)
      // 📌 Validar selects con opciones estáticas
        // 📌 Buscar el mensaje personalizado para 'required' (si existe)
        const requiredRule = field.validations?.find(v => v.type === "required");
        const requiredMessage = requiredRule?.message || "Debe seleccionar una opción";
        fieldSchema = Yup.string()
        .required(requiredMessage) // 📌 Asegura que no sea vacío o null
        //.nullable()
        .test("validate-select", requiredMessage, (value) => {//.test("nombreDelTest", "mensajeDeError", (value) => {funciónDeValidación}) //true es válido
          // console.log('validate-select',field.options,field.apiOptions);
          // Si tiene opciones predefinidas, validar que esté en ellas
          if (field.options && field.options.length > 0) {
            return field.options.some(opt => String(opt.value) === String(value));
          }
          // Si es dinámico, no validar hasta que tenga opciones cargadas
          if (field.apiOptions && field.apiOptions.length > 0) return true;
          return false;
        });     
        // 📌 Validar que el valor sea mayor que 0 si la regla está definida
        const greaterThanRule = field.validations?.find(v => v.type === "valueGreaterThanZero");
        if (greaterThanRule) {
          fieldSchema = fieldSchema.test(
            "value-greater-than-zero",
            greaterThanRule.message || "El valor debe ser mayor que 0",
            (value) => Number(value) > 0
          );
        }
        break;
      }
      case 'boolean':{
      //  console.log('en validationSchema boolean',field)   
      }
    }
    // Validación especial para RUT
    
    if (field.type === "RUT" && field.validations) {
      // console.log('field',field)
      fieldSchema = Yup.string()
        .required("El RUT es obligatorio")
        .test(
          "rut-format",
          "Formato incorrecto de RUT",
          (value) => {
            if (!value) return false;
            return validateRut(value); // 👈 tu función booleana
          }
        )
    }
  // console.log('Aplica rules field.validations',field.validations)
    field.validations?.forEach((rule) => {    // 🔹 Agregar validaciones según el esquema definido en la BD-json
      // console.log('rule',rule)
      switch (rule.type) {
        case "required":
          fieldSchema  = fieldSchema .required(rule.message || "Este campo es obligatorio");
          break;
        case "maxLength":
          fieldSchema  = (fieldSchema  as Yup.StringSchema).max(Number(rule.value!), rule.message || `Máximo ${rule.value} caracteres`);
          break;
        case "minLength":
          fieldSchema  = (fieldSchema  as Yup.StringSchema).min(Number(rule.value!), rule.message || `Mínimo ${rule.value} caracteres`);
          break;
        case "email":
          // console.log('email 2',rule)
          fieldSchema  = (fieldSchema  as Yup.StringSchema).email(rule.message || "Debe ser un correo válido");
          break;
        case "pattern":
          const regex = new RegExp(rule.value as string); // 📌 Convierte el string en RegExp
          fieldSchema  = (fieldSchema  as Yup.StringSchema).matches(regex, rule.message || "Formato inválido");
          break;
        case "url":
          fieldSchema  = (fieldSchema  as Yup.StringSchema).url(rule.message || "Debe ser una URL válida");
          break;
        case "min":
          fieldSchema  = (fieldSchema  as Yup.NumberSchema).min(Number(rule.value!), rule.message || `Mínimo valor permitido: ${rule.value}`);
          break;
        case "max":
          fieldSchema  = (fieldSchema  as Yup.NumberSchema).max(Number(rule.value!), rule.message || `Máximo valor permitido: ${rule.value}`);
          break;
        case "conditionalRequired":
            const dependeDe = rule.field;
            const valores = Array.isArray(rule.value) ? rule.value : [rule.value];
            if (!dependeDe || valores.length === 0) {
              console.warn(`⚠️ Falta 'field' o 'value' en la validación conditionalRequired para ${field.name}`);
              break;
            }
            fieldSchema = (fieldSchema as Yup.StringSchema)
            .transform((curr, orig) => orig === undefined ? '' : curr)
            .test(
              "conditional-required",
              rule.message || `${field.label} es obligatorio`,
              function (value) {
                const { [dependeDe]: dependeValue } = this.parent;
                const debeValidar = valores.map(String).includes(String(dependeValue));

                if (!debeValidar) return true;
                const isValid = value !== undefined && value !== null && value !== '';
                
                //console.log(`🔄 Evaluando "${field.name}":`, { dependeValue, debeValidar,  value, isValid,path:this.path });
                if (!isValid) {
                  return this.createError({
                    path: this.path,//field.name
                    message: rule.message || `${field.label} es obligatorio`,
                  });
                }          
                return true;             
              }
            );
            break;
      }
    });
      // Validación condicional: requiredIf
    if (field.requiredIf && typeof field.requiredIf?.field === 'string' 
        &&  ["string", "number", "boolean"].includes(typeof field.requiredIf.equal) 
      ) {
       const { field: dependsOn, equal } = field.requiredIf;
       fieldSchema = Yup.string().when(dependsOn, {
       is: (val: any) => val === equal,
       then: schema => schema.required(`${field.label} es obligatorio cuando ${dependsOn} es ${equal}`),
       otherwise: schema => schema.notRequired(),
      });
    }
    schema[field.name] = fieldSchema;
  });
  //console.log('schema',schema);
  return Yup.object().shape(schema);
};


// const buildValidationSchema = (fields: FormFieldDFType[]): { [key: string]: Yup.MixedSchema } => {
//   const schemaFields: { [key: string]: Yup.MixedSchema } = {};

//   fields.forEach((field) => {
//     if (!field.validations) return;
//     let schema: Yup.MixedSchema = Yup.mixed(); 

//     field.validations.forEach((rule) => {
//       console.log('rule',field.name,rule.type);
//       switch (rule.type) {
//         case 'required':
//           schema = schema.required('Este campo es requerido');
//           break;
//         case 'minLength':
//           if (typeof rule.value === 'number') {
//            //schema = (schema as Yup.StringSchema).min(rule.value, `Mínimo de ${rule.value} caracteres`);
//            schema = (Yup.string().min(rule.value, `Mínimo de ${rule.value} caracteres`) as unknown) as Yup.MixedSchema;
//           }
//           break;
//         case 'email':
//           //schema = (schema as Yup.StringSchema).email('El correo no tiene un formato válido');
//           console.log('en validationSchema email',field.name,rule);
//           schema = (Yup.string().email('El correo no tiene un formato válido') as unknown) as Yup.MixedSchema;
          
//           break;
//         case 'minDate':
//           if (typeof rule.value === 'string') {
//             //schema = (schema as Yup.DateSchema).min(new Date(rule.value), rule.message || `La fecha debe ser después de ${rule.value}`);
//             schema = (Yup.date()
//             .transform((value, originalValue) => {
//               if (typeof originalValue === 'string') {
//                 const parsedDate = parse(originalValue, 'dd/MM/yyyy', new Date());
//                 if (isDate(parsedDate) && !isNaN(parsedDate.getTime())) {
//                   return parsedDate;
//                 }
//               }
//               return value;
//             })
//             .min(new Date(rule.value), rule.message || `La fecha debe ser después de ${rule.value}`) as unknown) as Yup.MixedSchema;
//           }
//           break;
//         case 'maxDate':
//           if (typeof rule.value === 'string') {
//             //schema = (schema as Yup.DateSchema).max(new Date(rule.value), rule.message || `La fecha debe ser antes de ${rule.value}`);
//             schema = (Yup.date()
//             .transform((value, originalValue) => {
//               if (typeof originalValue === 'string') {
//                 const parsedDate = parse(originalValue, 'dd/MM/yyyy', new Date());
//                 if (isDate(parsedDate) && !isNaN(parsedDate.getTime())) {
//                   return parsedDate;
//                 }
//               }
//               return value;
//             })
//             .max(new Date(rule.value), rule.message || `La fecha debe ser antes de ${rule.value}`) as unknown) as Yup.MixedSchema;
//            }          
//           break;
//       }
//     });
//     if (field.type === 'date') {
//       schema = schema.transform((value, originalValue) => {
//         if (typeof originalValue === 'string') {
//           const parsedDate = parse(originalValue, 'dd/MM/yyyy', new Date());
//           if (isDate(parsedDate) && !isNaN(parsedDate.getTime())) {
//             return parsedDate;
//           }
//         }
//         return value;
//       });
//     }

//     schemaFields[field.name] = schema;
//   });

//   return schemaFields;
// };

