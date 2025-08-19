"use client";
import { useEffect, useMemo, useState } from "react";
import { CustomButton, CustomButtonProps } from "./CustomButton";
import { faPlus, faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { GridRow } from "@/components/controls/grid/GridRow";
import { GridHeader } from "./grid/GridHeader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ExportConfig } from "./ExportConfig";
import { exportToExcel } from "@/utils/exportToExcel";
import { ColumnConfigType } from "@/types/interfaces";

export type CustomGridProps<T> = {
  title?: string;
  rowHeight?: string;
  rowsToShow?: number;
  fontSize?: string;
  borderColor?: string;
  borderWidth?: string;
  padding?: string;
  marginBottom?: string;
  marginLeft?: string;
  gridWidth?: string;
  columns: ColumnConfigType<T>[];
  data: T[];
  name?: string;
  actions?: ("add" | "edit" | "delete" | "zoom" | "zoom-file")[];
  actionsTooltips?: string[];
  actionsPositionTooltips?: ("top" | "bottom" | "left" | "right")[];
  onAdd?: () => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onZoom?: (row: T) => void;
  addButtonProps?: Omit<CustomButtonProps, "onClick" | "label">;
  labelButtomActions?: string[];
  exportable?: boolean;
  borderVertical?: boolean;
  selectable?: boolean;
  onRowSelect?: (row: T | null) => void;
  isEditable?: (column: ColumnConfigType<T>, row: T) => boolean;
  currentPage?: number;
  ocultarValoresRepetidos?: (data: T[]) => T[];
  /** ✔️ NUEVO: clave estable por fila */
  getRowId?: (row: T, index: number) => string | number;
  /** Alternativa: nombre de campo con el id */
  keyField?: keyof T;
};

export const CustomGrid = <T,>({
  title,
  rowHeight = "30px",
  rowsToShow = 5,
  fontSize = "14px",
  borderColor = "#ccc",
  borderWidth = "1px",
  padding = "10px",
  marginBottom = "20px",
  gridWidth = "90%",
  columns,
  data,
  actions = [],
  onAdd,
  onEdit,
  onDelete,
  onZoom,
  actionsTooltips = ["Agregar", "Modificar", "Eliminar", "Detalle"],
  actionsPositionTooltips = ["bottom", "bottom", "left", "left"],
  labelButtomActions = ["Add", "", "", "Detalle"],
  exportable = false,
  borderVertical = false,
  selectable = false,
  onRowSelect,
  isEditable,
  currentPage,
  ocultarValoresRepetidos,
  getRowId,
  keyField,
}: CustomGridProps<T>) => {
  // Anchos de columnas (estado propio válido)
  const [columnWidths, setColumnWidths] = useState<Record<string, string>>(
    Object.fromEntries(columns.map((col) => [String(col.key), col.width || "150px"]))
  );

  // Página interna sincronizable
  const [currentInternalPage, setCurrentInternalPage] = useState(currentPage ?? 0);
  useEffect(() => {
    if (currentPage !== undefined) setCurrentInternalPage(currentPage);
  }, [currentPage]);

  // Fila seleccionada por id (no por referencia)
  const [selectedRowId, setSelectedRowId] = useState<string | number | null>(null);

  // ✔️ Derivar datos SIN estado intermedio (evita loops/hydration mismatch)
  const processedData = useMemo(() => {
    return ocultarValoresRepetidos ? ocultarValoresRepetidos(data) : data;
  }, [data, ocultarValoresRepetidos]);

  const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: "asc" | "desc" } | null>(null);

  const sortedData = useMemo(() => {
    if (!sortConfig) return processedData;
    const { key, direction } = sortConfig;
    const sign = direction === "asc" ? 1 : -1;
    return [...processedData].sort((a, b) => {
      const va = (a as any)[key];
      const vb = (b as any)[key];
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * sign;
      const sa = String(va);
      const sb = String(vb);
      return sa.localeCompare(sb) * sign;
    });
  }, [processedData, sortConfig]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(sortedData.length / rowsToShow));
  const startIndex = Math.min(currentInternalPage, totalPages - 1) * rowsToShow;
  const endIndex = startIndex + rowsToShow;

  const paginatedData = useMemo(() => sortedData.slice(startIndex, endIndex), [sortedData, startIndex, endIndex]);

  const handleSort = (key: keyof T) => {
    const col = columns.find((c) => c.key === key);
    if (!col || !col.sortable) return;
    setSortConfig((prev) => (prev?.key === key ? { key, direction: prev.direction === "asc" ? "desc" : "asc" } : { key, direction: "asc" }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) setCurrentInternalPage(newPage);
  };

  const handleRowSelection = (row: T, idx: number) => {
    const id = getRowKey(row, idx);
    setSelectedRowId(id);
    onRowSelect?.(row);
  };

  const updateColumnWidth = (colKey: string, newWidth: string) => {
    setColumnWidths((prev) => {
      if (parseInt(prev[colKey] || "150", 10) < parseInt(newWidth, 10)) {
        return { ...prev, [colKey]: newWidth };
      }
      return prev;
    });
  };

  const columnsToRender = useMemo(
    () =>
      columns.filter((c) => {
        if (c.visible === false) return false;
        if (c.hideOnSort && sortConfig?.key) return false;
        return true;
      }),
    [columns, sortConfig]
  );

  // const filteredActions: ("edit" | "delete" | "zoom" | "zoom-file")[] = actions;
  const filteredActions: ("edit" | "delete" | "zoom")[] = actions.filter((action): action is "edit" | "delete" | "zoom" => action !== "add");

  const minWidth =
    columnsToRender.reduce((total, col) => total + parseInt(col.width || "100", 10), 0) +
    (actions.includes("edit") || actions.includes("delete") ? 100 : 0);

  // ✔️ Key estable por fila
  const getRowKey = (row: T, index: number): string | number => {
    if (getRowId) return getRowId(row, index);
    if (keyField && row && (row as any)[keyField] != null) return (row as any)[keyField] as any;
    // ⚠️ Último recurso: index (no recomendado)
    return index;
  };

  const getEditableState = (column: ColumnConfigType<T>, row: T) => (isEditable ? isEditable(column, row) : column.editable);

  const handleExport = (fileName: string) => {
    const renameKey = (array: any[], oldKey: string, newKey: string) =>
      array.map((obj) => {
        if (!(oldKey in obj)) return obj;
        const { [oldKey]: value, ...rest } = obj;
        return { [newKey]: value, ...rest };
      });

    const updatedColumns = columns.map((col) => ({
      ...col,
      key: col.key === "NumActividad" ? ("Nro Actividad" as any) : col.key,
      label: col.key === "NumActividad" ? "Nro Actividad" : col.label,
    }));

    const updatedData = renameKey(processedData as any[], "NumActividad", "Nro Actividad");
    exportToExcel(fileName, updatedData, updatedColumns);
  };

  return (
    <div style={{ marginBottom, width: gridWidth, overflowX: "auto", fontSize }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
          marginBottom: "0rem",
          marginLeft: "2rem",
        }}
      >
        {title && <h2 style={{ fontWeight: "bold", marginTop: 0, fontSize }}>{title}</h2>}
        {actions.includes("add") && (
          <CustomButton
            label={labelButtomActions[0]}
            onClick={onAdd}
            buttonStyle="primary"
            size="small"
            theme="light"
            style={{ height: "2.00rem", marginTop: "0.3rem" }}
            icon={<FontAwesomeIcon icon={faPlus} />}
            tooltipContent={actionsTooltips[0] || "Agregar"}
            tooltipPosition={actionsPositionTooltips[0] || "bottom"}
          />
        )}
        {exportable && <ExportConfig onExport={handleExport} />}
      </div>

      {/* Grid */}
      <div style={{ border: `${borderWidth} solid ${borderColor}`, display: "inline-block", minWidth }}>
        <GridHeader
          // actions={filteredActions.filter((a) => a !== "add") as any}
          actions={filteredActions}
          borderColor={borderColor}
          borderWidth={borderWidth}
          padding={padding}
          columns={columnsToRender}
          borderVertical={borderVertical}
          columnWidths={columnWidths}
          fontSize={fontSize}
          onSort={handleSort}
          sortConfig={sortConfig}
        />

        <div>
          {paginatedData.map((row, rowIndex) => {
            const key = getRowKey(row, startIndex + rowIndex); // key estable global por página
            const isSelected = selectedRowId === key;
            return (
              <GridRow
                key={key}
                row={row}
                // actions={filteredActions.filter((a) => a !== "add") as any}
                actions={filteredActions}
                onEdit={onEdit}
                onDelete={onDelete}
                onZoom={onZoom}
                rowHeight={rowHeight}
                fontSize={fontSize}
                padding={padding}
                borderColor={borderColor}
                borderWidth={borderWidth}
                borderVertical={borderVertical}
                actionsTooltips={actionsTooltips}
                actionsPositionTooltips={actionsPositionTooltips}
                columnWidths={columnWidths}
                updateColumnWidth={updateColumnWidth}
                selectable={selectable}
                onSelect={() => handleRowSelection(row, startIndex + rowIndex)}
                isSelected={isSelected}
                columns={columnsToRender.map((col) => ({ ...col, editable: getEditableState(col, row) }))}
              />
            );
          })}
        </div>
      </div>

      {/* Paginación */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "10px", gap: "10px" }}>
        <span>
          Página {Math.min(currentInternalPage + 1, totalPages)} de {totalPages}, son {sortedData.length} filas
        </span>

        <CustomButton
          size="small"
          buttonStyle="primary"
          theme="light"
          label="Pág. Anterior"
          onClick={() => handlePageChange(currentInternalPage - 1)}
          disabled={currentInternalPage <= 0}
          icon={<FontAwesomeIcon icon={faArrowLeft} size="lg" color="white" />}
          iconPosition="left"
        />

        <CustomButton
          size="small"
          buttonStyle="primary"
          theme="light"
          label="Pág. Siguiente"
          onClick={() => handlePageChange(currentInternalPage + 1)}
          disabled={currentInternalPage >= totalPages - 1}
          icon={<FontAwesomeIcon icon={faArrowRight} size="lg" color="white" />}
          iconPosition="right"
        />
      </div>
    </div>
  );
};



