"use client";
import { useEffect, useState, useContext, useRef, useCallback } from "react";
import { useRouter, useSearchParams  } from 'next/navigation';
import { Formik, Form, Field, useFormikContext } from "formik";
import * as Yup from "yup";
import { FeatureCollection, Geometry } from "geojson"; 
import { faEraser, faFloppyDisk, faMapLocation, faHome, faTrash} from '@fortawesome/free-solid-svg-icons';
import { ProjectDetailsForm } from "@/components/project/ProjectDetailsForm";

import { LocationForm } from "@/components/project/LocationForm";
import { Comunas, GridRowType, OptionsSelect, ProjectType } from "@/types/interfaces";
import { MapContext } from "../../context"; 

import { CustomButton, CustomFileInput, CustomGrid, CustomLabel } from "@/components/controls";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { processFileToGeoJSON } from "@/utils/kmzProcessor";
import { optionsConectionPointType, optionsLandType, OptionsProjectType, optionsStoneType, optionsCertificadoAccesoType, 
         optionsOrientationType, optionsCeilingElementType, techoOptions } from "@/data/selectType";
import CustomModal from "@/components/general/CustomModal";
import MapComponent from "@/components/maps/MapComponent";
import ActivityUploadSection from "@/components/activity/ActivityUploadSection";
import DynamicForm from "@/components/general/DynamicForm";
import { getNextActivityId } from "@/utils/getNextActivityId";
import { useSession } from 'next-auth/react'; 
import { activityColumns, activitiesColumnsDynamic } from "@/data/modalColumns";
import { sortGridByActivityId } from "@/utils/sortGridByActivityId";

import { formatProjectForFormik } from "@/utils/projectUtils/formatProjectForFormik";
import { getProjectById } from "@/app/services/projects/getProjectById";
import { updateProject } from "@/app/services/projects/updateProject";
import { useMenu } from '@/context/MenuContext';

const validationSchema = Yup.object({
    projectName: Yup.string().required("El nombre del proyecto es obligatorio"),
    region: Yup.string().required("Selecciona una región"),
    comuna: Yup.string().required("Selecciona una comuna"),
    direccion: Yup.string().required("La ubicación es obligatoria"),
    nivelPiedras: Yup.string().required("El nivel de piedras es obligatorio"),
    nivelFreatico: Yup.string().required("El nivel freático es obligatorio"),
  });
  
