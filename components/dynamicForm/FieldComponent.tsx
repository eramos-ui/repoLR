import { FormFieldDFType } from "@/types/interfaceDF"; 
   

import { CustomFileInput,  CustomInput, CustomSelect } from "@/components/controls";
      
//import { fetchOptionsFromDatabase } from '@/utils/fetchOptionsFromDatabase';
import { useEffect, useState } from "react";
import { LoadingIndicator } from "../general/LoadingIndicator";

interface Option {
  value: string | number;
  label: string;
}
//******NO SE  USA*****
//Este componente distribuye, para cada columna de la grilla, los diferentes custom control del formulario dinámico
export const FieldComponent: React.FC<{ field: FormFieldDFType, row:any,
       handleChangeRow: (values:any | any[] ,fieldName:string, options: { value: string | number; label: string }[] | undefined) => void, 
       theme:string }> = 
      ({ field, row, handleChangeRow, theme }) => {//theme es el del form (dark, light)
  //console.log('en FieldComponent row',row);  
  const [ datosSelect, setDatosSelect ]         = useState<Option[]>(); // Estado local para las opciones
  const [ loading, setLoading ]                 = useState(false);

  const { type, label, name, visible, autoComplete, options, width,  spFetchOptions,  rows,
     //placeholder,format, columns, actions,  rowHeight, gridWidth, conditionalStyles, editFormConfig, columnWidths, 
     //registroInicialSelect, titleGrid, labelGridAdd,  spFetchRows, spFetchSaveGrid, objectGrid,
     dependentValue,...props} = field;

    // const tailwindWidth = width ? `w-${Math.round((parseFloat(width) / 100) * 12)}/12` : 'w-full';
    // let selectOptions: {value: string | number; label: string }[] = options || [];
    // // export type InputType = 'text' | 'input' | 'email' | 'select' | 'password' | 'date' | 'checkbox' |'textarea' | 'readonly'
    //     | 'number' | 'file' | 'radio' | 'slider' | 'range' |'toggle' | 'grid' | 'multiselect'| 'autocomplete' |'rut' |'sin';
    // let staticOptions:{ id: string | number; label: string }[];
    //console.log('FieldComponent field',field);
    const dependentValues='';
    //let staticOptions:StaticOptions[];
    let staticOptions: { value: string | number; label: string }[] = options || [];
    // if (options && options.length>0 && (type ==='select' || type==='multiselect') ){
    //   setDatosSelect(options);
    // }
    if (spFetchOptions && spFetchOptions.length>0 && type  ==='select'){//resuelve las options cuando es sp 

  }
  const fieldName=field.name;
  useEffect(() => {//resuelve antes de enviar a CustomSelect las opciones si son dinámicas vía sp
    if (!spFetchOptions || !(type ==='select' || type==='multiselect')  ) return;
    const fetchOptions = async () => {
      setLoading(true);
      try {
        const [spName, params] = spFetchOptions.split('(');// Se extrae del nombre del SP y los parámetros de la cadena spFetchOptions
        if (!params || params.trim() === ')') {// Si no hay parámetros, simplemente se ejecuta el SP
          const response = await fetch('/api/execSP', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              storedProcedure: spName,
              parameters: {},
            }),
          });          
          if (response.ok) {
            const data = await response.json();
            const formattedOptions = data.map((item: any) => ({
              value: item.value, // Ajustar estos campos según el resultset
              label: item.label, // Ajustar estos campos según el resultset
            }));
            setLoading(false);
            setDatosSelect( formattedOptions);
          } else {
            console.error('Error al obtener las opciones');
          };
          setLoading(false);
        }
        // const parameterNames = params.replace(')', '').split(',').map((param) => param.trim().replace('@', ''));
        
        // const parameters = parameterNames.reduce((acc, paramName) => {// Crear un objeto con los valores de los parámetros usando sus nombres reales
        //   acc[`@${paramName}`] = dependentValue;
        //   return acc;
        // }, {} as Record<string, any>);
        // const response = await fetch('/api/execSP', {// Realizar la solicitud a la API de un select con sp
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({
        //     storedProcedure: spName,
        //     parameters,
        //   }),
        // });
        // if (response.ok) {
        //   const data = await response.json();
        //   const formattedOptions = data.map((item: any) => ({//todos los sp deben devolver un seultset con id,label
        //     value: item.value, // Ajusta estos campos según tu resultset
        //     label: item.label, // Ajusta estos campos según tu resultset
        //   }));
        //   setLoading(false);
        //   return formattedOptions;
        // } else {
        //   console.error('Error al obtener las opciones');
        // }
      } catch (err) {
        console.error('Error fetching options:', err);
      } 
      setLoading(false);
      
    };
     fetchOptions();
     //console.log(' en useEffect spFetchOptions, dependentValue',spFetchOptions, dependentValue);
  }, [spFetchOptions, dependentValue,type]);
  if (loading) <LoadingIndicator />

  // const handleSelectChange=(newValue:string | string[])=>{
  //   const newRow={...row, [field.name]: newValue};
  //   // console.log('handleSelectChange row',newValue,row,field.name);
  //   // console.log('handleSelectChange newRow',newRow);
  //   setRow(newRow);
  // } 
    //if (type ==='grid') console.log( JSON.stringify(field, null, 2));
  // if (type  ==='select') console.log('FieldComponent type field', type,field);
  // if (field.name  ==='name') console.log('FieldComponent type field', field.name,type,field);
    switch (type) {
      case 'input':
      case 'text':
      case 'password':
      case 'email':
         //console.log(' en FieldComponent field' ,field );
         return <CustomInput label={label}  width={width} value={(typeof field.value === 'string' || typeof field.value === 'number')? field.value:''}
              type={(type ==='text' || type ==='input')?'text':type} onChange={(e)=>handleChangeRow(e.target.value,fieldName,staticOptions)}
         />
      case 'select':
        //console.log('staticOptions,staticOptions',type,label,field?.value);
        const dataSelect=(options && options.length>0 )?staticOptions : datosSelect;
        return (
          dataSelect &&
          <CustomSelect label={label}  width= {field.width } options={dataSelect} value={String(field?.value)}
              onChange={(value)=>handleChangeRow(value,fieldName,dataSelect)}
          />
        )
       case 'multiselect'://falta probar
       return (
        staticOptions &&
        <CustomSelect label={label}  width= {field.width } options={staticOptions} multiple={true} 
            value={String(field?.value)} //es un array de string
            onChange={(values)=>handleChangeRow(values,fieldName,staticOptions)}
        />)

      case 'number':
        return <CustomInput label={label}  width={width} type='number' visible={visible} value={(typeof field.value === 'number')?field.value:''}
        onChange={(e)=>handleChangeRow(e.target.value,fieldName,staticOptions)}
        />
      case 'RUT':
        return <CustomInput label={label}  width={width}  visible={visible} value={(typeof field.value === 'string' || typeof field.value === 'number')?field.value:''} 
                type='RUT' onChange={(e)=>handleChangeRow(e.target.value,fieldName,staticOptions)}
               />

      case 'file'://probar
        return <CustomFileInput label={label} name={name}  width={width}  accept={".img, .jpg, .png"}  />;

      default:
        throw new Error(`El type: ${type} no es soportado`);
    }
  };