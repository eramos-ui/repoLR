
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
function findFilePaths(obj: any, currentPath = ''): string[] {
  if (!obj || typeof obj !== 'object') return [];
  // Si es un File → devolver la ruta actual
  if (obj instanceof File) {
    return [currentPath || '(root)']; // "(root)" si es el mismo objeto
  }
  // Si es un array → buscar en cada elemento
  if (Array.isArray(obj)) {
    return obj.flatMap((item, index) =>
      findFilePaths(item, `${currentPath}[${index}]`)
    );
  }
  // Si es objeto plano → buscar en cada propiedad
  return Object.entries(obj).flatMap(([key, value]) => {
    const newPath = currentPath ? `${currentPath}.${key}` : key;
    return findFilePaths(value, newPath);
    });
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
  //console.log('en EditForm fields, formConfig',fields,formConfig);
  // console.log('en EditForm  row', row);
 
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
    const urlInicio=apiGetRow.split('[')[0];
    let inicio=apiGetRow.split('[')[1];
    const param=inicio.split(']')[0];   
    const valueParam=row[param]  
    const urlRow=urlInicio+valueParam+inicio.split(']')[1];
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
    if (!session) return //debe estar definido el usuario
    // console.log('fields, values, session',fields, values, session)
    const filesFields=findFilePaths(values);//tiene todos los fields que son File
    /*
     1. Si hay archivos (File) se graba primero el file y queda en uploads.<< y en Files esta API viene en formConfig.table.apiUploadFile
    */
    if (filesFields && filesFields.length>0 ){//implementado sólo 1 File por formId
      let apiUploadFile=formConfig.table.apiUploadFile || '';
      if (!apiUploadFile || apiUploadFile.length === 0){
        console.log('Falta definir formConfig.table.apiUploadFile',apiUploadFile);
        return;
      }
      apiUploadFile='/api'+(apiUploadFile.substring(0,1) === '/' ? apiUploadFile : '/'+apiUploadFile);
      const file:string=values[filesFields[0]];
      const rowSinFile= { ...values };
      delete rowSinFile['file'];
      // console.log('rowSinFile',rowSinFile)
      const fd = new FormData();
      fd.append('file',file);
      fd.append('row',JSON.stringify(rowSinFile));//se pasa json con los values del formulario como row
      fd.append("formId", String(formId));
      fd.append("idUserModification", session?.user.id);
      const res = await fetch(`${apiUploadFile}`, {
        method: "POST",
        body: fd, // ⚠️ No pongas Content-Type manualmente
      });
      const dataResp = await res.json();
      if (!apiSaveForm || apiSaveForm.length === 0){
        if (dataResp.ok) {
          alert("Grabado exitosamente");
          setTimeout(()=>{
            onClose();
          }, 1000);
        } else {
          if (dataResp.status === 400) {
            alert(`${dataResp.error}`);     
          }else{
            console.log('errorMsg',dataResp.message,typeof dataResp.erro)
            const errorMsg=( typeof dataResp.error ==='object')? dataResp.error.message:dataResp.message;          
            alert(`${errorMsg}.`);    
          }
        }
        return
      } //viene como parámetro y si no está no hay nada que salver (caso que todo se guarda en File)
    }
    /*
     2. Si además o sólo hay apiSaveForm se actualiza la coleección que corresponda
    */
    const password = requirePassword ? await bcrypt.hash('jara', 10) : undefined;
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
      if (!apiSaveForm || apiSaveForm.length === 0){
        console.log('en EditForm grabar apiSaveForms no definido');
        return;
      } 
     const  apiSaveForms='/api'+(apiSaveForm.substring(0,1) === '/' ? apiSaveForm : '/'+apiSaveForm);
    // const comentario=(values.descripcion)?values.descripcion:'';
      const rowValues={...updateValues};
      let body={row:rowValues, formId:formId,  idUserModification:session?.user.id, password};//siempre agrega el idUserModification
     try {
      const response = await fetch(`${apiSaveForms}`, {
        method: 'POST',    
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result=await response.json();
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
          //  console.log("🚀 onSubmit ejecutado con:", values);
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
