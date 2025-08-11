
import { useCallback } from "react";
import { FormikValues } from "formik";

export const useHandleDelete = (values: FormikValues, setFieldValue: (field: string, value: any) => void) => {
  return useCallback((row: any) => {
    const actividadId = row["NumActividad"]; // 📌 Obtener la actividad a eliminar como string
    const actividadIdStr = actividadId.toString(); // Asegurar que sea string

    // 📌 Verificar si hay actividades dependientes (hijas) correctamente
    const hasChildren = values.activities.some((item:any) => {
      const itemId = item["NumActividad"].toString(); // Asegurar que sea string
      return itemId !== actividadIdStr && itemId.startsWith(`${actividadIdStr}.`);
    });

    if (hasChildren) {
      alert(`No puedes eliminar la actividad "${actividadId} ${row.Actividad}" porque tiene actividades dependientes.`);
      return;
    }

    if (window.confirm(`¿Eliminar la actividad "${actividadId} ${row.Actividad}"?`)) {
      const newRows = values.activities.filter((item:any) => item["NumActividad"] !== actividadIdStr);
      setFieldValue("activities", newRows);
    }
  }, [values.activities, setFieldValue]); // Memoizar la función para evitar re-renderizados innecesarios
};
