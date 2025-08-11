import { FormFieldDFType } from "@/types/interfaceDF"; 
//import { FormikErrors, FormikTouched  } from "formik";

import { CustomFileInput,  CustomInput, CustomSelect, CustomDate, CustomLabel } from "@/components/controls";
      
import { useState } from "react";
import { LoadingIndicator } from "../general/LoadingIndicator";
import { FieldWrapper } from "./FieldWrapper";


interface Option {
  value: string | number;
  label: string;
}
interface FieldComponentDFProps {
  field: FormFieldDFType;
  values: any;//una fila de la grilla
  setFieldValue: (fieldName: string, value: any) => void;
  // touched: FormikTouched<any>;
  // errors: FormikErrors<any>;
  theme: string;
}
/*Este componente distribuye, para cada columna de la grilla, los diferentes custom control del formulario dinámico 
y aplica lógica condicional a través de requiredIf
*/
export const FieldComponentDF: React.FC<FieldComponentDFProps> = ({ field, values, setFieldValue, // errors, 
    // touched, 
    theme }) => {
  // if (field.name === 'monto') 
  //  console.log('en FieldComponentDF field',field);  
  // const [ datosSelect, setDatosSelect ]         = useState<Option[]>(); // Estado local para las opciones
  const [ loading, setLoading ]                 = useState(false);

  const { type, label, name, visible, autoComplete, options, width,  apiOptions,  rows,
     dependentValue,requiredIf,...props} = field;
  // 👇 Visibilidad condicional   
  let isVisible = field.visible ?? true;
  let isRequired = field.validations?.some(v => v.type === "required");
  
  if (requiredIf && requiredIf.field) {//
    // console.log('en FieldComponentDF requiredIf',requiredIf.equal);
    const dependeDeValor = values[requiredIf.field];
    const coincide = String(dependeDeValor) === String(requiredIf.equal);
    isVisible = coincide;       // Si no coincide, oculta
    isRequired = coincide;      // Si coincide, lo hace requerido
  }
  if (!isVisible) return null;
  const commonProps = {
    label: field.label,
    name: field.name,
    value: values[field.name],
    autoComplete: field.autoComplete,
    onChange: (e: any) => {
      let x=e.target?.value ?? e;
      if (field.type === 'selectNumber')  x=Number(x); //convierte a number si es selectNumber
      setFieldValue(field.name, x);
    },
    // error: touched[field.name] && errors[field.name] ,
    theme: 'light' as const,
    required: isRequired,
    placeholder: field.placeholder,
    style: { width: field.width ?? '100%' },
    width: field.width ?? '100%',
    formatNumber: field.formatNumber,
    validations:field?.validations,
    
  };
  
   //const errorMessage = errors[name] ? String(errors[name]) : undefined;// función para Obtener error de este campo
  //  const errorMessage = touched[field.name] && errors[field.name];// función para Obtener error de este campo

   //const isTouched    = touched[name]; // función para Verificar si el campo ha sido tocado   

  const fieldName=field.name;
//   if (fieldName.includes('rut'))  console.log('en FieldComponentDF field',type,fieldName,errorMessage, isTouched );

    let staticOptions: { value: string | number; label: string }[] = options || [];
    // console.log('en FieldComponentDF staticOptions',staticOptions,field.apiOptions);
    if (field.apiOptions && field.apiOptions.length>0 && type  ==='selectNumber'){//resuelve las options cuando es sp 
  }
  if (loading) <LoadingIndicator />
 //if (field.name === 'rut') { console.log('en FieldComponentDF field',type,field,fieldName,errors?.rut, touched?.rut )};
  // console.log('en FieldComponentDF field',field,isVisible);
  //'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search' | 'color' | 'file' | 'RUT'
  // console.log('en FieldComponentDF field',field);
  switch (field.type) {//Eliminado <Field> para menor abstracción, el <Field es un wrapper de Formik que conecta AUTOMATICAMENTE: values, errors, touched...
    case 'input':
      return(
        <FieldWrapper name={name}>
          <CustomInput {...commonProps} maxLength={field.inputProps?.maxLength} minLength={field.inputProps?.minLength} type="text" />
        </FieldWrapper>
      )
    case 'textarea':
      console.log('textarea', field)
      return(
        <FieldWrapper name={name}>
          <CustomInput {...commonProps} multiline={true} maxLength={field.inputProps?.maxLength} minLength={field.inputProps?.minLength} type="text" />
        </FieldWrapper>
      )
    case 'url':
        return(
          <FieldWrapper name={name}>
            <CustomInput {...commonProps} maxLength={field.inputProps?.maxLength} minLength={field.inputProps?.minLength} type="url" />
          </FieldWrapper>
        )  
    case 'password':
        return(
          <FieldWrapper name={name}>
            <CustomInput {...commonProps} type="password" width={width}/>
          </FieldWrapper>
        )
    case 'select':
      return(
        <FieldWrapper name={name}>
          <CustomSelect {...commonProps} options={field.options || []} />
        </FieldWrapper>
      )
    case 'multiselect':
        // console.log('en FieldDocumentDF field multiselect',field)
        return(
           <FieldWrapper name={name}>
            <CustomSelect {...commonProps} options={field.options || []} multiple={true} maxHeight={field.maxHeight} overflowY={field.overflowY} 
            style={field.style}
            />
           </FieldWrapper>
        )
    case 'selectNumber':
      // console.log('en FieldDocumentDF field selectNumber',field)
      // return <CustomSelect {...commonProps} options={field.options || []} />;
      return(
        // <FieldWrapper name={name}>
          <CustomSelect {...commonProps} options={field.options || []} />
        // </FieldWrapper>
      )
    case 'text':
      return(
        <FieldWrapper name={name}>
          <CustomInput {...commonProps} maxLength={field.inputProps?.maxLength} minLength={field.inputProps?.minLength} type="text" />
        </FieldWrapper>
      )
    case 'email':
      // return <CustomInput {...commonProps} type="email" />;
      return(
        <FieldWrapper name={name}>
          <CustomInput {...commonProps} type="email" />
        </FieldWrapper>
      )
    case 'number':
      //  console.log('en FieldComponentDF number',commonProps,values[field.name]);
      //return <CustomInput {...commonProps}  type="number" />;
      return(
        <FieldWrapper name={name}>
          <CustomInput {...commonProps}  type="number" />
        </FieldWrapper>
      )
    case 'RUT':
      // return <CustomInput {...commonProps} type="RUT" />;
      return(
        <FieldWrapper name={name}>
          <CustomInput {...commonProps} type="RUT" />
        </FieldWrapper>
      )
    case 'date': 
    // console.log('field date',field);
    // console.log('commonProps date',commonProps);          
      return(
        <FieldWrapper name={name}>
          <CustomDate {...commonProps} withTime={field.withTime} timeIntervals={field.timeIntervals} format={field.format} />
        </FieldWrapper>
      )
    case 'file'://falta probar
       return(
        <FieldWrapper name={name}>
            <CustomFileInput {...commonProps} accept={field.accept as string} 
              putFilenameInMessage={true}                      
              onUploadSuccess={(file: File | null) => {
                if (file) {
                    // console.log(`📂 Archivo subido :`, file.name,file);
                    setFieldValue(field.name, file );
                }
              }}
             />
          </FieldWrapper>
          )
    case 'label'://hay opción de que venga en field el value, que expluye el label, que sólo venga el labe o que value sea un field de value (value=`${...}`)
       let label=(field.label)?field.label?.toString():'';
       if (field.value?.toString().includes('${')){
              if (values[field.name] && values[field.name].length>0){
                  label=label+': '+ values[field.name]; 
              }
        }else{
          if (field.value && field.value.toString().length>0){
            label=field.value.toString();
          }
        }
      return(
        <FieldWrapper name={name}>
          <CustomLabel {...commonProps} label={label} size={field.size as 'normal' | 'h1' | 'h2' | 'h3'  | 'normal+'} />
        </FieldWrapper>
      )
    default:
       return <CustomInput {...commonProps} type="text" />;
  }
};
