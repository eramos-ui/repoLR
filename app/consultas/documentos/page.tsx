"use client";

import { useEffect, useState } from "react";
// import { useSession } from 'next-auth/react'; 
import { ColumnConfigType, GridRowType } from "@/types/interfaces";
import { useRouter } from "next/navigation";
import { LoadingIndicator } from "@/components/general/LoadingIndicator";
import { CustomSelect } from "@/components/controls/CustomSelect";
import { CustomButton, CustomGrid } from "@/components/controls";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";

const columns:ColumnConfigType<GridRowType>[] = [
    { key: "updatedAt", label: "Fecha subido", captionPosition: "top",visible: true, editable: false, width: '90px', type: "Date", options: undefined },
    { key: "filename", label: "Nombre del documento" , captionPosition: "top", visible: true, editable: false, width: '300px', type: "string", options: undefined, sortable:true}, 
    { key: "authorSubidoPor", label: "Autor/sitio web/subido por" , captionPosition: "top", visible: true, editable: false, width: '200px', type: "string", options: undefined, sortable: true  }, 
    { key: "fileMetaId", label: "MetaId" , captionPosition: "top", visible: false, editable: false, width: '100px', type: "string", options: undefined, sortable:false},
    { key: "fuente", label: "Origen del documento" , captionPosition: "top", visible: true, editable: false, width: '200px', type: "string", options: undefined, sortable:false},  
  ]
const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000';
const ConsultaRepositorioPage = () => {
    const router = useRouter();
    const [ loading, setLoading             ]                       = useState<boolean>(true);
    const [ rows, setRows ]                                         = useState<GridRowType[]>([]);
    const [ temaOptions, setTemaOptions ]                           = useState<{value:number,label:string}[]>([]);
    const [ temaSelected, setTemaSelected ]                         = useState<number>();
    const [ gridColumns, setGridColumns ]                           = useState<ColumnConfigType<GridRowType>[]>(columns);
    const [ currentPage, setCurrentPage ]                           = useState<number>(0);
    const [ gridKey, setGridKey ]                                   = useState<number>(0);

    useEffect(() => {
      const fetchData = async () => {
          const response = await fetch('/api/forms/loadOptions/getTemas');
          const data = await response.json();
          // console.log('tema',data);
          let dataPlusAll=data; 
          dataPlusAll.push({value:9999,label:' Todos los documentos del repositorio'});
          setTemaOptions(dataPlusAll.map((tema: any) => (tema))
                .sort((a: { label: string; }, b: { label: string; }) => {//orden alfabético
                  if (!a.label) return 1;
                  if (!b.label) return -1;
                  return String(a.label).localeCompare(String(b.label));
            }));
            setLoading(false);
      }
      fetchData();
    }, []);
    useEffect(() =>{
      const fetchRows = async () => {
        setLoading(true);     
        const response = await fetch(`/api/files/getAprobados/?idTema=${temaSelected}`);//?fechaInicio=${fechaInicioFormatted}&fechaFin=${fechaFinFormatted}&tipoFondo=${informe}&email=${email}&idCasa=${idCasa}
        const data = await response.json();
        // console.log('rows',data);
        setRows(data.items);
        setLoading(false);
      }
      if (temaSelected && temaSelected >= 0){
          // console.log('en useEffect temaSelected',temaSelected)
          fetchRows();
      }
    },[temaSelected])
    const handleOnZoom=( row:any)=>{
      const idFileMeta=row.gridFsId;
      let ruta=`/view/${idFileMeta}`;
      // console.log('ruta',ruta)
      router.push(`${ruta}`);
    } 
    if (loading) {
        < LoadingIndicator/>
        return;
    }
    const handleChange=(value: number) =>{      
    // console.log('handleSelect',value)
    setTemaSelected(value);
    }
 return(
  <div className="p-4">
    <h1 className="text-3xl font-bold">Consulta documentos en el repositorio</h1>
    <div className="mb-1 flex items-start space-x-3">
       { 
        temaOptions &&   
        <div className="w-1/5" >
          <CustomSelect  width='300px' theme="light"  label='Temas' captionPosition='top'
                    onChange={(e:any) =>{ handleChange(e)}} value={temaSelected?.toString()}
                    options={temaOptions || []}
                    placeholder="Seleccione tema"
          />
        </div>
       }    
      </div>
      {(rows && rows.length>0) ? (
           <div className="flex justify-center items-center w-full">
              <CustomGrid rowsToShow={50} rowHeight='25px' fontSize='14px' exportable={true} actions={['zoom-file']} labelButtomActions={['','','','']}
                borderVertical={true}  columns={gridColumns} data={rows} currentPage={currentPage} key={gridKey} //onZoom={handleZoom} 
                actionsTooltips={['','','','Abrir documento']} onZoom={handleOnZoom}
              />
           </div>
        ):
        ( (temaSelected) &&
        <div>Ningún documento encontrado</div>
        )}
        <CustomButton
            buttonStyle="primary" size="small" htmlType="button" label="Volver a página inicial" style={{ marginLeft:3, marginTop:15 }}
            icon={<FontAwesomeIcon icon={faHome} size="lg" color="white" />} onClick={() =>  router.push('/') } 
        > 
        </CustomButton>
  </div>
 );
}
export default ConsultaRepositorioPage;