// "use client";
// import { useEffect, useMemo, useState } from "react";
// import { CustomButton, CustomButtonProps } from "./CustomButton";
// import { faPlus, faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
// import { GridRow } from "@/components/controls/grid/GridRow";
// import { GridHeader } from "./grid/GridHeader";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// import { ExportConfig } from "./ExportConfig";
// import { exportToExcel } from "@/utils/exportToExcel";
// import { ColumnConfigType } from "@/types/interfaces";

// export type CustomGridProps<T> = {
//   title?: string; // Título de la grilla
//   rowHeight?: string; // Alto de las filas (por ejemplo, "50px")
//   rowsToShow?: number; // Número de filas a mostrar
//   fontSize?: string;
//   borderColor?: string; // Color del borde
//   borderWidth?: string; // Ancho del borde
//   padding?: string; // Padding dentro de cada celda
//   marginBottom?: string; // Espaciado inferior de la grilla
//   marginLeft?: string; // Espaciado izquierdo de la grilla
//   gridWidth?: string; // Ancho total de la grilla
//   columns: ColumnConfigType<T>[]; // Configuración de las columnas
//   data: T[]; // Datos a mostrar en la grilla originales sim ocultarValoresRepetidos
//   name?: string; // Campo del formulario donde se almacenará la data
//   actions?: ("add" | "edit" | "delete" | "zoom" |"zoom-file")[]; // Acciones disponibles
//   actionsTooltips?: string[]; // tooltips de las Acciones 
//   actionsPositionTooltips?:  ("top" | "bottom" | "left" | "right")[]; // posición de los tooltips de las Acciones
//   onAdd?: () => void;
//   onEdit?: (row: T) => void;
//   onDelete?: (row: T) => void;
//   onZoom?: (row: T) => void;
//   addButtonProps?: Omit<CustomButtonProps, "onClick" | "label">; // Props para CustomButton
//   labelButtomActions?: string[];
//   exportable?: boolean; // Indica si la grilla es exportable  
//   exportFileName?: string; // Nombre predeterminado del archivo exportado
//   borderVertical?: boolean;
//   selectable?: boolean;
//   onRowSelect?: (row: T | null) => void; // 📌 Callback para manejar las filas seleccionadas
//   isEditable?: (column: ColumnConfigType<T>, row: T) => boolean;
//   currentPage?: number; // permitir seteo externo de página
//   ocultarValoresRepetidos?: (data: T[]) => T[];
// };

