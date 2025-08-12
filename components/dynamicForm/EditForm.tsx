
"use client";
import React, { useRef } from 'react';
// import Modal from 'react-modal';

import { useSession } from 'next-auth/react';
// import { useFormikContext } from 'formik';
import {  Form, Formik, useFormikContext} from 'formik';
// import * as Yup from "yup";
import bcrypt from 'bcryptjs';
import _ from 'lodash';
//import { EditFormProps, FormConfigType, FormValues, } from '@/types/interfaces';

import {  FormConfigDFType, FormFieldDFType, FormValuesDFType, GridColumnDFType, GridRowDFType } from '@/types/interfaceDF';

// import { CustomAlert, FormRow } from '../controls';
// import { saveFormData } from '@/utils/apiHelpers';
// import { formatRut } from '@/utils/formatRut';
import CustomModal from '../general/CustomModal';
import { getValidationSchemaDynamicForm } from '@/utils/validationSchema';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { CustomButton } from '../controls';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk } from '@fortawesome/free-solid-svg-icons';
import { FieldComponentDF } from '../dynamicForm/FieldComponentDF';
import { useEffect, useMemo, useState } from 'react';
import { buildInitialValues } from '@/utils/buildInitialValuesForDynamicForm';
import { normalizeStringValues } from '@/utils/normalizeStringValue';

