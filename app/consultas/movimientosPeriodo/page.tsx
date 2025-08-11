"use client";

import { useState } from "react";
import { useSession } from 'next-auth/react'; 
import { CustomButton, CustomDate, CustomLabel, CustomSelect } from "@/components/controls";
import { CustomGrid } from "@/components/controls/CustomGrid";
import { ColumnConfigType, GridRowType } from "@/types/interfaces";
import { faFileCirclePlus, faHome } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { format } from 'date-fns';
import CustomModal from "@/components/general/CustomModal";

const columns:ColumnConfigType<GridRowType>[] = [
    { key: "idCasa", label: "idCasa", captionPosition: "top",visible: false, editable: false, width: '50px', type: "number", options: undefined },
    { key: "fechaDocumento", label: "Fecha" , captionPosition: "top", visible: true, editable: false, width: '100px', type: "string", options: undefined }, 
    { key: "comentario", label: "Comentario/Casa" , captionPosition: "top", visible: true, editable: false, width: '100px', type: "string", options: undefined }, 
    { key: "ingreso", label: "Ingreso" , captionPosition: "top", visible: true, editable: false, width: '100px', type: "number", options: undefined }, 
    { key: "salida", label: "Salida" , captionPosition: "top", visible: true, editable: false, width: '100px', type: "number", options: undefined }, 
    { key: "saldo", label: "Saldo" , captionPosition: "top", visible: true, editable: false, width: '100px', type: "number", options: undefined }, 
  ]
  const infoOptions: {value:string,label:string}[] = [
    {value:'EMERGENCIA',label:'Fondo emergencia'},
    {value:'NORMAL',label:'Fondo normal'},
  ]
  const hoy = new Date();
  const formato = 'dd-MM-yyyy';
  const fechaFinDefault = format(hoy, formato);
  const primerDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
  const fechaInicioDefault = format(primerDiaMesAnterior, formato);