const NewProjectPage = () => {
  const router                                                  = useRouter();
  const searchParams                                            = useSearchParams();
  const menuId                                                  = Number(searchParams?.get("menuId"));//4 es techo, 5 es piso
  const idTask                                                  = Number(searchParams?.get("idTask"));
  const nroDocumento                                            = Number(searchParams?.get("nroDocumento"));
  const [ regiones, setRegiones ]                               = useState<OptionsSelect[]>();
  // const [ comuna, setComuna ]                                  = useState<number>(); 
  const [ loading, setLoading ]                                 = useState(true);
  const [ error, setError ]                                     = useState<string | null>(null);
  const [ geoJSONDataL, setGeoJSONDataL ]                       = useState<FeatureCollection<Geometry> | null>(null);//la L es por local para no confundir con setGeoJSONData del context
  const { setGeoJSONData, setSelectedKmlFile, selectedKmlFile } = useContext(MapContext);
  const [ isModalOpen, setIsModalOpen ]                         = useState(false);

  const [ columnsActivities, setColumnsActivities ]             = useState<any>(activityColumns);
  const [ selectedRow, setSelectedRow ]                         = useState<GridRowType | null>(null);//de las activities
  const [ isAdding, setIsAdding ]                               = useState(false);
  const [ isEditing, setIsEditing ]                             = useState(false);
  const [ editingRow, setEditingRow ]                           = useState<GridRowType | null>(null);
  const [ nextActivity, setNextActivity ]                       = useState<string>("");
  const [ isModalOpenKML, setIsModalOpenKML ]                   = useState(false);  
  const { data: session, status }                               = useSession();
  const [ isDirty, setIsDirty ]                                 = useState(false);
  const [ nextActivityToAdd, setNextActivityToAdd ]             = useState<string>();
  const [ activities, setActivities ]                           = useState<any[]>([]);
  const [ initialValues, setInitialValues ]                     = useState <ProjectType>({ idProject:0, projectName: "",
     ubicacionPanel: (menuId === 5) ? 'piso':'techo',  idRegion: 0, idComuna: 0, direccion: "",
     nroEmpalmes: 1,  empalmesGrid: [],  instalacionesGrid:[],techoGrid:[], kmlFileName: null, kmlFileContent: null, excelFileId: null, 
     activities:[{"numActividad":"1.0", actividad:"Inicial",fechaInicio:"","fechaTermino":"",duracion:0,"presupuesto": 0},],
     userModification:"", dateModification: "",state: "draft", tipoTerreno:"", nivelPiedras:"", nivelFreatico:0, nroInstalaciones:1,
 } );
 const { refreshMenu } = useMenu();
//  console.log('initialValues en regiones', regiones);
 const fetchRegiones = async (): Promise<OptionsSelect[]> => {
  const res = await fetch('/api/catalogs/regiones');
  if (!res.ok) throw new Error('Error al cargar regiones');
  return await res.json();
 };
 useEffect(() => {
  fetchRegiones().then(setRegiones);
 }, []);
 const loadProject =useCallback( async () => {  
   try {
     const raw = await getProjectById(nroDocumento);
     const formatted = formatProjectForFormik(raw);
     // 🔹 Carga archivos desde GridFS o contenido base64
     let excelFile: File | null = null;
     if (formatted.excelFileId) {
       const res = await fetch(`/api/files/${formatted.excelFileId}`);
       const blob = await res.blob();
       excelFile = new File([blob], formatted.excelFileName || 'archivo.xlsx', { type: blob.type });
     }
     let kmlFile: File | null = null;
     if (formatted.kmlFileContent) {
       const blob = new Blob([formatted.kmlFileContent], { type: 'application/vnd.google-earth.kml+xml' });
       kmlFile = new File([blob], formatted.kmlFileName || 'archivo.kml');
     }
     setInitialValues({
       ...formatted,
       excelFile,
       kmlFile,
       idTask
     });
     setLoading(false);
   } catch (error) {
     console.error('Error al cargar proyecto:', error);
   }
  }, [nroDocumento, idTask]); 
 useEffect(() => {
  if (nroDocumento > 0) {loadProject() } else { setLoading(false); }
}, [nroDocumento,loadProject]);
useEffect(() => {
   if (selectedRow) {
     const currentActivity = (selectedRow["numActividad"])? selectedRow["numActividad"].toString():'';
     const existingIds = new Set(activities?.map((row) => String(row["numActividad"]))); 
    //  console.log('en NewProjectPage useEffect selectedRow existingIds',existingIds,currentActivity);
     setNextActivityToAdd(getNextActivityId(currentActivity, existingIds));
   }
 }, [selectedRow, activities]); 
 const openMapModal = (geoJSONDataL: any) => {
    if (geoJSONDataL) {
      setGeoJSONData(geoJSONDataL);
      setSelectedKmlFile(selectedKmlFile); 
      setIsModalOpen(true); // 📌 Abre el modal      
    }
 }; 
 useEffect(() => {
    const fetchData = async (idTask:number) => {
      try {
        if (session?.user.id) {
          // await loadDataProject(idTask, Number(session.user.id), setInitialValues, initialValuesRef.current);
          loadProject();
        }
      } catch (err) {
        console.log('error', err);
      }
    };
    const init = async () => {
      setLoading(true);
      if (idTask && idTask > 0) {  // Revisa si al abrir existe idTask. Esto indica completar proyecto
        await fetchData(idTask);  
      } 
      setLoading(false);
    };
    init();
 }, [idTask, session?.user.id, setLoading,  loadProject]); //initialValues, setInitialValues,
 useEffect(() => { // Este useEffect actualiza el estado activities cuando cambia initialValues.activities, se usa para add activities
   if (initialValues.activities) {
     setActivities(initialValues.activities);
   }
 }, [initialValues.activities,setActivities]); 
 const handleFileUpload = async (file: File | null) => { 
    if (!file) {
      setError("No se seleccionó ningún archivo");
      return;
    }
    try {
      const geoJSON = await processFileToGeoJSON(file);
      if (geoJSON) {
        setGeoJSONDataL(geoJSON);
        setError(null); // Limpia cualquier error previo
      } else {
        setError("No se pudo procesar el archivo. Verificar que sea un archivo KML/KMZ válido.");
      }
    } catch (err) {
      console.error("Error al procesar el archivo:", err);
      setError("Ocurrió un error al procesar el archivo.");
    }
  };   
  const handleAbandon = () => {
    const confirmed = window.confirm(
      "¿Está seguro de que desea abandonar este proyecto? (perderá opción de completarlo y desaparecerá de tus pendientes)"
    );
  };   
  const handleExit = () => {
    const confirmed = window.confirm("¿Está seguro de que desea abandonar el proyecto? (perderá lo que haya hecho)" );
    if (confirmed) { 
      router.back();
    }
  };    
  const handleCloseModal = () => {
    const confirmed = window.confirm("¿Está seguro de cerrar el formulario y perder lo modificado?");
    if (confirmed) {
      setIsAdding(false);
      setIsEditing(false);
      setIsModalOpen(false); //Cierra el formulario si el usuario confirma
    }
  };   
  const SaveCompleteButton = ({ handleSaveComplete }: { handleSaveComplete: (values: any) => void }) => {
    const { values } = useFormikContext(); // 🔹 Obtiene los valores actuales del formulario 
    return (
      <CustomButton buttonStyle="primary" size='small' onClick={() => handleSaveComplete(values)} label='Guardar terminado'
        tooltipContent='Guardar el proyecto' tooltipPosition='left' icon={<FontAwesomeIcon icon={faFloppyDisk} size="lg" color="white" />} 
      />
    );
  };    
  const SaveDraftButton = ({ handleSaveDraft }: { handleSaveDraft: (values: any) => void }) => {
    const { values } = useFormikContext(); // 🔹 Obtiene los valores actuales del formulario 
    return (
      <CustomButton  buttonStyle="primary"  size="small" onClick={() => handleSaveDraft(values)} tooltipContent="Guardar borrador del proyecto"
        tooltipPosition="bottom" icon={<FontAwesomeIcon icon={faFloppyDisk} size="lg" color="white" />} label="Guardar borrador"  
      />
    );
  };
  const handleSaveComplete = async (vals:any) => { //console.log('save complete', vals);
    const userModification = session?.user.email || '';
    const userId = session?.user.id || '' ;
    const userName = session?.user.name || '';
    console.log('en handleSaveComplete idTask',idTask);
    const values={...vals,state:'complete',userModification,userId,userName,idTask:(idTask>0)?idTask:0};
    console.log('en handleSaveComplete values',values);
    // const { activities, ...generalValues } = vals;
    const result = await updateProject(values);
    console.log('result',result);
    // updateNewProject(vals, userModification,userId, 'complete',generalChanged, activitiesChanged);  
    router.push('/');
    refreshMenu();//pára refrescar el menú dinámico
  };
  const handleSaveDraft = async (vals:any) => { 
    // console.log('idTask',idTask,vals)
    // const { activities, ...generalValues } = vals;
    if (vals.projectName.length === 0) {
      window.alert("Para guardar un borrador mínimo debe ingresar el nombre del proyecto");
      return;      
    }     
    const userModification = session?.user.email || '';
    const userId = session?.user.id || '' ;
    const userName = session?.user.name || '';
    const values={...vals,state:'draft',userModification,userId,userName,idTask:(idTask>0)?idTask:0};
    console.log('en handleSaveDraft values',values); 
    const result = await updateProject(values); 
    console.log('result',result);    
    router.push('/');
    refreshMenu();//pára refrescar el menú dinámico
  };  
  const handleRowSelection = (row: any | null) => {
    setSelectedRow(row);
  };  
  if (loading || (nroDocumento > 0 && initialValues.projectName.length === 0)) {
    return <p>Cargando...</p>;//chequea si proyecto existe y al menos tiene name
  }  
  if (error) { return <p>{error}</p>; }  
  return ( // console.log('initialValues en createProject antes de renderizar', initialValues);
    <>
      <div className="p-4">
        <h1 className="text-3xl font-bold text-center">{(idTask && idTask>0) ? 'Completar ' : 'Crear un nuevo '}  
          proyecto fotovoltáico ubicado en {(menuId === 5) ? 'Piso' : 'Techo'}
        </h1>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={() => {}}
        >
          {({ values, errors, touched, setFieldValue, resetForm }) => {//no poner useEffect aqui porque se ejecuta cada vez que cambia el formulario      
            // useEffect(() => { console.log('🔍 Formik values actualizados:', values);     }, [values]); 
            const handleCancel = () => {
              const confirmed = window.confirm("¿Está seguro de que desea cancelar y limpiar el formulario?");
              if (confirmed) {     resetForm(); }
            };            
            const handleEdit = (row: any) => { setEditingRow(row);  setIsEditing(true);  setSelectedRow(row);  };             
            const handleAdd = () => {
              if (!selectedRow) { alert('Debe seleccionar la actividad previa a la que desea agregar.'); return;  }
              const currentActivity =(selectedRow["numActividad"])? selectedRow["numActividad"].toString():'';
              const existingIds = new Set(values.activities?.map((row) => String(row["numActividad"]))); 
              const newActivity = getNextActivityId(currentActivity, existingIds);
              setNextActivity(newActivity);
              setIsAdding(true);
            };            
            const handleDelete = (row: any) => {
              setEditingRow(row);
              const actividadId = row["NumActividad"];
              const hasChildren = values.activities.some(item =>
                item["numActividad"].toString().startsWith(`${actividadId}.`)
              );
              if (hasChildren) {
                alert(`No puedes eliminar la actividad "${actividadId} ${row.Actividad}" porque tiene actividades dependientes.`);
                return;
              }
              if (window.confirm(`¿Eliminar la actividad "${actividadId} ${row.Actividad}"?`)) {
                const newRows = values.activities.filter((item) => item["numActividad"] !== actividadId);
                setFieldValue("activities", newRows);
              }
            };
             const handleSave = (updatedRow: GridRowType) => {
              if (isAdding) {
                const newRows = values.activities ? sortGridByActivityId([...values.activities, updatedRow]) : [updatedRow];
                setFieldValue('activities', newRows);
              } else if (isEditing) {
                const updatedRows = values.activities?.map(row =>
                  row["numActividad"] === editingRow?.["numActividad"] ? updatedRow : row
                );
                setFieldValue('activities', updatedRows);
              }
              setIsAdding(false);
              setIsEditing(false);
              setEditingRow(null);
            };            
            return ( 
              <Form>
                <ProjectDetailsForm errors={errors} touched={touched} OptionsProjectType={OptionsProjectType} optionsLandType={optionsLandType} 
                  optionsStoneType={optionsStoneType} optionsConectionPointType={optionsConectionPointType} optionsCertificadoAccesoType={optionsCertificadoAccesoType} 
                  optionsOrientationType={optionsOrientationType} optionsCeilingElementType={optionsCeilingElementType} techoOptions={techoOptions}
                />                
                {regiones && (
                  <LocationForm regiones={regiones}  errors={errors}  touched={touched} />
                )}                 
                <div className="mb-4 flex items-center space-x-4">
                  <Field  name='kmlFile' component={CustomFileInput} showUploadButton={false} 
                    label="Archivo kml o kmz"  accept=".kml,.kmz" className="100%" useStandaloneForm={false} 
                    onUploadSuccess={(file: File | null) => {setSelectedKmlFile(file); handleFileUpload(file); setFieldValue('kmlFileName', file?.name); 
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          setFieldValue('kmlFileContent', reader.result); // Aquí se guarda el contenido real
                        };
                        reader.readAsText(file); // Lectura como texto (ideal para .kml)
                      } else {
                        setFieldValue('kmlFileContent', '');
                      }
                  }} 
                  />                   
                  {errors.kmlFileContent && touched.kmlFileContent && (<CustomLabel label={errors.kmlFileContent} fontColor={'#EF4444'}/> )}                   
                  {values.kmlFileContent && (<span className="ml-0 mt-2 text-blue-600 font-medium truncate max-w-xs">📄 {values.kmlFileName}</span>)}                  
                  <CustomButton buttonStyle="primary" htmlType="button" label="Abrir mapa" size="small"
                    onClick={() => { openMapModal(values.kmlFileContent);  setIsModalOpenKML(true); }} 
                    icon={<FontAwesomeIcon icon={faMapLocation} size="lg" color="white" />} style={{ marginTop:'10px' }} disabled={!(values.kmlFileContent)}
                  />                  
                  <CustomModal isOpen={isModalOpenKML} onClose={() => {setIsModalOpenKML(false);}} title="Mapa" height="160vh"  width="1000px" >
                    {values.kmlFileContent && ( <MapComponent geoJSONData={geoJSONDataL} /> )} 
                  </CustomModal>
                </div>                
                {(idTask === 0 || ( values.activities && values.activities[0].actividad === "Inicial")) && (
                  <div className="mb-4 flex items-center space-x-4">
                    <ActivityUploadSection />
                  </div>
                )}  
                {/* {alertMessage && ( <CustomAlert message={alertMessage} type={alertType} duration={3000} onClose={() => setAlertMessage(null)} /> )} */}
                {values.activities && values.activities.length > 1 && (
                  <div style={{ marginLeft:"0rem" }}>
                    <CustomGrid title="Actividades actuales" columns={columnsActivities}  data={values.activities} fontSize="13px"
                      actions={["add", "edit", "delete"]} labelButtomActions={[(selectedRow) ? `Agregar actividad ${nextActivityToAdd}` : 'Agregar actividad', "", ""]}
                      actionsTooltips={[
                        `Agregar actividad que sigue a la seleccionada (${nextActivityToAdd})`, 
                        "Editar esta actividad", 
                        "Eliminar esta actividad"
                      ]}
                      onAdd={handleAdd} onEdit={handleEdit}  onDelete={handleDelete} gridWidth="95%" rowsToShow={7} 
                      exportable={true} borderVertical={true} rowHeight="30px" selectable={true} onRowSelect={handleRowSelection}                 
                    />
                  </div>
                )}                
                {(isEditing || isAdding) && (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column",  }}>
                    <CustomModal isOpen={isEditing || isAdding} onClose={handleCloseModal} height='80vh' width="650px"
                      title={isAdding ? `Agregar actividad ${nextActivity}` : `Modificar actividad ${editingRow?.["numActividad"]}`}
                    > 
                      <DynamicForm columns={activitiesColumnsDynamic} onSave={handleSave}  onCancel={handleCloseModal}  setIsDirty={setIsDirty}   
                        initialValues={ editingRow || { "numActividad": nextActivity, actividad: "", presupuesto: "",  fechaInicio: "", fechaTermino: "", }} 
                      />
                    </CustomModal>
                  </div>
                )}                
                <div className="flex justify-left space-x-5 ">
                  <CustomButton  buttonStyle="primary" size="small" htmlType="button" label="Volver a página anterior" 
                    style={{ marginLeft:5 }} icon={<FontAwesomeIcon icon={faHome} size="lg" color="white" />} onClick={handleExit} 
                  />
                  {(idTask > 0) && (
                   <CustomButton style={{ marginLeft:155 }} buttonStyle="secondary" size='small' htmlType='button' tooltipContent='botar el proyecto' 
                     tooltipPosition='bottom' onClick={handleAbandon} icon={<FontAwesomeIcon icon={faTrash} size="lg" color="white" />} label='Abandonar proyecto'  
                   />
                  )}                  
                  {(idTask === 0) && (
                    <CustomButton buttonStyle="secondary" size='small' htmlType='button' tooltipContent='Limpiar el formulario' tooltipPosition='bottom' 
                      onClick={handleCancel} icon={<FontAwesomeIcon icon={faEraser} size="lg" color="white" />} label='Cancelar' 
                    />
                  )}                  
                  <SaveDraftButton handleSaveDraft={handleSaveDraft} />                 
                  <SaveCompleteButton handleSaveComplete={handleSaveComplete} />                  
                </div>
              </Form>
            );
          }}
        </Formik> 
      </div>
    </>
  );
};
export default NewProjectPage;