"use client";
import { useEffect,  useState  } from 'react';
import { useSession } from 'next-auth/react'; 
import { useRouter, useSearchParams  } from 'next/navigation';
import * as Yup from "yup";
import { loadDataActivityWithFilesAndEmails } from '@/app/services/loadPages/loadDataActivityWithFilesAndEmails';

import { ActivityType, OptionsSelect } from '@/types/interfaces';
import { Field, Form, Formik, useFormikContext  } from 'formik';
import { CustomButton, CustomDate, CustomInput, CustomLabel, CustomSelect } from '@/components/controls';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEraser, faFloppyDisk, faHome } from '@fortawesome/free-solid-svg-icons';
import { formEjecucionActividadOptions } from '@/data/selectType';
import { LoadingIndicator } from '@/components/general/LoadingIndicator';
import { updateActivity } from '@/app/services/projectActivity/updateActivity';
import { usePreviousFullUrl } from '@/hooks/usePreviousFullUrl';
import { useMenu } from '@/context/MenuContext';

import { getUsersByPerfilForOptions } from '@/app/services/users/getUsersByPerfilForOptions';
import { calculateDuration } from '@/utils/calculateDuration';
const validationSchema = Yup.object({
    formaEjecucion: Yup.string().required("La forma de ejecución de la actividad es obligatoria"),
    responsable: Yup.string().required("Seleccione el responsable de la actividad"),

  });
  
