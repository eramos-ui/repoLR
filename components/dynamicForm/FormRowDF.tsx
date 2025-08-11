"use client";
import { useState } from 'react';
import { FormFieldDFType } from '@/types/interfaceDF';
import { FieldComponent } from './FieldComponent';
import { useFormikContext } from 'formik';
import { GridColumnDFType } from '@/types/interfaceDF';

interface FormRowProps {
  fields: FormFieldDFType[];
  theme:string;
  row:any;
  handleChangeRow: (values:any,name:string, options: { value: string | number; label: string }[] | undefined) => void;
  columns:GridColumnDFType[];
  maxWidth?:string;
  width?:string;

}
//******NO SE USA*****
//renderiza los fields de c/fila del form dynamic (vía fields -formato- y allValues). Para ello utiliza el FieldComponent
export const FormRowDF: React.FC<FormRowProps> = 
  ({ fields, width, theme, row, handleChangeRow, columns }) => {  
  console.log('en FormRow row',row);
  // console.log('en FormRow fields',fields);
  const { values, setFieldValue }                   = useFormikContext<any>(); 
  //console.log('FormRow values',values);
  let newFields:FormFieldDFType[]=fields.map( (field:FormFieldDFType) =>{ //revisa si hay select con nested values, x ahora sólo acepta 1
    const name=field.name;
    if (field.spFetchOptions?.includes('@')) {
        const fieldNested=field.spFetchOptions.split ('@')[1].split(')')[0];//soporta sólo 1 parámetro
        const fieldNestedValue=row[fieldNested];
        return {...field, dependentValue:fieldNestedValue, value:row[field.name]} 
    }
    return {...field, value:row[name] }; //
  });
 
  //const [ dependentValues, setDependentValues ] =useState<any>(2);
  const groupedFields = newFields.reduce((acc, field, width) => {
    if (!acc[field.row]) {
      acc[field.row] = [];
    }
    acc[field.row].push(field);
    return acc;
  }, {} as { [key: number]: FormFieldDFType[] });
/*
   const handleChangeRow=(valueChanged:any,name:string) =>{
    const newRow={...row, [name]: valueChanged};
    setRow(newRow);
    // console.log('FormRow handleChangeRow values',values);
    console.log('FormRow handleChangeRow newRow',newRow,columns);






    const newRows=values.items.map((rw:any)=>{
      if (row.id===rw.id){
        rw[name]=valueChanged;
        return rw;
      }
      return rw;
    });
    // console.log('FormRow handleChangeRow newRows',newRows);
    setFieldValue('items',newRows);
   }
   */
  return (
    <> 
     { Object.keys(groupedFields).map(item => {
      if (!item) return null;
      // console.log('en JSX FromRow  row',row);
      return (
        <div 
           className={`flex flex-wrap -mx-2 mb-4 w-[${width}]`} 
           key={ item }           
        >
          {groupedFields[Number(item)].map(field => {
            //  console.log('en JSX  key',field,`${row}-${field.name}`);
           return ( 
            <div  key={`${item}-${field.name}`} className={`px-2`}  >
              <FieldComponent field={field} theme={theme} handleChangeRow={handleChangeRow} row={row} />
            </div> )
          })}
        </div>
      );
     })}
    </>
  );
 }
;
