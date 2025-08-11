import { useEffect, useState } from 'react';
import { useFormikContext } from "formik";
import { CustomGrid } from '@/components/controls/CustomGrid';
import { GridRowType, ProjectType } from '@/types/interfaces';
import { getNextActivityId } from '@/utils/getNextActivityId';

interface ActivityGridSectionProps { //rows: GridRowType[]; // setRows: (rows: GridRowType[]) => void;
  columns: any;
  handleEdit: (row: GridRowType) => void;
  handleAdd: () => void;
  selectedRow: GridRowType | null;
  setSelectedRow: (row: GridRowType | null) => void;
}

const ActivityGridSection: React.FC<ActivityGridSectionProps> = ({ columns, handleEdit, handleAdd, selectedRow, setSelectedRow }) => {
  const { values, setFieldValue }                   = useFormikContext<ProjectType>(); 
  const [ nextActivityToAdd, setNextActivityToAdd ] = useState<string>();
  //console.log("🔹 ActivityGridSection re-render", values.activities,values.activities.length);
  //console.log("🔹 ActivityGridSection re-render", rows?.length);
  // useEffect(() => {
  //   console.log("🔹 ActivityGridSection - useEffect - values.activities:", values.activities.length);
  // }, [values.activities]);
  useEffect(()=>{
    if ( !selectedRow ) return;
    console.log('en ActivityGridSection selectedRow',selectedRow);
    const currentActivity = ( selectedRow["numActividad"])?selectedRow["numActividad"].toString():'';
    const existingIds = new Set(values.activities?.map((row) => String(row["numActividad"]))); 
    setNextActivityToAdd( getNextActivityId(currentActivity,existingIds));
  },[selectedRow, values.activities])
  
  if (values.activities.length === 0) return null; 

  const handleRowSelection = (row: any | null) => {
    console.log('en ActivityGridSection handleRowSelection',row);
    setSelectedRow(row);
  };
  const handleDelete = (row: any) => {
      const actividadId = values.activities[0]["numActividad"];
      const hasChildren = values.activities?.some(item =>// 📌 Verificar si hay hijos en las rows 
        item["numActividad"].toString().startsWith(`${actividadId}.`)
    );
    if (hasChildren) {
      alert(`No puedes eliminar la actividad "${actividadId} ${row.Actividad}" porque tiene actividades dependientes.`);
      return;
    }
    if (window.confirm(`¿Eliminar la actividad "${actividadId} ${row.Actividad}"?`)) {
      const newRows=values.activities.filter((item) => item["numActividad"] !== actividadId)
      //setRows(values.activities.filter((item) => item["NumActividad"] !== actividadId));
      setFieldValue('activities',newRows) 
    }
  };
  return (
    <>
    {/* {console.log('JSX ActivityGridSection',values.activities.length)} */}
      <div style={{ marginLeft:"0rem"}}  >
        <CustomGrid title="Actividades actuales" columns={columns} data={values.activities} actions={["add", "edit", "delete"]}
          labelButtomActions={[(selectedRow)?`Agregar actividad ${nextActivityToAdd}`:'Agregar actividad' , "", ""]}
          actionsTooltips={[`Agregar actividad que sigue a la seleccionada (${nextActivityToAdd})`, "Editar esta actividad", "Eliminar esta actividad"]}
          onAdd={handleAdd} onEdit={() =>handleEdit} 
          onDelete={handleDelete} 
          gridWidth="95%" rowsToShow={7} exportable={true} borderVertical={true} rowHeight="30px" selectable={true}
          onRowSelect={handleRowSelection} fontSize="13px"
        />
      </div>
    </>
  );
};
export default ActivityGridSection;