import { useCallback } from "react";
import { FormikValues } from "formik";
import { getNextActivityId } from "../../utils/getNextActivityId";

export const useHandleAdd = (
  values: FormikValues,
  setNextActivity: (id: string) => void,
  setIsAdding: (state: boolean) => void,
  selectedRow: any
) => {
  //console.log('useHandleAdd',values.activities.length);
  if (!values || !values.activities || values.activities.length<=1) return;
  return useCallback(() => {
    if (!selectedRow) {
      alert(`Debe seleccionar la actividad previa a la que desea agregar.`);
      return;
    }

    const currentActivity = selectedRow["NumActividad"].toString();
    const existingIds = new Set<string>(values.activities?.map((row:any) => String(row["NumActividad"]))); // Obtener IDs existentes
    const newActivity = getNextActivityId(currentActivity, existingIds);

    setNextActivity(newActivity);
    setIsAdding(true);
  }, [values.activities, setNextActivity, setIsAdding, selectedRow]); // Dependencias del hook
};