const AdminActivityPage = () => {
    const router                                                  = useRouter();
    const previousUrl                                             = usePreviousFullUrl();
    const searchParams                                            = useSearchParams();
    const { data: session, status }                               = useSession();
    const [ userEmail, setUserEmail ]                             = useState<string>('');
    const [ loading, setLoading ]                                 = useState(true);
    const [ responsablesOptions, setResponsablesOptions ]         = useState<OptionsSelect[]>();
    const idTask                                                  = Number(searchParams?.get("idTask"));
    const [ initialValues, setInitialValues ]                     = useState <ActivityType>({ 
        numActividad:'', actividad:'', fechaInicio: '' ,fechaTermino:'', duracion: 0 ,presupuesto:0,idTask:0, idTransaction:0,
        idProjectActivity:0, idProject: 0, projectName: '', userResponsable:'', formaEjecucion:'', periodoControl:'', userEjecutor:'',
        ubicacionPanel:'',  nroInstalaciones:1,
        tipoTerreno:"", nivelPiedras:"", nivelFreatico:0,idProcessInstance:0,idActivity:0
     } 
    );
    const { refreshMenu } = useMenu();
    //  console.log('AdminActivityPage idTask-previousUrl',idTask,previousUrl);
    useEffect(()=>{
        const cargaResponsables=async () => setResponsablesOptions(  await getUsersByPerfilForOptions('Responsable de actividad'));
        cargaResponsables();          
    },[])
    useEffect(() => {
      const fetchData= async (idTask:number) => {
        try{
          if (session?.user.id)  {
            const email=session.user.email;
            const userName=session?.user.name?session?.user.name:'';   
            await loadDataActivityWithFilesAndEmails(idTask,email,userName,setInitialValues);
          }
        }catch (err){
          console.log('error', err);
        }
      }  
      if (idTask && idTask>0){
        fetchData(idTask);  
        setLoading(true);
      }     
     }, [idTask,session?.user.id, session?.user.email,session?.user.name]); 
     const SyncDuracion = () => {//Para sacar el useEffect fuera de Formik
      const { values, setFieldValue } = useFormikContext<any>();   
      useEffect(() => {
        if (values.fechaInicio && values.fechaTermino) {
          const duracionDias = calculateDuration(values.fechaInicio, values.fechaTermino);
          setFieldValue("duracion", duracionDias);
        }
      }, [values.fechaInicio, values.fechaTermino, setFieldValue]);    
      return null; // Este componente no renderiza nada visible
    };
     useEffect(() =>{
        if (session)  setUserEmail(session?.user.email);
     },[session]) 
     useEffect(() => { 
        if (initialValues.idProject && initialValues.idProject>0 ){
            setLoading(false);
        }
     },[initialValues.idProject]);
     const volver = () => {
      if (previousUrl) {
        router.push(previousUrl);
      } else {
        router.back(); // fallback si no hay previa
      }
      refreshMenu();//pára refrescar el menú dinámico
     };
     const handleExit = () => {
        // const confirmed = window.confirm( // "¿Está seguro de que desea abandonar el proyecto? (perderá lo que haya hecho)" // );
        //if (confirmed) { 
            router.back()   
        //}
      };  
     if ( loading ){  
        return <LoadingIndicator  message='cargando'  />;        
     }
  return(
    <>    {/* { console.log('JSX AdminActivity initialValues',loading,initialValues.fechaInicio, initialValues.fechaTermino) } */}
     { !loading &&
     <div className="p-4">
       <p className="text-3xl font-bold text-center" > Define responsable y forma de ejecución de la actividad {initialValues.numActividad}</p>
       <p  className="text-2xl font-bold text-center"> {`Proceso: (N°${initialValues.idProject}) "${initialValues.projectName}"`}</p>
       <Formik
         initialValues={initialValues} validationSchema={validationSchema}  enableReinitialize
         onSubmit={async (values, { setSubmitting, setStatus }) => {
          try {
            await updateActivity({ ...values, usuarioModificacion: userEmail, finListaProveedores: 'completada', });
            volver();
          } catch (error) {
            setStatus({ error: 'Hubo un problema al guardar los datos' });
            console.error(error);
          } finally {
            setSubmitting(false);
          }
         }}
       >
         {({ values, errors, touched, setFieldValue, resetForm, isSubmitting, status}) => {
              if (isSubmitting) {
                return <LoadingIndicator message="Guardando información" />;
              }
          return ( 
          <Form>
            {status?.success && (
            <div className="text-green-600 mb-4">{status.success}</div>
            )}
            {status?.error && (
              <div className="text-red-600 mb-4">{status.error}</div>
            )}
            <div className="mb-1 flex items-start space-x-2">
                <div className="w-3/5">
                    <Field name="actividad" type="text" as={CustomInput} label="Descripción de la actividad" placeholder="Ingresa la descripción de la actividad"
                    error={touched.actividad && errors.actividad ? errors.actividad : undefined} required theme="light" width="100%" 
                    onChange={(e:any) => setFieldValue("actividad", e.target.value)}
                    />
                </div>
            </div>   
           <div className="mb-1 flex items-start space-x-2">
             <div className="w-1/5">
                <Field name="fechaInicio" as={CustomDate}  label="Fecha de inicio" placeholder="Ingresa la fecha de inicio"  //error={touched.fechaInicio && errors.fechaInicio ? errors.fechaInicio : undefined} 
                required theme="light" width="100%" format="dd-MM-yyyy" //onChange={(e:any) => setFieldValue("fechaInicio", e.target.value)}
                />
            </div>
            <div className="w-1/5">
                <Field name="fechaTermino" as={CustomDate} label="Fecha de término" placeholder="Ingresa la fecha de término"                //error={touched.fechaTermino && errors.fechaTermino ? errors.fechaTermino : undefined} 
                required theme="light" width="100%" format="dd-MM-yyyyy" onChange={(e:any) => setFieldValue("fechaInicio", e.target.value)}
                />
            </div>
            <div className="w-1/5" >
                {(values.duracion && values.duracion>0)
                ?
                <div style={{marginTop:'18px'}} >
                  <CustomLabel label={`(Duración en días:(${values.duracion})`} size='normal+'   />
                </div>
                :
                <div style={{marginTop:'18px'}} >
                  <CustomLabel label={`(Duración en días: No definida)`} size='normal+'   />
                </div>
                }
            </div>
           </div>
           <div className="mb-1 flex items-start space-x-2">
               <div className="w-1/5" >
                <Field name="presupuesto" type="number" as={CustomInput} label="Presupuesto" placeholder="Ingresa presupuesto de la actividad"
                    error={touched.presupuesto && errors.presupuesto ? errors.presupuesto : undefined} theme="light" width="70%" formatNumber={true}
                    onChange={(e:any) => setFieldValue("presupuesto", e.target.value)} textAlign='right' style={{marginTop:'2px'}}
                />
               </div> 
               <div className="w-1/5" >
               <Field as={CustomSelect}  width="100%" required   
                    label="Responsable asignado" name='responsable' options={responsablesOptions || []} placeholder="Asigne al responsable"
                    />
               </div>   
               <div className="w-1/5" >
               <Field as={CustomSelect} width="100%" required  
                    label="Forma de ejecución actividad" name='formaEjecucion' options={formEjecucionActividadOptions || []} placeholder="Defina forma de ejecución"
                    />
               </div>   
           </div>
              <div className="flex justify-center ">
                <CustomButton buttonStyle="primary" size='small' htmlType='submit' tooltipContent='Define forma de ejecución y responsable' tooltipPosition='left' 
                    icon={<FontAwesomeIcon icon={faFloppyDisk} size="lg" color="white" />} label='Actualizar actividad' />
              </div>
              <SyncDuracion />
           </Form>
           )
         }}
       </Formik>
       <CustomButton buttonStyle="primary" size="small" htmlType="button" label="Volver al página anterior" tooltipContent='Volver a seleccionar otra actividad' tooltipPosition='right' 
          style={{ marginLeft:5 }} icon={<FontAwesomeIcon icon={faHome} size="lg" color="white" />} onClick={ handleExit } 
       />
     </div>     
     }
    </>
    );
}
export default AdminActivityPage;