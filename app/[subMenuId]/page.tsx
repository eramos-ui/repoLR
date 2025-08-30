/* Renderiza cualquier form en la BD Form del los que tiene formId en la tabla Submenu y path con número /12 x ej.
Los componente en secuencia son 1) esta página a través de 2) FormTableGrid que utiliza 3) GridContainer la tabla(grilla) y
EditForm para mostrar, tanto para Editar o agregar los campos de la tabla.
Este componente consume sp: getSubMenuForm (@subMenuId) y extrae el campo jsonForm de la tabla Form con el type FormConfigDFType tanto de la tabla
como de la edición de las filas y que se renderizan en EditForm  en editFields.También trae las filas (rows) de la tabla que se muestran en la grilla
*/
"use client";
import { useEffect, useState } from 'react';
import GoHomeButton from '@/components/general/GoHomeButton';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

// import { Formik, Form } from 'formik'; 
import { useSession } from 'next-auth/react';
import bcrypt from 'bcryptjs';
// import { getInitialValuesDynamicForm } from '@/utils/initialValues';
import { FormConfigDFType, GridRowDFType } from '@/types/interfaceDF';

import { formatRut } from '@/utils/formatRut';
// import {  getValidationSchemaDynamicForm } from '@/utils/validationSchema';
import { LoadingIndicator } from '@/components/general/LoadingIndicator';
import { saveFormData } from '@/utils/apiHelpers';
import _ from "lodash";
import GridContainer from '@/components/dynamicForm/GridContainer';
import { EditForm } from '@/components/dynamicForm/EditForm';