// export const CustomGrid = <T,>({
//   title,
//   rowHeight = "30px",
//   rowsToShow = 5,
//   fontSize = "14px",
//   borderColor = "#ccc",
//   borderWidth = "1px",
//   padding = "10px",
//   marginBottom = "20px",
//   gridWidth = "90%",
//   columns,
//   data,
//   actions = [],
//   onAdd,
//   onEdit,
//   onDelete,
//   onZoom,
//   actionsTooltips = ["Agregar", "Modificar", "Eliminar", "Detalle"],
//   actionsPositionTooltips = ["bottom", "bottom", "left","left"],
//   labelButtomActions = ["Add", "", "","Detalle"],
//   exportable = false,
//   borderVertical=false,
//   selectable = false,
//   onRowSelect,
//   isEditable,
//   currentPage ,
//   ocultarValoresRepetidos,
// }: CustomGridProps<T>) => {
//   //  console.log('en CustomGrid actions',data);
//     const [columnWidths, setColumnWidths]                 = useState<Record<string, string>>(
//       Object.fromEntries(columns.map(col => [String(col.key), col.width || "150px"]))
//     );
//     const [ currentInternalPage, setCurrentInternalPage ] = useState(currentPage ?? 0);
//     const [ selectedGridRow, setSelectedGridRow ]         = useState<T | null>(null);
//     const [ sortConfig, setSortConfig ]                   = useState<{ key: keyof T; direction: 'asc' | 'desc' } | null>(null);
//     const [ rows, setRows ]                               = useState<T[]>(data);//para manejar datos con la función ocultarValoresRepetidos       
//     const sortedData = useMemo(() => {
//       // console.log('sortedData original', rows)
//       if (!sortConfig) return rows;
//       const sortData=[...rows].sort((a, b) => {
//         const valA = a[sortConfig.key];
//         const valB = b[sortConfig.key];
  
