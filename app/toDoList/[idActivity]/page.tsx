"use client";
/*
Este todoList se usa para las actividades de un proyecto, en el menu.subMenu está el patho de la página a la que se va a redirigir
*/
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

import { CustomButton, CustomGrid } from '@/components/controls';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { LoadingIndicator } from '@/components/general/LoadingIndicator';
import { GridRowType } from '@/types/interfaces';
import { toDoColumns } from '@/data/modalColumns';
import { getTasksByActivity } from '@/app/services/processEngine/getTaskByActivity';
import { getDiagramByIdProcess } from '@/app/services/processEngine/getDiagramByIdProcess';

type Params = {
  idActivity:string;
};
const columns=toDoColumns;
const ToDoListPage = ({ params }: { params: Params }) => {
  const router                                          = useRouter();
  const { data: session }                               = useSession();
  const user                                            = session?.user;
  const [ isLoading, setIsLoading ]                     = useState<boolean>( true );
  const [ selectedRow, setSelectedRow ]                 = useState();
  const [ rows, setRows ]                               = useState<GridRowType[]>([]);
  const [ captionGrid, setCaptionGrid ]                 = useState(''); 
  // const [ diagramDoc, setDiagramDoc ]                   = useState<any>(null);
  const [ activityName, setActivityName ]               = useState<string>('');

  const idActivity = Number(params.idActivity);
  const searchParams = useSearchParams();

   const idProcess = searchParams?.get('idProcess')
   ? Number(searchParams.get('idProcess'))
   : 0;
  const email = searchParams?.get('email');
  const perfil = searchParams?.get('role');
  const roles = searchParams?.get('roles');
  const path = searchParams?.get('path');
  //console.log('en ToDoList idActivity', idActivity,idProcess,path,email,perfil);

  const convertirTareasAGrid = (tareas: any[]): GridRowType[] => {
    return tareas.map(t => ({//falta usuarioCreador y ubicacionPanel
      _id: t._id,
      idTask: t.idTask,
      // idProcess: t.idProcess,
      // idProcessInstance: t.idProcessInstance,
      nameActivity: t.nameActivity,
      processName: t.processName,
      taskStatus: t.taskStatus,
      infoToDo: t.infoToDo,
      tipoDocumento: t.tipoDocumento,
      nroDocumento: t.nroDocumento,
      attributes: t.attributes,
      idProcessInstance: t.idProcessInstance,
    }));
  };

  useEffect(() => {
    const fetchDiagram= async (idProcess:number) => {
      try{
        if (idProcess){ //del diagrama se obtiene el nombre de la actividad
          const diagramDoc= await getDiagramByIdProcess(idProcess);
          // console.log('en ToDoList idProcess',idProcess,diagramDoc.activityProperties);
          const activityName=diagramDoc.activityProperties.find( (activity:any) => activity.idActivity === idActivity)?.nameActivity ?? '';
          setActivityName(activityName);
          // setDiagramDoc(diagramDoc);
        }
      }catch (err){
        console.log('error', err);
      }
    }
    setIsLoading(true);
    if (idProcess && idProcess>0){//revisa si al abrir existe idTask. Esto indica completar proyecto
      fetchDiagram(idProcess);
    }
   }, [idProcess,idActivity,activityName]);
  useEffect(()=>{
    if (!email || !roles) return;
    const rolesArray = JSON.parse(roles);
    // console.log('en ToDoList useEffect',email,idActivity,rolesArray,idProcess);
    getTasksByActivity(email, idActivity, rolesArray, idProcess)
    .then(data =>{
      // console.log('en ToDoList data',email,idActivity,rolesArray,idProcess,data);
      const filas:GridRowType[]=convertirTareasAGrid(data);
      setRows(filas);
      setIsLoading(false);
    })
    .catch(console.error)
    .finally(() => setIsLoading(false));

  }, [email, idActivity, roles, idProcess]);

  useEffect(()=>{
    if (rows && rows.length>0){
      const { nameActivity, processName } =rows[0];      
      setCaptionGrid(`Tareas del proceso: ${processName} -  de la actividad: ${activityName}` )
      setIsLoading(false);
    }
     //const columnsConfig = generateColumnConfig(rows, excelColumns);
  },[rows,activityName])
  const handleRowSelection = (row: any | null) => {
    // console.log('handleRowSelection row',row);
    setSelectedRow(row);
  };
  const handleEdit=(row:any)=>{
      const idTask=String(row.idTask); 
      const attrib=row.attributes[0]; //sólo 1 atributo
      // console.log('en ToDoList handleEdit attrib,idTask',attrib,idTask);
      const ubicacionPanel=attrib.ubicacionPanel;
      const menu= (ubicacionPanel === 'techo')?'4':'5';
      // const idProcessInstance=row.idProcessInstance;v 
      const nroDocumento=row.nroDocumento;
      // console.log('ubicacionPanel',ubicacionPanel);
      // console.log('path',path);//viene de sidebar
      //  console.log('row',row);
      const  newUrl=`${path}?menuId=${menu}&idTask=${idTask}&nroDocumento=${nroDocumento}`;//viene de cada actividad
      // console.log('newUrl',newUrl);
      const currentUrl = window.location.pathname + window.location.search;
      sessionStorage.setItem('prevFullPath', currentUrl);//para poder regresar a ésta página cargando de 0
      router.push(newUrl);
  }
  return (
    <> 
    {/* {console.log('jsx ',captionGrid)} */}
      <div>
      {(isLoading || !rows)?<LoadingIndicator  message='cargando' />
      :
       rows  && (    //alignItems: "center",display: "flex",
        <div style={{justifyContent: "left" ,paddingTop: "15px", paddingLeft: "10px"}}>
          <h1 className="text-3xl font-bold"  >Tus pendientes del proceso </h1>
        { rows && columns && 
        <div style={{ display: "flex",justifyContent: "center" ,paddingTop: "15px", paddingLeft: "10px"}}>
          <div className="p-6" style={{ marginTop: "50px",  width:'80%' }}>       
            <CustomGrid title={captionGrid} columns={columns} data={rows} 
              gridWidth="100%" rowsToShow={10} exportable={false} borderVertical={true} rowHeight="30px" selectable={true} actionsPositionTooltips={['left','left','left']}
              onRowSelect={handleRowSelection} fontSize="13px" actions={[ "edit"]}  onEdit={handleEdit} actionsTooltips= {["","Abrir tarea"]}
              labelButtomActions= {["", "", ""]}
            />
              <CustomButton  
                  buttonStyle="primary" size="small" htmlType="button" label="Volver a página inicial" 
                  icon={<FontAwesomeIcon icon={faHome} size="lg" color="white" />} onClick={() =>  router.push('/') }  //style={{ marginLeft:3, marginBottom:15}}
                  >
              </CustomButton>
            </div>
          </div>
        }
        </div>
       )
      }
      </div>
    </>
    );
};
export default ToDoListPage;