interface EditFormProps { // formulario dynamic
  formConfig: FormConfigDFType;//toda la configuración del form  
  fields: FormFieldDFType[];
  isOpen: boolean;
  onClose: () => void;
  row: FormValuesDFType;
  columns:GridColumnDFType[];
  isAdding?:boolean;
  apiSaveForm?:string;
  apiGetRow?:string;//si es necesario leer los campos del formulario (cuando no corresponden a los de la grilla), el name parametro viene en la ApI [xxxxId] el valor está en row
  theme?:string;
  requirePassword?:boolean;
  formId:Number;
  globalStyles?: {
    light?: React.CSSProperties;
    dark?: React.CSSProperties;
  };
  width?:string;
  height?:string;
}
interface Option {
  value: string | number;
  label: string;
}
// const typeValues= ['number','string','rut','sin','boolean','money'];
//form para editar los datos de la grilla de la tabla que administra el Dynamic Form
export const EditForm: React.FC<EditFormProps> = ({
  formConfig,
  fields,
  isOpen,
  onClose,
  row,
  columns,
  isAdding,
  apiSaveForm,
  apiGetRow,
  requirePassword=false,  
  formId,
  width,
  height,
  ...props
}) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  // console.log('en EditForm fields, row, formConfig',fields, row,formConfig);
 
  // const rowInitial = buildInitialValues(fields, row);
  const rowInitial = useMemo(() => buildInitialValues(fields, row), [fields, row]);
  // console.log('en EditForm rowInitial',rowInitial);
  const { theme: themeEdit, formSize, formTitle, modalStyles } = formConfig;
  // console.log('en EditForm editFormSize',editFormSize);
  // console.log('en EditForm globalStyles',globalStyles);
  const { data: session }                                      = useSession();
  // const [ alertMessage, setAlertMessage ]                      = useState<string | null>(null);
  // const [ alertDuration, setAlertDuration ]                    = useState<number | null>(null);
  // const [ alertType, setAlertType ]                            = useState<'success' | 'error' | 'info'>('info');
  // console.log('EditForm requirePassword',requirePassword);
  const theme: 'light' | 'dark' = themeEdit === 'dark' ? 'dark' : 'light';
  // const esNumero = (valor: string): boolean => { //establece si un string puede ser un numero
  //   if (valor.length === 0) return false;
  //   return !isNaN(Number(valor));
  // };
  // useEffect(()=>{
  //     console.log('en useEffect rowInitial',rowInitial)
  // },[rowInitial])
  const [loadedFields, setLoadedFields] = useState<FormFieldDFType[]>([]);
  useEffect(() =>{//carga datos iniciales del form de edición si viene apiGetRow, sino pasa la fila editada
    const fetchData = async (apiGet:string) => {//
      // console.log('apiGet',apiGet)
      try{
        // const res = await fetch(`${apiGet}`);
        const res = await fetch(`/api/${apiGet}`);
        const data = await res.json();
        console.log('en fetchData data FALTA',data)
        // console.log('en fetchData rowInitial',rowInitial)
        // console.log('en fetchData row',row)
        // console.log('en fetchData full',{...rowInitial,...data })
        //rowInitial={...rowInitial,...data };
      } catch (err) {
        console.log('An unknown error occurred');
        }
     } 
    
    if (!apiGetRow || !row) return;
    // console.log('apiGetRow',apiGetRow)
    // const id=apiGetRow.split('[')[1].split(']')[0];
    // console.log('id',id,row)
    // const param=row[id];
    // console.log('param',param)
    const urlInicio=apiGetRow.split('[')[0];
    let inicio=apiGetRow.split('[')[1];
    const param=inicio.split(']')[0];   
    
    // console.log('urlInicio',urlInicio)
    // console.log('param',param) 
    const valueParam=row[param]  
    const urlRow=urlInicio+valueParam+inicio.split(']')[1];
    // console.log('urlRow',urlRow)
    if (valueParam) fetchData(urlRow);
  },[apiGetRow, row])

  useEffect(() => {//carga los select del formulario
    const loadOptionsForSelects = async () => {
      const updatedFields = await Promise.all(
        fields.map(async (field) => {//fields son los campos del formulario
          if ((field.type === 'selectNumber' || field.type ==='select' || field.type ==='multiselect') && field.apiOptions) {//los que tiene select o multiselect y apiOptions
            try {
                const res = await fetch(`/api/${field.apiOptions}`);
              const data = await res.json(); 
              let options:Option[]=[];
              if (data && data.length>0){
                  options=data.map((option:any) =>{
                  return {
                    value:(field.type === 'selectNumber')? Number(option.value) : String(option.value),
                    label: option.label
                  };
                });
              }
              return {
                ...field,
                options: options || [], // Asegúrate que devuelva { options: [...] }
              };
            } catch (error) {
              console.error(`Error cargando options para ${field.name}:`, error);
              return { ...field, options: [] };
            }
          }
          return field;
        })
      );
      setLoadedFields(updatedFields);
    };
  
    loadOptionsForSelects();
  }, [fields]); // ⚠️ Solo depende de los fields originales

  //grabar
  const grabar = async( values:any) =>{//amvos nuevo usuario y edit usuairo
    console.log('values al graba en EditForm',values,requirePassword);

    const password = requirePassword ? await bcrypt.hash('clave1234', 10) : undefined;
    const withRutFields=fields.filter(field => field.type === 'RUT');//field que tienen field type='RUT' para formatearlo estándar
    let updateValues:any=values;
    if (withRutFields && withRutFields.length > 0) {
          //actualizar rut de los values[field.name] cuando es un rut para que se graben ###.###.###-# , se hace 2 veces porque formatRut lo repite
        withRutFields.forEach((field:any) => {
          const valueRut=values[field.name];
          updateValues[field.name]=valueRut;
        });
      }   
      const changedItem=_.isEqual(updateValues,row); //compara si los valores de updateValues son iguales a los de row
      // console.log('en EditForm grabar row',row)
      // console.log('en EditForm grabar updateValues',updateValues,changedItem);return;   
      if (changedItem) {
        console.log('en FormPage grabar no hay cambios');
        return;
      } 
    const apiSaveForms=`/api${apiSaveForm}`;
    // const comentario=(values.descripcion)?values.descripcion:'';
    const rowValues={...updateValues};
    let body={row:rowValues, formId:formId,  idUserModification:session?.user.id, password};//siempre agrega el idUserModification
    
    console.log('body',body,row._id,apiSaveForms);

     try {
      const response = await fetch(`${apiSaveForms}`, {
        method: 'POST',    
        body: JSON.stringify(body),
      });
      const result=await response.json();
      console.log('en EditForm grabar response',response.ok, result);

      if (response.ok) {
        alert("Grabado exitosamente");
        setTimeout(()=>{
          onClose();
        }, 1000);
      } else {
        if (response.status === 400) {
          alert(`${result.error}`);     
        }else{
          console.log('errorMsg',result.message,typeof result.erro)
          const errorMsg=( typeof result.error ==='object')? result.error.message:result.message;          
          alert(`${errorMsg}.`);    
        }
      }
    } catch (error) {
      console.log(error);
      alert(`${error}, favor comuníquelo al administrador del sistema.`);
    }
  };
  const groupedFields = loadedFields.reduce((acc, field, width) => {//agrupa los campos por row que obligatortio
    if (!acc[field.row]) {
       acc[field.row] = [];
     }
    acc[field.row].push(field);
    return acc;
  }, {} as { [key: number]: FormFieldDFType[] });
  if (!isOpen) return null;  
  if (!row) <></>; 
  // console.log('en EditForm fields',fields);
  // const validationSchema = getValidationSchemaDynamicForm(fields);

  //  console.log("🧾 groupedFields:", groupedFields);
  return (
    <>     
    {/* {(() => { console.log('en jsx page row ', row); return null; })()}  */}
      <CustomModal
        isOpen={isOpen}
        onClose={onClose}
        width={width} height={height}
        title={isAdding ? `Agregar Información: ${formTitle}` : `Modificar Información: ${formTitle}`}
        position={'center'}
       >
        <Formik
         initialValues={rowInitial}
         validateOnBlur={true} //ejecuta la validación Yup cuando el usuario sale del campo
         validateOnChange={true}//para que se ejecute la validación cuando el usuario cambia el valor del campo y borre el error
         validate={async (values) => {
        //  console.log("🔎 validate ejecutado con:", values);
          const schema = getValidationSchemaDynamicForm(fields);
          try {
            await schema.validate(values, { abortEarly: false });
            console.log("✅ Validación pasada sin errores");
            return {}; // sin errores
          } catch (err: any) {
            const errors: Record<string, string> = {};
            err.inner?.forEach((e: any) => {
              if (e.path) errors[e.path] = e.message;
            });
            console.log("❌ Errores detectados:", errors);
            return errors;
          }
         }}

        onSubmit={async (values, { setSubmitting, validateForm }) => {
          // console.log("🚀 onSubmit ejecutado con:", values);
          const correctedValues = normalizeStringValues(values, fields);
          const errors = await validateForm(correctedValues);

           console.log('Errores de validación:',errors);
          if (Object.keys(errors).length === 0) {
            const _id = row._id;
            await grabar({ ...correctedValues, _id });
          } else {
            console.log('Submit bloqueado por errores:', errors);
          }
          setSubmitting(false);
        }}

         >
        {({ errors={}, touched={},values, setFieldValue, isSubmitting, isValid  }) => {// console.log("Formik errors,touched,isValid:", errors,touched,isValid);
          // useEffect(()=>{ console.log('en EditForm useEffect',values);},[values])
        if (isSubmitting) return <div>Guardando...</div>;
        return (
          <Form ref={formRef}>
            <div> 
              { Object.keys(groupedFields).map( item => {
                if (!item) return null;
                return (
                  <div className={`flex flex-wrap -mx-2 mb-4 w-[100%]`} key={ item }           
                  >
                    {groupedFields[Number(item)].map(field => {// console.log('en EditForm field',field);
                      const fullField = loadedFields.find(f => f.name === field.name) || field;
                    return ( 
                      <div  key={`${item}-${field.name}`} className={`px-2`}  >
                        <FieldComponentDF field={fullField} values={values} setFieldValue={setFieldValue} 
                           theme={theme}//errors={errors} touched={touched}
                        />
                      </div> 
                      )
                    })}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end mt-4 space-x-4 mr-10">
                 <CustomButton label='Cancelar y salir' onClick={onClose} buttonStyle='secondary'
                    size='small'  icon={<FontAwesomeIcon icon={faSignOutAlt} size="lg" color="white" />}
                    tooltipContent='Abandonar la página sin salvar los cambios' tooltipPosition='top' 
                  />
                  <CustomButton label= {isSubmitting ? "Enviando..." : "Salvar cambios"}  buttonStyle='primary' formRef={formRef}
                    size='small' icon={<FontAwesomeIcon icon={faFloppyDisk} size="lg" color="white" />} htmlType='submit'
                    tooltipContent='Salvar los cambios e ir a la página anterior' tooltipPosition='left' style={{ marginRight:25, marginBottom:30 }} 
                  />
                  {/* <button
                    type="button"
                    onClick={() => {
                      console.log("🔧 Forzando submit manual");
                      // submitForm();
                    }}
                  >
                    Forzar envío
                  </button>  */}
              </div>   
          </Form>
        )
        }}
        </Formik>
      </CustomModal>
    </>
  );
};




// "use client";
// import React, { useRef } from 'react';
// // import Modal from 'react-modal';

// import { useSession } from 'next-auth/react';
// // import { useFormikContext } from 'formik';
// import {  Form, Formik, useFormikContext} from 'formik';
// // import * as Yup from "yup";
// import bcrypt from 'bcryptjs';
// import _ from 'lodash';
// //import { EditFormProps, FormConfigType, FormValues, } from '@/types/interfaces';

// import {  FormConfigDFType, FormFieldDFType, FormValuesDFType, GridColumnDFType, GridRowDFType } from '@/types/interfaceDF';

// // import { CustomAlert, FormRow } from '../controls';
// // import { saveFormData } from '@/utils/apiHelpers';
// // import { formatRut } from '@/utils/formatRut';
// import CustomModal from '../general/CustomModal';
// import { getValidationSchemaDynamicForm } from '@/utils/validationSchema';
// import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
// import { CustomButton } from '../controls';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faFloppyDisk } from '@fortawesome/free-solid-svg-icons';
// import { FieldComponentDF } from '../dynamicForm/FieldComponentDF';
// import { useEffect, useMemo, useState } from 'react';
// import { buildInitialValues } from '@/utils/buildInitialValuesForDynamicForm';
// import { normalizeStringValues } from '@/utils/normalizeStringValue';
// import { normalizeAndUploadFiles } from '@/utils/api/upload';

// interface EditFormProps { // formulario dynamic
//   formConfig: FormConfigDFType;
//   fields: FormFieldDFType[];
//   isOpen: boolean;
//   onClose: () => void;
//   row: FormValuesDFType;
//   columns:GridColumnDFType[];
//   isAdding?:boolean;
//   apiSaveForm?:string;
//   apiGetRow?:string;//si es necesario leer los campos del formulario (cuando no corresponden a los de la grilla), el name parametro viene en la ApI [xxxxId] el valor está en row
//   theme?:string;
//   requirePassword?:boolean;
//   formId:Number;
//   globalStyles?: {
//     light?: React.CSSProperties;
//     dark?: React.CSSProperties;
//   };
//   width?:string;
//   height?:string;
//   // maxHeight?:string;
//   // overflowY?:string;
// }
// interface Option {
//   value: string | number;
//   label: string;
// }
// //form para editar los datos de la grilla de la tabla que administra el Dynamic Form
// export const EditForm: React.FC<EditFormProps> = ({
//   formConfig,
//   fields,
//   isOpen,
//   onClose,
//   row,
//   columns,
//   isAdding,
//   apiSaveForm,
//   apiGetRow,
//   requirePassword=false,  
//   formId,
//   width,
//   height,
//   ...props
// }) => {
//   // console.log('en EditForm height, width',height, width);
//   const formRef = useRef<HTMLFormElement | null>(null);
//   // console.log('en EditForm fields',fields);
  
//   let rowInitial = useMemo(() => buildInitialValues(fields, row), [fields, row]);
//   //  console.log('rowInitial',rowInitial)
//   const { theme: themeEdit, formSize, formTitle, modalStyles } = formConfig;
//   const { data: session }                                      = useSession();
//   const theme: 'light' | 'dark' = themeEdit === 'dark' ? 'dark' : 'light';
//   const [loadedFields, setLoadedFields] = useState<FormFieldDFType[]>([]);
//   useEffect(() =>{
//     const fetchData = async (apiGet:string) => {//
//       // console.log('apiGet',apiGet)
//       try{
//         // const res = await fetch(`${apiGet}`);
//         const res = await fetch(`/api/${apiGet}`);
//         // const data = await res.json();
//         // console.log('en fetchData data',data)
//         // console.log('en fetchData rowInitial',rowInitial)
//         // console.log('en fetchData row',row)
//         // console.log('en fetchData full',{...rowInitial,...data })
//         //rowInitial={...rowInitial,...data };
//       } catch (err) {
//         console.log('An unknown error occurred');
//         }
//      } 
    
//     if (!apiGetRow || !row) return;
//     // console.log('apiGetRow',apiGetRow)
//     // const id=apiGetRow.split('[')[1].split(']')[0];
//     // console.log('id',id,row)
//     // const param=row[id];
//     // console.log('param',param)
//     const urlInicio=apiGetRow.split('[')[0];
//     let inicio=apiGetRow.split('[')[1];
//     const param=inicio.split(']')[0];   
    
//     // console.log('urlInicio',urlInicio)
//     // console.log('param',param) 
//     const valueParam=row[param]  
//     const urlRow=urlInicio+valueParam+inicio.split(']')[1];
//     // console.log('urlRow',urlRow)
//     if (valueParam) fetchData(urlRow);

//   },[apiGetRow, row])
//   useEffect(() => {//carga los select del formulario
//     const loadOptionsForSelects = async () => {
//       const updatedFields = await Promise.all(
//         fields.map(async (field) => {//fields son los campos del formulario
//           if ((field.type === 'selectNumber' || field.type ==='select' || field.type ==='multiselect') && field.apiOptions) {//los que tiene select o multiselect y apiOptions
//             try {
//               // console.log('url',`/api/${field.apiOptions}`);
//               const res = await fetch(`/api/${field.apiOptions}`);
//               const data = await res.json(); 
//               let options:Option[]=[];
//               if (data && data.length>0){
//                   options=data.map((option:any) =>{
//                   return {
//                     value:(field.type === 'selectNumber')? Number(option.value) : String(option.value),
//                     label: option.label
//                   };
//                 });
//               }
//               return {
//                 ...field,
//                 options: options || [], // Asegúrate que devuelva { options: [...] }
//               };
//             } catch (error) {
//               console.error(`Error cargando options para ${field.name}:`, error);
//               return { ...field, options: [] };
//             }
//           }
//           return field;
//         })
//       );
//       setLoadedFields(updatedFields);
//     };
  
//     loadOptionsForSelects();
//   }, [fields]); // ⚠️ Solo depende de los fields originales

//   //grabar
//   const grabar = async( values:any) =>{
//     console.log('fields en grabar',fields);
//     console.log('values',values)
 
//     if (!session) return //debe estar definido el usuario
//     const uploadedFiles = await normalizeAndUploadFiles(fields, values, session);//Aquí hace el upload de los fields que son File

//     const requirePassword=fields.find(field => field.type === 'password')?.requirePassword;
//     const password = requirePassword ? await bcrypt.hash('password123', 10) : undefined;
//     const withRutFields=fields.filter(field => field.type === 'RUT');//field que tienen field type='RUT' para formatearlo estándar
//     let updateValues:any=values;
//     if (withRutFields && withRutFields.length > 0) {
//         //actualizar rut de los values[field.name] cuando es un rut para que se graben ###.###.###-# , se hace 2 veces porque formatRut lo repite
//       withRutFields.forEach((field:any) => {
//         const valueRut=values[field.name];
//         updateValues[field.name]=valueRut;
//       });
//     }   
//     const changedItem=_.isEqual(updateValues,row); //compara si los valores de updateValues son iguales a los de row
//     if (changedItem) {
//       console.log('en FormPage grabar no hay cambios');
//       return;
//     } 
//     console.log('apiSaveForm',apiSaveForm); 
//     if (!apiSaveForm || apiSaveForm.length === 0){
//       console.log('no existe apiSaveForm');
//       // setTimeout(handleClose, 3000);
// // onClose();
//       return; //puede que no requiera grabar nada más que los files
//     } 
  
//     const apiSaveForms=`/api/${apiSaveForm}`;//para grabar el resto de los campos del formulario
//     const body={...updateValues, formId:formId,  idUserModification:session?.user.id};//siempre agrega el idUserModification
//     console.log('en EditForm grabar body, apiSaveForms',body);
// return;
//     try {
//       const response = await fetch(`${apiSaveForms}`, {
//         method: 'POST',    
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(body),
//       });
//       const result=await response.json();
//       console.log('en EditForm grabar response',response.ok, result);
//       if (response.ok) {
//         alert("Grabado exitosamente");
//         onClose();
//       } else {
//         if (response.status === 400) {
//           alert(`${result.error}`);     
//         }else{
//           console.log('en FormPage grabar response',result.error);
//           alert(`${result.error}, favor comuníquelo al administrador del sistema.`);    
//         }
//       }
//     } catch (error) {
//       alert(`${error}, favor comuníquelo al administrador del sistema.`);
//     }
//   };
//   const groupedFields = loadedFields.reduce((acc, field, width) => {//agrupa los campos por row que obligatortio
//     if (!acc[field.row]) {
//        acc[field.row] = [];
//      }
//     acc[field.row].push(field);
//     return acc;
//   }, {} as { [key: number]: FormFieldDFType[] });
//   if (!isOpen) return null;  
//   if (!row) <></>; 
//   // console.log('en EditForm fields',fields);
//   const validationSchema = useMemo(
//     () => getValidationSchemaDynamicForm(fields),
//     [fields]
//   );
//   return (
//     <>     
//     {/* {(() => { console.log('en jsx page ', row); return null; })()}  */}
//       <CustomModal
//         isOpen={isOpen}
//         onClose={onClose}
//         width={width} height={height}
//         title={isAdding ? `Agregar Información: ${formTitle}` : `Modificar Información: ${formTitle}`}
//         position={'center'}
//        >
//         <Formik
//          initialValues={rowInitial}
//          validationSchema={validationSchema}
//          validateOnBlur={true} //ejecuta la validación Yup cuando el usuario sale del campo
//          validateOnChange={true}//para que se ejecute la validación cuando el usuario cambia el valor del campo y borre el error
//          validate={async (values) => {
//            console.log("🔎 validate ejecutado con:", values);
//             const schema = getValidationSchemaDynamicForm(fields);
//             try {
//               await schema.validate(values, { abortEarly: false });
//               console.log("✅ Validación pasada sin errores");
//               return {}; // sin errores
//             } catch (err: any) {
//               const errors: Record<string, string> = {};
//               err.inner?.forEach((e: any) => {
//                 if (e.path) errors[e.path] = e.message;
//               });
//               console.log("❌ Errores detectados:", errors);
//               return errors;
//             }
//          }}

//          onSubmit={async (values, { setSubmitting, validateForm }) => {
//             console.log("🚀 onSubmit ejecutado con:", values);
//            const correctedValues = normalizeStringValues(values, fields);
//            const errors = await validateForm(correctedValues);
//             console.log('Errores de validación:',errors);
//            if (Object.keys(errors).length === 0) {
//              const _id = row._id;
//              await grabar({ ...correctedValues, _id });
//            } else {
//              console.log('Submit bloqueado por errores:', errors);
//            }
//            setSubmitting(false);
//          }}
//          >
//         {({ errors={}, touched={},values, setFieldValue, isSubmitting, isValid  }) => {// console.log("Formik errors,touched,isValid:", errors,touched,isValid);
//           // useEffect(()=>{ console.log('en EditForm useEffect',values);},[values])
//         if (isSubmitting) return <div>Guardando...</div>;
//         return (
//           <Form ref={formRef}>
//             <div> 
//               { Object.keys(groupedFields).map( item => {
//                 if (!item) return null;
//                 return (
//                   <div className={`flex flex-wrap -mx-2 mb-4 w-[100%]`} key={ item }           
//                   >
//                   {
//                     groupedFields[Number(item)].map(field => { //console.log('en EditForm field',field);
//                       const fullField = loadedFields.find(f => f.name === field.name) || field;
//                     return ( 
//                       <div  key={`${item}-${field.name}`} className={`px-2`}  >
//                         <FieldComponentDF field={fullField} 
//                           //errors={errors} touched={touched} 
//                           values={values} setFieldValue={setFieldValue} theme={theme}
//                         />
//                       </div> 
//                       )
//                     })}
//                   </div>
//                 );
//               })}
//             </div>
//             <div className="flex justify-end mt-4 space-x-4 mr-10">
//                  <CustomButton label='Cancelar y salir' onClick={onClose} buttonStyle='secondary'
//                     size='small'  icon={<FontAwesomeIcon icon={faSignOutAlt} size="lg" color="white" />}
//                     tooltipContent='Abandonar la página sin salvar los cambios' tooltipPosition='top' 
//                   />
//                   <CustomButton label= {isSubmitting ? "Enviando..." : "Salvar cambios"}  buttonStyle='primary' formRef={formRef}
//                     size='small' icon={<FontAwesomeIcon icon={faFloppyDisk} size="lg" color="white" />} htmlType='submit'
//                     tooltipContent='Salvar los cambiose ir a la página anterior' tooltipPosition='left' style={{ marginRight:25, marginBottom:30 }} 
//                   />
//               </div>   
//           </Form>
//         )
//         }}
//         </Formik>
//       </CustomModal>
//     </>
//   );
// };