//         if (valA == null) return 1;
//         if (valB == null) return -1;
  
//         if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
//         if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
//         return 0;
//       });
//       let newData=sortData;
//       // console.log('sortData',sortData);
//       if (ocultarValoresRepetidos){
//         const newData=ocultarValoresRepetidos(sortData);
//       }
//       return newData
  
//     }, [rows, sortConfig, ocultarValoresRepetidos]);
//     useEffect(()=>{
//       // console.log('en useEffect de CustomGrid',rows)
//       if (rows && rows.length>0 && ocultarValoresRepetidos ){
//         const rowSorted=sortedData.slice(startIndex, endIndex);
//         //console.log('en useEffect de CustomGrid inside rowSorted',rowSorted)
//         const processedData = ocultarValoresRepetidos
//         ? ocultarValoresRepetidos(data)
//         : data;
//         setRows(processedData);
//         }
//     },[data, ocultarValoresRepetidos, sortedData])
//     const columnsToRender = useMemo(
//       () =>
//         columns.filter(c => {
//           if (c.visible === false) return false;
//           // Oculta si la columna pide ocultarse y hay orden activo
//           if (c.hideOnSort && sortConfig?.key) return false;
//           return true;
//         }),
//       [columns, sortConfig]
//     );
  
//     const handleSort = (key: keyof T) => {
//       const col=columns.find(col =>col.key === key);
//       if (!col || !col.sortable) return;
//       // console.log('key en handleSort',key, columns) 
//       setSortConfig((prev) => {
//         if (prev?.key === key) {
//           return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
//         }
//         return { key, direction: "asc" };
//       });
//     };
//     useEffect(() => { // Si `currentPage` viene desde props, sincronizar estado interno:
//       if (currentPage !== undefined) {
//         setCurrentInternalPage(currentPage);
//       }
//     }, [currentPage]);
//     const startIndex = currentInternalPage * rowsToShow;    // Calcular índices de paginación
//     const endIndex = startIndex + rowsToShow;
//     const totalPages = (rows) ? Math.ceil(rows.length / rowsToShow):0;
//     // const paginatedData =(data) ? data.slice(startIndex, endIndex):0;
//     const paginatedData = sortedData.slice(startIndex, endIndex);
//     const handlePageChange = (newPage: number) => {
//       //console.log('en handlePageChange newPage,totalPages',newPage,totalPages, currentPage);
//       if (newPage >= 0 && newPage <= totalPages) {
//         setCurrentInternalPage(newPage);
//       }
//     };
//     const handleRowSelection = (row: T) => {
//       setSelectedGridRow(row);
//       if (onRowSelect) {
//         onRowSelect(row); // 📌 Notificar al componente padre
//       }
//     };  
//     const updateColumnWidth = (colKey: string, newWidth: string) => {// Función para actualizar el ancho de una columna globalmente
//       setColumnWidths(prevWidths => {
//         if (parseInt(prevWidths[colKey] || "150", 10) < parseInt(newWidth, 10)) {
//           return { ...prevWidths, [colKey]: newWidth };
//         }
//         return prevWidths;
//       });
//     };
//     const handleExport  = (fileName: string) => {
//       const renameKey = (array: any[], oldKey: string, newKey: string) => { //para renombrar NumActividad por N° Actividad
//         return array.map(obj => {
//           if (!(oldKey in obj)) return obj; // Si la clave no existe, no modifica el objeto
//           const { [oldKey]: value, ...rest } = obj;
//           return { [newKey]: value, ...rest };
//         });
//       };
//       const updatedColumns = columns.map(col => ({
//         ...col, // Mantener los demás atributos sin cambios
//         key: col.key === "NumActividad" ? "Nro Actividad" : col.key, 
//         label: col.key === "NumActividad" ? "Nro Actividad" : col.label // Cambiar valores específicos
//       }));
//     const updatedData = renameKey(rows, "NumActividad", "Nro Actividad");
//     exportToExcel(fileName, updatedData, updatedColumns);
//     };
//     const filteredActions: ("edit" | "delete" | "zoom")[] = actions.filter((action): action is "edit" | "delete" | "zoom" => action !== "add");
//     const minWidth = columnsToRender
//     .reduce((total, col) => total + parseInt(col.width || "100", 10), 0)
//     + (actions.includes("edit") || actions.includes("delete") ? 100 : 0);
  
