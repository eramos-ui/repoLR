import { ColumnConfigType, ExcelColumn, GridRowType } from "@/types/interfaces";
/*
export type ColumnConfig<T> = { 
    label: string;
    key: keyof T;
    visible?: boolean;
    type?: "string" | "number";
    textAlign?: "left" | "center" | "right";
    width?: string;
    styles?: React.CSSProperties;
    captionPosition: "left" | "top";
    inputType?: string;
    options?: { value: string; label: string }[];
    validationSchema?: any;
    editable?: boolean;
    row?: number;
    required?:boolean;
    widthFormEdit?:string;//el ancho en el modal
    rowFormEdit?:number;//la fila del modal
    labelFormEdit?:string; //label en el modal
    dependsOn?: { field: string, value: string },
    dependencies?:{ field: string; valueMap: Record<string, any> }[];
  };



*/
  // 📌 Columnas obligatorias
const mandatoryColumns = ["NumActividad", "Actividad", "Presupuesto","FechaInicio","FechaTermino"] as const;
// 📌 Función para calcular el ancho de la columna
const calculateColumnWidth = (columnKey: string, data: any[]): string => {
    if (!data.length) return "150px"; // Ancho por defecto si no hay datos
  
    // 📌 Obtener la longitud más grande de los valores en la columna
    let maxLength = columnKey.length; // Iniciar con la longitud del nombre de la columna
  
    data.forEach(row => {
      const value = row[columnKey];
      if (value !== undefined && value !== null) {
        const valueLength = value.toString().length;
        maxLength = Math.max(maxLength, valueLength);
      }
    });
  
    // 📌 Ajustar el ancho basado en la longitud
    const baseWidth = 10; // Ancho base por carácter en píxeles
    const calculatedWidth = Math.min(Math.max(baseWidth * maxLength, 100), 300); // Rango de 80px a 300px
  
    return `${calculatedWidth}px`;
  };

 export const generateColumnConfig = <T extends GridRowType>(
    rows: T[], 
    excelColumns: ExcelColumn[] // 📌 Agregamos el orden de las columnas del Excel
  ): ColumnConfigType<T>[] => {
  //console.log('en generateColumnConfig rows',rows);
  if (!rows || rows.length === 0) return [];

  // 📌 Extraer TODAS las columnas presentes en el dataset
  const allKeys = new Set();
  rows.forEach(row => Object.keys(row).forEach(key => allKeys.add(key)));

  // 📌 Agregar manualmente las columnas obligatorias si no están
  mandatoryColumns.forEach((mandatoryKey) => allKeys.add(mandatoryKey));
  //console.log('excelColumns en generateColumnConfig',excelColumns);


return (excelColumns.map((col) => {
  const columnName = col.name; // Obtener el nombre real de la columna
  const isNumber = !columnName.includes("NumActividad") &&
                   rows.every((row) => !isNaN(Number(row[columnName])) && row[columnName] !== "");  //console.log('col',col);                 
  return {
    label: columnName,
    key: columnName, // Usar el nombre de la columna como clave
    visible: true,
    captionPosition: "top",
    type: col.type || isNumber ? "number" : "string",
    inputType: col.inputType || (isNumber ? "number" : "text"), // Definir inputType dinámicamente
    textAlign: col.type === 'number'  ? "right" : "left",
    width: calculateColumnWidth(columnName, rows),
    editable: true,
    row:1,
  };
}))
}
