/* Renderiza cualquier form en la BD Form del los que tiene formId en la tabla Submenu y path con número /12 x ej.
Los componente en secuencia son 1) esta página a través de 2) FormTableGrid que utiliza 3) GridContainer la tabla(grilla) y
EditForm para mostrar, tanto para Editar o agregar los campos de la tabla.
Este componente consume sp: getSubMenuForm (@subMenuId) y extrae el campo jsonForm de la tabla Form con el type FormConfigDFType tanto de la tabla
como de la edición de las filas y que se renderizan en EditForm  en editFields.También trae las filas (rows) de la tabla que se muestran en la grilla
*/
"use client";
import { useEffect, useState } from 'react';
// import GoHomeButton from '@/components/general/GoHomeButton';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

// import { Formik, Form } from 'formik'; 
import { useSession } from 'next-auth/react';
// import bcrypt from 'bcryptjs';

// import { getInitialValuesDynamicForm } from '@/utils/initialValues';
import { FormConfigDFType, FormFieldDFType, GridRowDFType } from '@/types/interfaceDF';

// import { formatRut } from '@/utils/formatRut';
// import {  getValidationSchemaDynamicForm } from '@/utils/validationSchema';
import { LoadingIndicator } from '@/components/general/LoadingIndicator';
// import { saveFormData } from '@/utils/apiHelpers';
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
  const [ rows, setRows ]                       = useState<any[]>();//GridRowDFType
  const router                                  = useRouter();
  const [ initialValues, setInitialValues ]     = useState <{ [key: string]: any }>({} );
  // const [ table, setTable ]                     = useState<FormConfigDFType | null>(null);
  // const [ table, setTable ]                     = useState<FormFieldDFType | null>(null);
  const [ isModalOpen, setIsModalOpen ]         = useState(false);
  const [ editingRowIndex, setEditingRowIndex ] = useState<number | null>(null);
  const [ isAdding, setIsAdding]                = useState(false);
  // const subMenuId = formId ? parseInt(formId, 1006) : 0;//el id del subMenu con el type FormConfigDFType
  // console.log('FormPage formId',formId);
  // useEffect(()=>{
  //    console.log('useEffect formData',formData?.editFields);
  // },[formData])

  const reLoad=() =>{//al cerrar el modal carga la pagina de nuevo
    window.location.reload();
  }
  useEffect(() => {
    async function fetchData() {//lee el formId
      if (formId === 0) {
        setError('No valid subMenuId provided');
        setLoading(false);
        return;
      }  
      let data:FormConfigDFType;
      try { 
        console.log('lee form apiGetForm',`/api/forms/${formId}`);
        const res = await fetch(`/api/forms/${formId}`);//los datos del submenu { buttons, fields,formn} 
        // console.log('en [formId] res',res);
        if (!res.ok) {
          throw new Error(`Failed to fetch form data: ${res.statusText}`);
        }
        data= await res.json();
        console.log('en [formId] jsonForm',data); 
     
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
    const replaceParam=((param:string) => { 
      switch ( param ){
      case 'userId':      
        return session?.user.id
      default:
      return param;   
      }
    })
    const fetchData = async (apiGetRows:string) => {//
      let api='/api'+(apiGetRows.substring(0,1) === '/' ? apiGetRows : '/'+apiGetRows);
      try{
        // console.log('en [formId] apiGetRows',api)
        const res = await fetch(api);
        const data = await res.json();
          //  console.log('rows',data)
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
    let apiGetRows=formData?.table.apiGetRows;
    if (!apiGetRows || apiGetRows.length === 0){ 
      console.log('en [formId] apiGetRows no definido');
      return;
    };
    // console.log('apiGetRows de la BD',apiGetRows)
    if(apiGetRows?.includes('[')) { //la url tiene parámetro
      const urlInicio=apiGetRows.split('[')[0];
      const inicio=apiGetRows.split('[')[1];
      const param=inicio.split(']')[0];      
      apiGetRows=urlInicio+replaceParam(param)+inicio.split(']')[1];
    }
    // console.log('lee grilla',apiGetRows)
    if (apiGetRows) {
      fetchData(apiGetRows);
      setLoading(false);
    }
  }, [formData, session]);
  if (formId === 0) {
    return <div>No valid subMenuId provided</div>;
  }
  if (!formData || loading ) {
    return <LoadingIndicator  message='cargando' />;    
  }
  const replaceParam=((param:string) => { //para el que está en handleDelete
    switch ( param ){
    case 'userId':      
      return session?.user.id
    default:
    return param;   
    }
  })
  const handleDelete = async (index: number) => {
    const apiSaveForm=formData?.table.apiSaveForm;  
    const apiDeleteForm=formData?.table.apiDeleteForm; //case en que el delete no es un versión del documento, sin su eliminación. Es el case Evento, no el de Usuario    
    const row =(rows && rows[index])?rows[index]: null;
    const column=formData.table.objectColumnNumberNameToDelete || 0;//número de la columns con el label de la alerta, sin no se define elige la 1era columna
    const col=formData.table.columns?.filter(c =>c.visible);//sólo las visible=true
    const nameGridRowColumnNameDelete= (col && col.length>0) ?col[column].name:formData.table.objectGrid;//name de la columna para obtener el value
    let labelAtributteDelete=formData.table.objectGrid +' ';//si no hay value mostrara el nombre de la grilla
    if (nameGridRowColumnNameDelete && nameGridRowColumnNameDelete.length>0) 
        labelAtributteDelete=labelAtributteDelete+'"'+row[nameGridRowColumnNameDelete].trim()+'"';
    const confirmed =window.confirm(`Confirme la eliminación de ${labelAtributteDelete}`);  
    if (!confirmed) return;
    if (apiDeleteForm && apiDeleteForm.length>0) {
      let ruta=apiDeleteForm;
      if (ruta && ruta.includes('[')){
        const urlInicio=ruta.split('[')[0];
        const inicio=ruta.split('[')[1];
        const param=inicio.split(']')[0];      
        const valueParam=row[param];
        ruta=urlInicio+replaceParam(valueParam)+inicio.split(']')[1];
      }
        try{
          const response = await fetch(`/api/${ruta}`, {// el _id viene como query param. por ejemplo:: /api/forms(saveForm/deleteEvento?id=...
            method: 'DELETE',    
            headers: {
              "Content-Type": "application/json",
            },
          });
          const result=await response.json();  
          if (response.ok) {
            alert("Eliminado exitosamente..");
            window.location.reload();
          } else {
            if (response.status === 400) {
              alert(`${result.error}`); 
            }else{
              const errorMsg=( typeof result.error ==='object')? result.error.message:result.error;          
              alert(`${errorMsg}, favor comuníquelo al administrador del sistema.`);  
            }
          }
        } catch(error){
        alert(`${error}, favor comuníquelo al administrador del sistema.`);
        } 
        return;     
    }  
    // console.log('en handleDelete api saveForm',`/api/${apiSaveForm}`);
      try {//caso en que el DELETE no elimina sino que deja NO vigente
        const body={row, action:'delete',idUserModification: session?.user.id};//manda toda la fila con action=DELETE
        // console.log('body',body)
        const response = await fetch(`/api/${apiSaveForm}`, {
          method: 'POST',    
          body: JSON.stringify(body),
        });
        const result=await response.json();
        console.log('en handleDelete response',response.ok, result);
        if (response.ok) {
          alert("Eliminado exitosamente.");
        } else {
          if (response.status === 400) {
            alert(`${result.error}`);     
          }else{
            console.log('en FormPage grabar response',result.error);
            alert(`${result.error}, favor comuníquelo al administrador del sistema.`);    
          }
        }
       } catch (error) {
         alert(`${error}, favor comuníquelo al administrador del sistema.`);
       }       
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
    // console.log ('en Page de formId handleEdit index',index )
    
    // const items = rows.items;
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
    if( !formData.table.zoomUrl) console.log('No esta definida la url que muestra la consulta');
    let ruta=formData.table.zoomUrl;
    if (ruta && ruta.includes('[')){
      const urlInicio=ruta.split('[')[0];
      const inicio=ruta.split('[')[1];
      const param=inicio.split(']')[0];      
      const valueParam=row[param];
      ruta=urlInicio+replaceParam(valueParam)+inicio.split(']')[1];
    }
    router.push(`${ruta}`);
  }
  const apiSaveform=formData.table.apiSaveForm;
  return (//Aquí va el despliegue de la grilla no editable con los datos de la tabla que se hace en FormTableGrid vía GridContainer
    <>
    {/* { (() => { console.log('en jsx page ', formData); return null; })()} */}
     {/* para que no marque error de {console.log ('en jsx page ',alertMessage) , null } */}
    { formData && formData.editFields && formData.editFields !== undefined && formData.table && formData.table !== undefined &&
      <div
        className={`relative p-6 rounded-lg shadow-lg max-w-full mx-auto mt-8 ${themeClass}`}
        style={{
          ...globalStyles,
          ...formSize,
          maxWidth: formData.formSize?.maxWidth || '100%',
        }}
      >
        {/* <h1 className="text-3xl font-bold mb-4">{formData.formTitle}</h1>  */}
          <>       
              { !loading && formData.table.columns && formData.table.actions && formData.table.columnWidths && formData.table.editFormConfig &&         
              <GridContainer  columns={formData.table.columns} rows={rows} actions={formData.table.actions} actionsTooltips={formData.table.actionsTooltips} 
                  rowToShow={formData.table.rowToShow} columnWidths={formData.table.columnWidths} onEdit={handleEdit} handleAdd={handleAdd} table={formData.table}
                  onDelete={handleDelete} editFormConfig={formData.table.editFormConfig} // Pasamos el editFormConfig a GridContainer
                  onZoom={handleZoom} label={formData.table.label} //requerido para los tooltips de la Actions
                  objectGrid={formData.table.objectGrid}//para el tooltips de los botones de actions
                />
              }
              {isModalOpen && formData.table.editFormConfig && formData.table.columns && formData.table.editFormConfig && (
                <EditForm isOpen={isModalOpen} onClose={() => reLoad()} theme={formData.table.editFormConfig.theme} // onSubmit={handleFormAdd} 
                  row={(editingRowIndex !== null && rows) ? rows[editingRowIndex] : {}} columns={formData.table.columns} formId={Number(formId)} apiGetRow={ formData.table.apiGetRow}
                  width={formData.editFormSize?.width} height={formData.editFormSize?.height} formConfig={ formData as FormConfigDFType} // Pasa el editFormConfig al componente de edición
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