//     const getEditableState = (column: ColumnConfigType<T>, row: T) => {
//       if (isEditable) {
//         return isEditable(column, row); // Usa la función si está definida
//       }
//       return column.editable; // Usa la configuración predeterminada si no hay función
//     };
//   return (
//     <>
//      {/* { console.log('JSX selectedRow',columnWidths)} */}
//       <div
//         style={{ marginBottom, width: gridWidth,  overflowX: "auto", fontSize,  }}
//       >
//         <div   /* Encabezado con título y botón Add */
//           style={{  display: "flex",  gap: "10px", // Espaciado entre el título y el botón
//             alignItems: "center", // Alineación vertical centrada
//             marginBottom: "0rem",
//             marginLeft:"2rem",
//           }}
//         >
//           {title && <h2 style={{ fontWeight: "bold", marginTop: '0', fontSize,}}>{title}</h2>}
//           {actions.includes("add") && (
//             <CustomButton label={labelButtomActions[0]} onClick={ onAdd } buttonStyle="primary" size="small" theme="light"
//               style={{ height: '2.00rem', marginTop:'0.3rem' }} icon={<FontAwesomeIcon icon={faPlus} />} tooltipContent={actionsTooltips[0] || 'Agregar'}
//               tooltipPosition={actionsPositionTooltips[0] || 'bottom'}
//             />
//           )}        
//           {exportable && <ExportConfig onExport={handleExport } />}
//         </div>    
//         <div style={{ border: `${borderWidth} solid ${borderColor}`, display: "inline-block", }}> 
//           <GridHeader  actions={filteredActions} borderColor={borderColor} borderWidth={borderWidth} padding={padding} columns={columnsToRender} 
//             borderVertical={borderVertical} columnWidths={columnWidths} fontSize={ fontSize} onSort={handleSort} sortConfig={sortConfig} //columns={columns} 
//           />
//           <div>
//             <div>
//               { (paginatedData) ? paginatedData.map((row, rowIndex) => {/* Filas */
//               return(
//                 <GridRow key={rowIndex} row={row} actions={filteredActions} onEdit={onEdit} onDelete={onDelete} onZoom={onZoom} 
//                   rowHeight={rowHeight} fontSize={ fontSize}
//                   padding={padding} borderColor={borderColor} borderWidth={borderWidth} borderVertical={borderVertical}  actionsTooltips={actionsTooltips}
//                   actionsPositionTooltips={actionsPositionTooltips} columnWidths={columnWidths} // 📌 Pasamos el estado global de anchos
//                   updateColumnWidth={updateColumnWidth} selectable={selectable} onSelect={() => handleRowSelection(row)} isSelected={selectedGridRow === row}
//                  // columns={columns.map((col) => ({...col, editable: getEditableState(col, row),}))} // 📌 Determina la edición dinámicamente       
//                  columns={columnsToRender.map((col) => ({...col, editable: getEditableState(col, row),}))} // 📌 Determina la edición dinámicamente       
//                   />
//               )
//               }): <></>}
//             </div>
//           </div>
//         </div>
//         { rows && (
//           <div style={{ display: "flex", justifyContent: "center", marginTop: "10px", gap: "10px" }}>  {/* Controles de paginación */}
//             <span> Página {currentInternalPage+1 } de {totalPages}, son {data.length} filas   </span>
//               {currentInternalPage > 0 && (
//                   <CustomButton size='small'  buttonStyle="primary" theme="light" label="Pág. Anterior"
//                     onClick={() => handlePageChange(currentInternalPage - 1)}
//                     disabled={currentInternalPage >  totalPages - 1} 
//                     icon={<FontAwesomeIcon icon={faArrowLeft} size="lg" color="white" />} iconPosition='left'
//                 />
//               )}
//                 {currentInternalPage < totalPages && (
//                 <CustomButton size='small'  buttonStyle="primary" theme="light" label="Pág. Siguiente"
//                   onClick={() => handlePageChange(currentInternalPage + 1)}
//                   disabled={currentInternalPage >= totalPages - 1} 
//                   icon={<FontAwesomeIcon icon={faArrowRight} size="lg" color="white" />} iconPosition='right'
//                 />
//               )}
//           </div>
//         )
//         }
//       </div>
//     </>
//    );
//   };


