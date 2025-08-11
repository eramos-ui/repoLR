"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustomButton, CustomGrid, CustomSelect } from '@/components/controls';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileCirclePlus, faHome } from '@fortawesome/free-solid-svg-icons';
import { ColumnConfigType, GridRowType } from '@/types/interfaces';
import { LoadingIndicator } from '@/components/general/LoadingIndicator';

const columns:ColumnConfigType<GridRowType>[] = [
  { key: "idCasa", label: "idCasa", captionPosition: "top",visible: false, editable: false, width: '50px', type: "number", options: undefined },
  { key: "codigoCasa", label: "Casa" , captionPosition: "top", visible: true, editable: false, width: '50px', type: "string", options: undefined },
  { key: "familia", label: "Familia", captionPosition: "top", visible: true, editable: false, width: '220px', type: "string", options: undefined },
  { key: "ene", label: "Enero", captionPosition: "top", visible: true, editable: false, width: '100px', type: "number", options: undefined },
  { key: "feb", label: "Febrero", captionPosition: "top", visible: true, editable: false, width: '100px', type: "number", options: undefined },
  { key: "mar", label: "Marzo", captionPosition: "top", visible: true, editable: false, width: '100px', type: "number", options: undefined },
  { key: "abr", label: "Abril", captionPosition: "top", visible: true, editable: false, width: '100px', type: "number", options: undefined },
  { key: "may", label: "Mayo", captionPosition: "top", visible: true, editable: false, width: '100px', type: "number", options: undefined },
  { key: "jun", label: "Junio", captionPosition: "top", visible: true, editable: false, width: '100px', type: "number", options: undefined },
  { key: "jul", label: "Julio", captionPosition: "top", visible: true, editable: false, width: '100px', type: "number", options: undefined },
  { key: "ago", label: "Agosto", captionPosition: "top", visible: true, editable: false, width: '100px', type: "number", options: undefined },
  { key: "sep", label: "Septiembre", captionPosition: "top", visible: true, editable: false, width: '100px', type: "number", options: undefined },
  { key: "oct", label: "Octubre", captionPosition: "top", visible: true, editable: false, width: '100px', type: "number", options: undefined },
  { key: "nov", label: "Noviembre", captionPosition: "top", visible: true, editable: false, width: '100px', type: "number", options: undefined },
  { key: "dic", label: "Diciembre", captionPosition: "top", visible: true, editable: false, width: '100px', type: "number", options: undefined },
  { key: "totalAnual", label: "Total", captionPosition: "top", visible: true, editable: false, width: '100px', type: "number", options: undefined },

]
const infoOptions: {value:string,label:string}[] = [
    {value:'INGRESO_EMERGENCIA',label:'Ingreso fondo emergencia'},
    {value:'INGRESO_NORMAL',label:'Ingreso fondo normal'},
    {value:'INGRESO_TODOS',label:'Ingreso totales'},
    {value:'GASTO_EMERGENCIA',label:'Gasto fondo emergencia'},
    {value:'GASTO_NORMAL',label:'Gasto fondo normal'},
    {value:'GASTO_TODOS',label:'Gasto totales'},
]
const InformeMensualPage = () => {
  const router = useRouter();
  const [ loading, setLoading             ]                       = useState(true);
  const [ rows, setRows ]                                         = useState<GridRowType[]>([]);
  const [ yearsOptions, setYearsOptions ]                         = useState<{value:number,label:string}[]>([]);
  const [ informe, setInforme ]                                   = useState<string>('');
  const [ year, setYear ]                                         = useState<number>(0);
  const [ currentPage, setCurrentPage ]                           = useState<number>(0);
  const [ gridKey, setGridKey ]                                   = useState<number>(0);
  


  const [ gridColumns, setGridColumns ]                           = useState<ColumnConfigType<GridRowType>[]>(columns);
  useEffect(() => {
        const fetchData = async () => {
            const response = await fetch('/api/carteraIngreso/years');
            const data = await response.json();
            setYearsOptions(data.map((year: any) => ({ label:  String(year._id), value: Number(year._id) }))
                 .sort((a: { value: number; }, b: { value: number; }) => b.value - a.value));
            // console.log('yearsOptions',data);
            setLoading(false);
        }
        fetchData();
  }, []);

  const handleChange = (value: string) => {
    setYear(Number(value));
    // console.log('value',value);
  }
  const handleChangeInforme = (value: string) => {
    setInforme(value);
    // console.log('value',value);
  }
  const fetchRows = async () => {
    setLoading(true);
    if (informe.startsWith('INGRESO')) {
      const response = await fetch(`/api/carteraIngreso/agrupado?year=${year}&clase_movimiento=${informe}`);
      const data = await response.json();
      setRows(data); 
    } else {
      const response = await fetch(`/api/carteraGasto/agrupadoGasto?year=${year}&clase_movimiento=${informe}`);
      const data = await response.json();
      setRows(data);   
    }
  }
  const handleGenerateInforme = () => {
    setCurrentPage(0);
    setGridKey(prev => prev + 1); // Forzar re-render montando de nuevo la grid
      // Actualizar columnas condicionales
    const updatedColumns = columns.map((col) => {
      if (col.key === "codigoCasa") {
        return {
          ...col,
          label: informe.startsWith("INGRESO") ? "Casa" : "Gasto"
        };
      }
      if (col.key === "familia") {
        return {
          ...col,
          label: informe.startsWith("INGRESO") ? "Familia" : "Tipo de gasto"
        };
      }
      return col;
    });
    setGridColumns(updatedColumns);
    fetchRows();
    setLoading(false);
  }
  if ( loading ){  
    return <LoadingIndicator  message='cargando'  />;        
 }
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold">Informe Mensual</h1>
      <div className="mb-1 flex items-start space-x-3">
        <div className="w-1/5" >
          <CustomSelect  width='180px' theme="light"  label='Año' captionPosition='top'
                                onChange={(e:any) =>{ handleChange(e)}}
                                options={yearsOptions || []}
                                placeholder="Seleccione año"
          />
        </div>
        <div className="w-1/5" >
          <CustomSelect width='300px' theme="light"  label='Informe' captionPosition='top'
                                onChange={(e:any) =>{ handleChangeInforme(e)}}
                                options={infoOptions || []}
                                placeholder="Seleccione informe"
          />
        </div>
        <div className="w-1/5" >
         {informe && year>0 && (informe.length>0) &&  
         <CustomButton
            buttonStyle="primary" size="small" htmlType="button" label="Generar informe" style={{ marginLeft:25, marginTop:50 }}
            icon={<FontAwesomeIcon icon={faFileCirclePlus} size="lg" color="white" />} onClick={() => {handleGenerateInforme()}} 
          > 
        </CustomButton>
        }
        </div>
      </div>
      {rows.length>0 && (
        <CustomGrid rowsToShow={100} rowHeight='25px' fontSize='14px' gridWidth='100%' exportable={true} 
           borderVertical={true}  columns={gridColumns} data={rows} currentPage={currentPage} key={gridKey}//   onRowClick={handleRowClick}
        />
      )}
      <CustomButton
          buttonStyle="primary" size="small" htmlType="button" label="Volver a página inicial" style={{ marginLeft:3, marginTop:15 }}
          icon={<FontAwesomeIcon icon={faHome} size="lg" color="white" />} onClick={() =>  router.push('/') } 
      > 
     </CustomButton>
     </div>
  );
};

export default InformeMensualPage;