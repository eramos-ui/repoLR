import React from 'react';
//import { Formik, Form, Field } from 'formik';
// import { getValidationSchemaDynamicForm } from '@/utils/validationSchema';
//import { FormConfigType, FormValues } from '@/types/interfaces';
import { CustomButton } from '../controls';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk,  faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FormRowDF } from './FormRowDF';
import { FormConfigDFType, FormFieldDFType, FormValuesDFType, GridColumnDFType } from '@/types/interfaceDF';
// import { getValidationSchemaDynamicForm } from '@/utils/validationSchema';

//******NO SE  USA*****
const EditFormFields: React.FC<{
  formConfig: FormConfigDFType;
  fields: FormFieldDFType[];
  row: FormValuesDFType;//son los valores de la fila que se edita 
  //setRow: (values:any[]) => void;//actualizar la fila
  handleChangeRow: (values:any, name:string, options: { value: string | number; label: string }[] | undefined) => void;
  columns:GridColumnDFType[];
  //updateTable: (values: any) => void;
  onClose: () => void;
  theme: 'light' | 'dark';

}> = ({ formConfig, fields, row, handleChangeRow, columns, onClose, theme }) => {
  // const validationSchema = getValidationSchemaDynamicForm(fields);
  // console.log('en EditFormFields validationSchema',fields,validationSchema);
   //console.log('en EditFormField values',row);
  // const fieldsFull={...formConfig.fields,value: }
  // const handleChangeRow=(valueChanged:any,name:string) =>{
  //   const newRow={...row, [name]: valueChanged};
  //   //setRow(newRow);
  //   // console.log('FormRow handleChangeRow values',values);
  //   console.log('EditFormFields handleChangeRow newRow',newRow,columns);

    // const newRows=values.items.map((rw:any)=>{
    //   if (row.id===rw.id){
    //     rw[name]=valueChanged;
    //     return rw;
    //   }
    //   return rw;
    // });
    // console.log('FormRow handleChangeRow newRows',newRows);
    //setFieldValue('items',newRows);
   // }
   const updateTable=(vals:any)=>{
    console.log('en EditFormFields updateTable row',row);
   }  
  return (
    <>
      {/* {formConfig.frames ? (
          formConfig.frames.map((frame, index) => (
            <FormRow
            key={index}
            // fields={frame.fields}
            theme={theme}
            allValues={values}// es un object
            maxWidth={formConfig.formSize?.maxWidth}
            />
            ))
            ) : ( */}
      {/* {console.log('en JSX EditFormField fields',fields)} */}
      {fields && fields.length > 0 && row && //fields !== undefined &&
        //  formConfig.editFields && formConfig.editFields !== undefined &&       
          <FormRowDF key={String('frame')} fields={fields || []} theme={theme} row={row} handleChangeRow={handleChangeRow} columns={columns} />

      }
      {/* <div className="flex justify-end mt-4 space-x-4 mr-10">
         <CustomButton label='Cancelar y salir' onClick={onClose} buttonStyle='secondary'
             size='small'  icon={<FontAwesomeIcon icon={faSignOutAlt} size="lg" color="white" />}
             tooltipContent='Abandonar la página sin salvar los cambios' tooltipPosition='left' 
          />
          <CustomButton label='Salvar cambios'  buttonStyle='primary'
             size='small' icon={<FontAwesomeIcon icon={faFloppyDisk} size="lg" color="white" />}
             tooltipContent='Salvar los cambios y volver a la página anterior' tooltipPosition='left' style={{ marginLeft:5 }} 
             htmlType='submit' 
             onClick={() => updateTable(row)}
          />
      </div>       */}
  </>
  )
};

export default EditFormFields;