// "use client";
// import { useEffect, useState } from "react";
// import { CustomButton, CustomButtonProps } from "./CustomButton";
// import { faPlus, faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
// import { GridRow } from "@/components/controls/grid/GridRow";
// import { GridHeader } from "./grid/GridHeader";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// import { ExportConfig } from "./ExportConfig";
// import { exportToExcel } from "@/utils/exportToExcel";
// import { ColumnConfigType } from "@/types/interfaces";

// export type CustomGridProps<T> = {
//   title?: string; // Título de la grilla
//   rowHeight?: string; // Alto de las filas (por ejemplo, "50px")
//   rowsToShow?: number; // Número de filas a mostrar
//   fontSize?: string;
//   borderColor?: string; // Color del borde
//   borderWidth?: string; // Ancho del borde
//   padding?: string; // Padding dentro de cada celda
//   marginBottom?: string; // Espaciado inferior de la grilla
//   marginLeft?: string; // Espaciado izquierdo de la grilla
//   gridWidth?: string; // Ancho total de la grilla
//   columns: ColumnConfigType<T>[]; // Configuración de las columnas
//   data: T[]; // Datos a mostrar en la grilla
//   name?: string; // Campo del formulario donde se almacenará la data
//   actions?: ("add" | "edit" | "delete" | "zoom" |"zoom-file")[]; // Acciones disponibles
//   actionsTooltips?: string[]; // tooltips de las Acciones 
//   actionsPositionTooltips?:  ("top" | "bottom" | "left" | "right")[]; // posición de los tooltips de las Acciones
//   onAdd?: () => void;
//   onEdit?: (row: T) => void;
//   onDelete?: (row: T) => void;
//   onZoom?: (row: T) => void;
//   addButtonProps?: Omit<CustomButtonProps, "onClick" | "label">; // Props para CustomButton
//   labelButtomActions?: string[];
//   exportable?: boolean; // Indica si la grilla es exportable  
//   exportFileName?: string; // Nombre predeterminado del archivo exportado
//   borderVertical?: boolean;
//   selectable?: boolean;
//   onRowSelect?: (row: T | null) => void; // 📌 Callback para manejar las filas seleccionadas
//   isEditable?: (column: ColumnConfigType<T>, row: T) => boolean;
//   currentPage?: number; // permitir seteo externo de página
// };

