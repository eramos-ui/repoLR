import { FormikValues } from "formik";
import { useCallback } from "react";
import { sortGridByActivityId } from "../../utils/sortGridByActivityId"; // Asegúrate de que la ruta es correcta

export const useHandleSave = (
  values: FormikValues,
  setFieldValue: (field: string, value: any) => void,
  isAdding: boolean,
  setIsAdding: (state: boolean) => void,
  isEditing: boolean,
  setIsEditing: (state: boolean) => void,
  editingRow: any,
  setEditingRow: (row: any) => void
) => {
  //console.log('en useHandleSave isAdding',isAdding,(!isAdding &&  !isEditing));
  if (!isAdding &&  !isEditing) return;
  return useCallback(
    (updatedRow: any) => {
      if (isAdding) {
        const newRows = values.activities
          ? sortGridByActivityId([...values.activities, updatedRow])
          : [updatedRow];

        setFieldValue("activities", newRows);
      } else if (isEditing) {
        const updatedRows = values.activities?.map((row:any) =>
          row["NumActividad"] === editingRow?.["NumActividad"] ? updatedRow : row
      );

        setFieldValue("activities", updatedRows);
      }

      setIsAdding(false);
      setIsEditing(false);
      setEditingRow(null);
    },
    [values.activities, setFieldValue, isAdding, isEditing, editingRow, setIsAdding, setIsEditing, setEditingRow]
  );
};
