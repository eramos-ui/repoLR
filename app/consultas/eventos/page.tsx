"use client";

import { useRouter } from "next/navigation";
import { CustomButton, CustomGrid } from "@/components/controls";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ColumnConfigType, GridRowType } from "@/types/interfaces";
import { LoadingIndicator } from "@/components/general/LoadingIndicator";
import { useEffect, useState } from "react";

const columns:ColumnConfigType<GridRowType>[] = [
    { key: "fechaEvento", label: "Fecha evento y hora", captionPosition: "top",visible: true, editable: false, width: '150px', type: "Date", options: undefined },
    { key: "descripcion", label: "Descripcion" , captionPosition: "top", visible: true, editable: false, width: '300px', type: "string", options: undefined, sortable:true}, 
    { key: "ubicacion", label: "Ubicación" , captionPosition: "top", visible: true, editable: false, width: '300px', type: "string", options: undefined, sortable: true  }, 
    // { key: "fileMetaId", label: "MetaId" , captionPosition: "top", visible: false, editable: false, width: '100px', type: "string", options: undefined, sortable:false},
    // { key: "fuente", label: "Origen del documento" , captionPosition: "top", visible: true, editable: false, width: '100px', type: "string", options: undefined, sortable:false},  
  ]

const ConsultaEventosPage = () => {
    const router = useRouter();
    const [ loading, setLoading ]                                   = useState<boolean>(true);
    const [ rows, setRows ]                                         = useState<GridRowType[]>([]);
    const [ currentPage, setCurrentPage ]                           = useState<number>(0);

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch('/api/eventos/futuros');
            const data = await response.json();
             console.log('tema',data);
             setRows(data.eventos) 
             setLoading(false);
        }
        fetchData();
      }, []);
      const fetchRows = async () => {
        setLoading(true);
      
        const response = await fetch(`/api/files/getAprobados/?idTema=0`);//?fechaInicio=${fechaInicioFormatted}&fechaFin=${fechaFinFormatted}&tipoFondo=${informe}&email=${email}&idCasa=${idCasa}
        const data = await response.json();
        // console.log('rows',data);
       
        setRows(data.items);
        setLoading(false);
    }
    if (loading) {
        < LoadingIndicator/>
        return;
    }
return (
    <div className="p-4">
        {rows && rows.length>0 && (
            <div className="flex justify-center items-center w-full">
            <CustomGrid rowsToShow={100} rowHeight='25px' fontSize='14px' exportable={true} labelButtomActions={['','','','']}
                borderVertical={true}  columns={columns} data={rows} currentPage={currentPage} //key={gridKey} //onZoom={handleZoom} actions={['zoom-file']} 
                actionsTooltips={['','','','Abrir documento']} //onZoom={handleOnZoom}
            />
            </div>
        )}
        <CustomButton
        buttonStyle="primary" size="small" htmlType="button" label="Volver a página inicial" style={{ marginLeft:3, marginTop:15 }}
        icon={<FontAwesomeIcon icon={faHome} size="lg" color="white" />} onClick={() =>  router.push('/') } 
        > 
        </CustomButton>
    </div>
  )

}
export default ConsultaEventosPage;