// export const CustomGrid = <T,>({
//   title,
//   rowHeight = "30px",
//   rowsToShow = 5,
//   fontSize = "14px",
//   borderColor = "#ccc",
//   borderWidth = "1px",
//   padding = "10px",
//   marginBottom = "20px",
//   gridWidth = "90%",
//   columns,
//   data,
//   actions = [],
//   onAdd,
//   onEdit,
//   onDelete,
//   onZoom,
//   actionsTooltips = ["Agregar", "Modificar", "Eliminar", "Detalle"],
//   actionsPositionTooltips = ["bottom", "bottom", "left","left"],
//   labelButtomActions = ["Add", "", "","Detalle"],
//   exportable = false,
//   borderVertical=false,
//   selectable = false,
//   onRowSelect,
//   isEditable,
//   currentPage ,
// }: CustomGridProps<T>) => {
//   //  console.log('en CustomGrid actions',data);
//   const [columnWidths, setColumnWidths]                 = useState<Record<string, string>>(
//     Object.fromEntries(columns.map(col => [String(col.key), col.width || "150px"]))
//   );
//   const [ currentInternalPage, setCurrentInternalPage ] = useState(currentPage ?? 0);
//   const [ selectedGridRow, setSelectedGridRow ]         = useState<T | null>(null);

  
//   useEffect(() => { // Si `currentPage` viene desde props, sincronizar estado interno:
//     if (currentPage !== undefined) {
//       // console.log('en CustomGrid useEffect currentPage,currentInternalPage',currentPage,currentInternalPage);
//       setCurrentInternalPage(currentPage);
//     }
//   }, [currentPage]);

 
//     // Calcular índices de paginación
//   const startIndex = currentInternalPage * rowsToShow;
//   const endIndex = startIndex + rowsToShow;
//   //console.log('en CustomGrid data',data);
//   const totalPages = (data) ? Math.ceil(data.length / rowsToShow):0;
//   //console.log('totalPages',totalPages,startIndex,endIndex);
//   const paginatedData =(data) ? data.slice(startIndex, endIndex):0;
//   // const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 0));
//   // const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
//   const handlePageChange = (newPage: number) => {
//     //console.log('en handlePageChange newPage,totalPages',newPage,totalPages, currentPage);
//     if (newPage >= 0 && newPage <= totalPages) {
//       setCurrentInternalPage(newPage);
//     }
//   };
//   const handleRowSelection = (row: T) => {
//     // console.log('en CustomGrid handleRowSelection',title,row,selectable);
//     setSelectedGridRow(row);
//     if (onRowSelect) {
//       onRowSelect(row); // 📌 Notificar al componente padre
//     }
//   };
//   // Función para actualizar el ancho de una columna globalmente
//   const updateColumnWidth = (colKey: string, newWidth: string) => {
//     setColumnWidths(prevWidths => {
//       if (parseInt(prevWidths[colKey] || "150", 10) < parseInt(newWidth, 10)) {
//         return { ...prevWidths, [colKey]: newWidth };
//       }
//       return prevWidths;
//     });
//   };
//   const handleExport  = (fileName: string) => {
//     const renameKey = (array: any[], oldKey: string, newKey: string) => { //para renombrar NumActividad por N° Actividad
//       return array.map(obj => {
//         if (!(oldKey in obj)) return obj; // Si la clave no existe, no modifica el objeto
//         const { [oldKey]: value, ...rest } = obj;
//         return { [newKey]: value, ...rest };
//       });
//     };
//     const updatedColumns = columns.map(col => ({
//       ...col, // Mantener los demás atributos sin cambios
//       key: col.key === "NumActividad" ? "Nro Actividad" : col.key, 
//       label: col.key === "NumActividad" ? "Nro Actividad" : col.label // Cambiar valores específicos
//     }));
//   const updatedData = renameKey(data, "NumActividad", "Nro Actividad");
//   exportToExcel(fileName, updatedData, updatedColumns);
//   };
//   const filteredActions: ("edit" | "delete" | "zoom")[] = actions.filter((action): action is "edit" | "delete" | "zoom" => action !== "add");
//   const minWidth = columns
//   .filter((col) => col.visible !== false)
//   .reduce((total, col) => total + parseInt(col.width || "100"), 0) + (actions.includes("edit") || actions.includes("delete") ? 100 : 0);

