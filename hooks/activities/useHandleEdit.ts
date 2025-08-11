// import { useCallback } from "react";
// import { FormikValues } from "formik";

// export const useHandleEdit = (
//   values: FormikValues,
//   setIsEditing: (state: boolean) => void,
//   selectedRow: any
// ) => {
//     console.log('useHandleEdit', selectedRow);
//   return useCallback(() => {
//     if (!selectedRow) {
//       alert(`Debe seleccionar la actividad previa a la que desea agregar.`);
//       return;
//     }
//     setIsEditing(true);
//   }, [values.activities, setIsEditing, selectedRow]); // Dependencias del hook
// };