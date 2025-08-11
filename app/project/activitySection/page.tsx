"use client";
import { useState } from 'react';
// import ActivityUploadSection from '../../components/activity/ActivityUploadSection';
import ActivityUploadSection from '@/components/activity/ActivityUploadSection';
//import ActivityGridSection from '../../components/activity/ActivityGridSection';
import ActivityGridSection from '@/components/activity/ActivityGridSection';
//import ActivityNavigationSection from '@/app/components/activity/ActivityNavigationSection';
import ActivityNavigationSection from '@/components/activity/ActivityNavigationSection';
import { GridRowType } from '@/types/interfaces';
//import { getNextActivityId } from '@/app/utils/getNextAcivityId';
import { getNextActivityId } from '@/utils/getNextActivityId';
//import { sortGridByActivityId } from '@/app/utils/sortGridByActivityId';
import { sortGridByActivityId } from '@/utils/sortGridByActivityId';
import CustomModal from '@/components/general/CustomModal';
import DynamicForm from '@/components/general/DynamicForm';


const ActivitySection = () => {
  const [ rows, setRows ]                 = useState<GridRowType[]>([]);
  const [ columns, setColumns ]           = useState<any>();
  const [ formColumns, setFormColumns ]   = useState<any>();
  const [ selectedRow, setSelectedRow ]   = useState<GridRowType | null>(null);

  const [ isAdding, setIsAdding ]         = useState(false);
  const [ isEditing, setIsEditing ]       = useState(false);
  const [ editingRow, setEditingRow ]     = useState<GridRowType | null>(null);
  const [ nextActivity, setNextActivity ] = useState<string>("");
  const [ isDirty, setIsDirty ]           = useState(false);

  const handleEdit = (row: GridRowType) => {
    setEditingRow(row);
    setIsEditing(true);
    console.log("Editar actividad:", row);
  };
  const handleAdd = () => {
    if (!selectedRow) {
      alert(`Debe seleccionar la actividad previa a la que desea agregar.`);
      return;
    }
    //console.log('selectedRow',selectedRow);
    const currentActivity = ( selectedRow["NumActividad"])?selectedRow["NumActividad"].toString():'';
    // console.log('existingIds',currentActivity);
    const existingIds = new Set(rows?.map((row) => String(row["NumActividad"]))); // Obtener todos los IDs existentes en la grilla
     const newActivity = getNextActivityId(currentActivity,existingIds);
    // console.log("Agregar nueva actividad", selectedRow,newActivity);
     setNextActivity(newActivity);
     setIsAdding(true);
  };
  const handleSave = (updatedRow: GridRowType) => {
    if (isAdding) {
      const newRows = rows ? sortGridByActivityId([...rows, updatedRow]) : [updatedRow];
      setRows(newRows);
    } else if (isEditing) {
      const updatedRows = rows?.map(row =>
        row["NumActividad"] === editingRow?.["NumActividad"] ? updatedRow : row
      );
      setRows(updatedRows);
    }
    setIsAdding(false);
    setIsEditing(false);
    setEditingRow(null);
  };
  const handleCancel = () => {
    setIsAdding(false);
    setIsEditing(false);
    setEditingRow(null);
  };
  return (
    <>
    {/* {console.log('en JSX ',isEditing, isAdding)} */}
      <h1 className="text-3xl font-bold text-center">Activity section</h1>
      <ActivityUploadSection 
      //setRows={setRows} rows={rows} 
      //setColumns={setColumns} setFormColumns={setFormColumns} 
      /> 
      {rows.length > 0 && //grilla de actividades
        <ActivityGridSection 
        //columns, handleEdit, handleAdd, selectedRow, setSelectedRow
        //rows={rows} setRows={setRows} 
        columns={columns} handleEdit={handleEdit} handleAdd={handleAdd} 
           selectedRow={selectedRow} setSelectedRow={setSelectedRow} 
        />
      }
        {(isEditing || isAdding) && ( /* 📌 Modal para Agregar o Editar Actividades */
        <CustomModal isOpen={isEditing || isAdding} onClose={handleCancel}  height='70vh'
           title={isAdding ?`Agregar actividad ${nextActivity}`:`Modificar actividad ${editingRow?.["NumActividad"]}`}
        > 
          <DynamicForm columns={formColumns} initialValues={editingRow || {"NumActividad": nextActivity, Actividad: "", Presupuesto: "", FechaInicio: "",
                     FechaTermino: "", }} onSave={handleSave} onCancel={handleCancel} setIsDirty={setIsDirty}/>
        </CustomModal>
        )}
        <ActivityNavigationSection />
    </>
  );
};

export default ActivitySection;