// const FormPage = ({ params }: { params: { subMenuId: string } }) => {
  const FormPage = ( ) => {
  const params                                  = useParams();
  const rawFormId                               = (params as { formId?: string }).formId;
  const formId                                  = rawFormId ? parseInt(rawFormId, 10) : null;
  const { data: session }                       = useSession();
  const [ formData, setFormData ]               = useState<FormConfigDFType | null>(null);//los campos del formulario dynamic
  const [ loading, setLoading ]                 = useState(true);
  const [ error, setError ]                     = useState<string | null>(null);
  const [ rows, setRows ]                       = useState<GridRowDFType[]>( []);
  const router                                  = useRouter();
  const [ initialValues, setInitialValues ]     = useState <{ [key: string]: any }>({} );
  const [ table, setTable ]                     = useState<FormConfigDFType | null>(null);
  const [ isModalOpen, setIsModalOpen ]         = useState(false);
  const [ editingRowIndex, setEditingRowIndex ] = useState<number | null>(null);
  const [ isAdding, setIsAdding]                = useState(false);
  // const [ alertMessage, setAlertMessage ]   = useState<string | null>("");
  // const [ alertDuration, setAlertDuration ] = useState<number | null>(3000);
  // const [ alertType, setAlertType ]         = useState<'success' | 'error' | 'info'>('info');
  // const subMenuId = formId ? parseInt(formId, 1006) : 0;//el id del subMenu con el type FormConfigDFType
  console.log('FormPage formId',formId);
  // useEffect(()=>{
  //    console.log('useEffect formData',formData?.editFields);
  // },[formData])
  const reLoad=() =>{//al cerrar el modal carga la pagina de nuevo
    window.location.reload();
  }
  useEffect(() => {
    async function fetchData() {
      if (formId === 0) {
        setError('No valid subMenuId provided');
        setLoading(false);
        return;
      }  
      let data:FormConfigDFType;
      try {
        // console.log('lee form y filas',`/api/forms/${formId}`);
        const res = await fetch(`/api/forms/${formId}`);//los datos del submenu { buttons, fields,formn} 
        // console.log('en [formId] res',res);
        if (!res.ok) {
          throw new Error(`Failed to fetch form data: ${res.statusText}`);
        }
        data= await res.json();
        // console.log('en [formId] jsonForm',data); 
     
        setInitialValues({items:data.rows});//debe llevar el nombre para el initialValues
        setFormData( data );//Devuelve el campo jsonForm de la tabla Form
        // setRows(data.rows || []);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();  
    setLoading(false); 
  }, [formId]);
  useEffect(() => {
    const fetchData = async (apiGetRows:string) => {//
      try{
        const res = await fetch(`/api/${apiGetRows}`);
        const data = await res.json();
        // console.log('en useEffect apiGetRows',apiGetRows);
        //  console.log('en useEffect rows',data);
        setRows(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    }
    setLoading(true);
    const apiGetRows=formData?.table.apiGetRows;
    if (apiGetRows) {
      fetchData(apiGetRows);
      setLoading(false);
    }
  }, [formData]);
  if (formId === 0) {
    return <div>No valid subMenuId provided</div>;
  }
  if (!formData || loading ) {
    return <LoadingIndicator  message='cargando' />;    
  }
  const handleDelete = (index: number) => {
    const apiSaveForm=formData?.table.apiSaveForm;           
   
    const updateData = async () => {
      try {
        const body={...rows[index], action:'delete',idUserModification: session?.user.id};
        console.log('en handleDelete body',body,apiSaveForm);
        const response = await fetch(`/api/${apiSaveForm}`, {
        method: 'POST',    
        body: JSON.stringify(body),
        });
        const result=await response.json();
        console.log('en handleDelete response',response.ok, result);
        if (response.ok) {
          alert("Eliminado exitosamente");
      //     // setTimeout(handleClose, 3000);
      //     onClose();
        } else {
          if (response.status === 400) {
            alert(`${result.error}`);     
          }else{
            console.log('en FormPage grabar response',result.error);
            alert(`${result.error}, favor comuníquelo al administrador del sistema.`);    
          }
        }
        // const response = await saveFormData(
        //   apiSaveForm!,
        //   { ...rows[index], action:'delete',idUserModification: session?.user.id },
        //   formatRut,//va la función de formatRut para que se graben los ruts estándar
        // );
      //   if (response.success) {
      //     alert("Item eliminado exitosamente");
      //     // setTimeout(handleClose, 3000);
      //   } else {
      //     //console.log('en FormPage grabar response',response.error);
      //     alert(`${response.error.error}, favor comuníquelo al administrador del sistema.`);          
      //   }
       } catch (error) {
         alert(`${error}, favor comuníquelo al administrador del sistema.`);
       }
    };
   console.log('en handleDelete index',index,apiSaveForm!); 
   console.log('en handleDelete rows',rows[index]);
   updateData();
   window.location.reload();//recarga la página
  };
  const themeClass = formData.theme === 'dark' ? 'theme-dark' : 'theme-light';
  const theme=formData.theme === 'dark' ? 'dark' : 'light';
  const globalStyles = {
    backgroundColor: formData.theme === 'dark' ? '#2d3748' : '#f7fafc', // Fondo oscuro o claro
    color: formData.theme === 'dark' ? '#f7fafc' : '#1a202c',           // Texto claro u oscuro
    borderColor: formData.theme === 'dark' ? '#4a5568' : '#cbd5e0',     // Bordes
    padding: '20px', // Otros estilos que se apliquen de manera general     
  };
  const formSize = formData.formSize || {};
  const handleEdit = (index: number) => {
    setEditingRowIndex(index);
    setIsModalOpen(true);
    setIsAdding(false);
  };
  const handleAdd = () => {
    setEditingRowIndex(null);
    setIsModalOpen(true);
    setIsAdding(true);
  };
  const handleClose=() =>{
    
    router.push('/');
  }
  const handleZoom=( row:any) =>{//actions de consulta en la grilla
     console.log('handleZoom')
   }

  
  // const spFetchSaveGrid=formData.table.spFetchSaveGrid;
  // const apiGetRows=formData.table.apiGetRows;
  const apiSaveform=formData.table.apiSaveForm;
  //  console.log('FormPage formData',formData,loading);

  return (//Aquí va el despliegue de la grilla no editable con los datos de la tabla que se hace en FormTableGrid vía GridContainer
    <>
    {/* (() => { console.log('en jsx page ', isModalOpen); return null; })()
    } {/* para que no marque error de {console.log ('en jsx page ',alertMessage) , null } */}
    { formData && formData.editFields && formData.editFields !== undefined && formData.table && formData.table !== undefined &&
      <div
        className={`relative p-6 rounded-lg shadow-lg max-w-full mx-auto mt-8 ${themeClass}`}
        style={{
          ...globalStyles,
          ...formSize,
          maxWidth: formData.formSize?.maxWidth || '100%',
        }}
      >
        <h1 className="text-3xl font-bold mb-4">{formData.formTitle}</h1> 
          <>       
              { !loading && formData.table.columns && formData.table.actions && formData.table.columnWidths && formData.table.editFormConfig &&         
              <GridContainer  columns={formData.table.columns} rows={rows} actions={formData.table.actions} 
                    columnWidths={formData.table.columnWidths} onEdit={handleEdit} handleAdd={handleAdd} table={formData.table}
                    onZoom={handleZoom} onDelete={handleDelete} editFormConfig={formData.table.editFormConfig} // Pasamos el editFormConfig a GridContainer
                    label={formData.table.label} //requerido para los tooltips de la Actions
                    objectGrid={formData.table.objectGrid}//para el tooltips de los botones de actions
                />
              }
              {isModalOpen && formData.table.editFormConfig && formData.table.columns && formData.table.editFormConfig && (
                <EditForm isOpen={isModalOpen} onClose={() => reLoad()   } theme={formData.table.editFormConfig.theme} // onSubmit={handleFormAdd} 
                  row={editingRowIndex !== null ? rows[editingRowIndex] : {}} columns={formData.table.columns} formId={Number(formId)}
                  formConfig={ formData.table.editFormConfig as FormConfigDFType} // Pasa el editFormConfig al componente de edición
                  requirePassword={formData.table.requirePassword} apiSaveForm={apiSaveform} isAdding={isAdding} fields={formData.editFields || []} //rows={rows} //setRows={setAllValues }
                />
                )} 
              <div className="flex space-x-4 mt-4">
              {formData.buttons &&
                formData.buttons.map((button, index) => { //console.log('JSX en FormPage',button);
                return ( //Volver al Menú button.action === 'return'
                <button
                  key={button.id} type={button.action === 'submit' ? 'submit' : 'button'}
                  onClick={  button.action === 'return' ? () => handleClose() :() => { }}
                  className={`px-4 py-2 rounded ${ button.action === 'submit'  ? 'bg-blue-500 text-white' : 'bg-red-500 text-white' }`}
                  style={{backgroundColor: button.backgroundColor,color: button.color,padding:button.padding, borderRadius:button.borderRadius, marginRight: button.marginRight || '0', }}
                >
                  {button.text}
                </button>)
              })}
              </div>
          </>
      </div>
    }
    </>  
  );
};
export default FormPage;