const MovimientosPeriodoPage = () => {
    const router = useRouter();
    const [ loading, setLoading             ]                       = useState<boolean>(true);
    const [ rows, setRows ]                                         = useState<GridRowType[]>([]);
    const [ gridColumns, setGridColumns ]                           = useState<ColumnConfigType<GridRowType>[]>(columns);
    const [ currentPage, setCurrentPage ]                           = useState<number>(0);
    const [ gridKey, setGridKey ]                                   = useState<number>(0);
    const [ informe, setInforme ]                                   = useState<string>('');
    const [ isModalOpen, setIsModalOpen ]                           = useState<boolean>(false);
    const [ movs, setMovs ]                                         = useState<GridRowType[]>([]);
    const [ fechaInicio, setFechaInicio ]                           = useState<string | null>(fechaInicioDefault);
    const [ fechaFin, setFechaFin ]                                 = useState<string | null>(fechaFinDefault);
    const { data: session, status }                                 = useSession();

    const email=session?.user.email;
    const userName=session?.user.name;
    const handleChangeInforme = (value: string) => {
        setInforme(value);
      }
      const handleChangeFechaInicio = (value: string) => {
        setFechaInicio(value);
      }
      const handleChangeFechaFin = (value: string) => {
        setFechaFin(value);
      }
      const fetchRows = async () => {
        setLoading(true);//tipoFondo=NORMAL&email=eramosarellano@gmail.com
        const [day, month, year] = fechaInicio?.split("-") || [];
        const fechaInicioFormatted = `${year}-${month}-${day}`;
        const [day2, month2, year2] = fechaFin?.split("-") || [];
        const fechaFinFormatted = `${year2}-${month2}-${day2}`;
       
        const response = await fetch(`/api/movimientos/movEntreFechas?fechaInicio=${fechaInicioFormatted}&fechaFin=${fechaFinFormatted}&tipoFondo=${informe}&email=${email}`);
        const data = await response.json();
        const rows = data.map((row: any) => ({
          ...row,
          fechaDocumento: new Date(row.fechaDocumento).toLocaleDateString('es-ES')
        }));
        setRows(rows); 
      }
      const handleZoom = async (row: GridRowType) => {
        const { idCasa }=row;
        const fechaInicial=row.fechaDocumento?.toString();
        const [day, month, year] = fechaInicial?.split("/") || [];
        let mes=month.toString();
        let dia=day.toString();
        if (Number(month)<10) { mes='0'+mes;}
        if (Number(day)<10) { dia='0'+dia;}
        const fechaInicioFormatted = `${year}-${mes}-${dia}`;  
        const [day2, month2, year2] = fechaFin?.split("-") || [];
        const fechaFinFormatted = `${year2}-${month2}-${day2}`;
        let movs:any[]=[];
        if (row.idCasa === 0) {
            if (row.comentario ==='Saldo inicial') {
                const response = await fetch(`/api/movimientos/movSaldoInicial?fechaInicio=${fechaInicioFormatted}&tipoFondo=${informe}&email=${email}`);
                movs = await response.json();

            }else{
              
                const response = await fetch(`/api/movimientos/movPeriodo?fechaInicio=${fechaInicioFormatted}&fechaFin=${fechaInicioFormatted}&tipoFondo=${informe}&email=${email}`);
                const data = await response.json();
                // movs=data.gastos;
                movs=data.gastos.filter((mov:any) => mov.comentario === row.comentario);
                if(row.ingreso && data.ingresos.length > 0){
                     movs=data.ingresos
                }
            }
        } else {
            const response = await fetch(`/api/movimientos/movPeriodo?fechaInicio=${fechaInicioFormatted}&fechaFin=${fechaFinFormatted}&tipoFondo=${informe}&email=${email}`);
            const data = await response.json();
            movs=data.gastos;
            if(row.ingreso && data.ingresos.length > 0){
                 movs=data.ingresos.filter((mov:any) => mov._id.idCasa === idCasa);//sólo los de la casa seleccionada
            }
        }
        const movimientos=movs.map((mov:any) => ({
            ...mov,
            fechaDocumento: new Date(mov.fechaDocumento).toLocaleDateString('es-ES')
        }));
        let saldo = 0;
        const movimientosConSaldo = movimientos.map((mov:any) => {
            const id=mov._id;
            let idCasa = 0;
            if (mov.ingreso > 0 && mov.salida === 0) idCasa =id.idCasa; //para hacer un zoom en la grilla si idCasa>0  y es ingreso
            saldo += (mov.ingreso || 0) - (mov.salida || 0);
            return {
                idCasa,
                ...mov,
                saldo
            };
        })
        setMovs(movimientosConSaldo);
        setIsModalOpen(true);
      }

      const handleGenerateInforme = () => {
        // console.log('en handleGenerateInforme',fechaInicio,fechaFin,informe,email);
        fetchRows();
      }
    return (
      <div className="p-4">
        <h1 className="text-3xl font-bold">Movimientos entre fechas</h1>
        <div className="mb-1 flex items-start space-x-3">
          <div className="w-1/5" >
            <CustomDate width='300px' theme="light"  label='Fecha de Inicio' placeholder="Ingresa la fecha de inicio" captionPosition='top' 
                format="dd-MM-yyyy" required={true}  onChange={setFechaInicio} value={fechaInicio}
            />
          </div>
          <div className="w-1/5" >
            <CustomDate width='300px' theme="light"  label='Fecha de Término' captionPosition='top'
                format="dd-MM-yyyy"  required={true}  onChange={(e:any) =>{ handleChangeFechaFin(e)}} value={fechaFin}
            />
          </div>
          <div className="w-1/5" >
            <CustomSelect width='250px' theme="light"  label='Tipo de Informe' captionPosition='top'
                                  onChange={(e:any) =>{ handleChangeInforme(e)}}
                                  options={infoOptions || []} required={true}
                                  placeholder="Seleccione informe"
            />
          </div>
          <div className="w-1/5" >
           {informe  && (informe.length>0) &&  
           <CustomButton
              buttonStyle="primary" size="small" htmlType="button" label="Generar informe" style={{ marginLeft:15, marginTop:50 }}
              icon={<FontAwesomeIcon icon={faFileCirclePlus} size="lg" color="white" />} onClick={() => {handleGenerateInforme()}} 
            > 
          </CustomButton>
          }
          </div>
        
         </div>
        {rows.length>0 && (
           <div className="flex justify-center items-center w-full">
              <CustomGrid rowsToShow={100} rowHeight='25px' fontSize='14px' exportable={true} actions={['zoom']} labelButtomActions={['','','','']}
                borderVertical={true}  columns={gridColumns} data={rows} currentPage={currentPage} key={gridKey} onZoom={handleZoom} 
                actionsTooltips={['','','','Ingresos por casa entre fechas o Gasto del día']}
              />
           </div>
        )}
        <CustomButton
            buttonStyle="primary" size="small" htmlType="button" label="Volver a página inicial" style={{ marginLeft:3, marginTop:15 }}
            icon={<FontAwesomeIcon icon={faHome} size="lg" color="white" />} onClick={() =>  router.push('/') } 
        > 
        </CustomButton>
       {isModalOpen && 
           <CustomModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} height='80vh' width='80%'
             title={`Movimientos entre ${fechaInicio} y ${fechaFin}`}
            >
            {/* <div className="flex justify-center items-center w-full">
                <CustomLabel label='Saldo final: '></CustomLabel>
            </div> */}
            <div className="flex justify-center items-center w-full">
                <CustomGrid rowsToShow={8} rowHeight='10px' fontSize='13px' exportable={true}  labelButtomActions={['','','','']}
                    borderVertical={true}  columns={gridColumns} data={movs} currentPage={currentPage} key={gridKey} onZoom={handleZoom} 
                    actionsTooltips={['','','','Ingresos por casa entre fechas o Gastos por día']}
                /> 
            </div>
        </CustomModal>        
        }       
      </div> 
    )
}
export default MovimientosPeriodoPage;