//   const getEditableState = (column: ColumnConfigType<T>, row: T) => {
//     if (isEditable) {
//       return isEditable(column, row); // Usa la función si está definida
//     }
//     return column.editable; // Usa la configuración predeterminada si no hay función
//   };
//   return (
//   <>
//    {/* { console.log('JSX selectedRow',selectedRow)} */}
//     <div
//       style={{ marginBottom, width: gridWidth,  overflowX: "auto", fontSize,  }}
//     >
//       <div   /* Encabezado con título y botón Add */
//         style={{  display: "flex",  gap: "10px", // Espaciado entre el título y el botón
//           alignItems: "center", // Alineación vertical centrada
//           marginBottom: "0rem",
//           marginLeft:"2rem",
//         }}
//       >
//         {title && <h2 style={{ fontWeight: "bold", marginTop: '0', fontSize,}}>{title}</h2>}
//         {actions.includes("add") && (
//           <CustomButton label={labelButtomActions[0]} onClick={ onAdd } buttonStyle="primary" size="small" theme="light"
//             style={{ height: '2.00rem', marginTop:'0.3rem' }} icon={<FontAwesomeIcon icon={faPlus} />} tooltipContent={actionsTooltips[0] || 'Agregar'}
//             tooltipPosition={actionsPositionTooltips[0] || 'bottom'}
//           />
//         )}        
//         {exportable && <ExportConfig onExport={handleExport } />}
//       </div>    
//       <div style={{ border: `${borderWidth} solid ${borderColor}`, display: "inline-block", }}> 
//         <GridHeader columns={columns} actions={filteredActions} borderColor={borderColor} borderWidth={borderWidth} padding={padding}
//           borderVertical={borderVertical} columnWidths={columnWidths} fontSize={ fontSize}
//         />
//         <div>
//           <div>
//             { (paginatedData) ? paginatedData.map((row, rowIndex) => {/* Filas */
//             // if (rowIndex < 3) console.log('row',row,rowIndex)
//             return(
//               <GridRow key={rowIndex} row={row} actions={filteredActions} onEdit={onEdit} onDelete={onDelete} onZoom={onZoom} 
//                 rowHeight={rowHeight} fontSize={ fontSize}
//                 padding={padding} borderColor={borderColor} borderWidth={borderWidth} borderVertical={borderVertical}  actionsTooltips={actionsTooltips}
//                 actionsPositionTooltips={actionsPositionTooltips} columnWidths={columnWidths} // 📌 Pasamos el estado global de anchos
//                 updateColumnWidth={updateColumnWidth} selectable={selectable} onSelect={() => handleRowSelection(row)} isSelected={selectedGridRow === row}
//                 columns={columns.map((col) => ({...col, editable: getEditableState(col, row),}))} // 📌 Determina la edición dinámicamente       
//                 />
//             )
//             }): <></>}
//           </div>
//         </div>
//       </div>
//       { data && (
//         <div style={{ display: "flex", justifyContent: "center", marginTop: "10px", gap: "10px" }}>  {/* Controles de paginación */}
//           <span> Página {currentInternalPage+1 } de {totalPages}, son {data.length} filas   </span>
//             {currentInternalPage > 0 && (
//                 <CustomButton size='small'  buttonStyle="primary" theme="light" label="Pág. Anterior"
//                   onClick={() => handlePageChange(currentInternalPage - 1)}
//                   disabled={currentInternalPage >  totalPages - 1} 
//                   icon={<FontAwesomeIcon icon={faArrowLeft} size="lg" color="white" />} iconPosition='left'
//               />
//             )}
//               {currentInternalPage < totalPages && (
//               <CustomButton size='small'  buttonStyle="primary" theme="light" label="Pág. Siguiente"
//                 onClick={() => handlePageChange(currentInternalPage + 1)}
//                 disabled={currentInternalPage >= totalPages - 1} 
//                 icon={<FontAwesomeIcon icon={faArrowRight} size="lg" color="white" />} iconPosition='right'
//               />
//             )}
//         </div>
//       )
//       }
//     </div>
//   </>
//  );
// };