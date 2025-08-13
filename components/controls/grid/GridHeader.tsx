
"use client";
import { ColumnConfigType } from "@/types/interfaces";
import { faSort, faSortDown, faSortUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
type GridHeaderProps<T> = {// <T> indica genérico
    columns: ColumnConfigType<T>[]; // Configuración de columnas
    actions: ("edit" | "delete" | "zoom")[]; // Acciones disponibles (sin "add")
    borderColor: string; // Color del borde
    borderWidth: string; // Ancho del borde
    padding: string; // Padding interno
    borderVertical?: boolean;
    columnWidths: Record<string, string>; 
    fontSize: string;
    onSort?: (key: keyof T) => void;
    sortConfig?: {
      key: keyof T;
      direction: "asc" | "desc";
    } | null;
  };
  //const MAX_COLUMN_WIDTH = 200; // 📌 Define el ancho máximo por columna
  export const GridHeader = <T,>({ columns, actions, borderColor, borderWidth, padding, borderVertical = false, 
     columnWidths, fontSize, onSort, sortConfig, }: GridHeaderProps<T>) => {
      return (
        <div
          style={{
            display: "flex",
            width: "100%", // Asegura que el encabezado tenga el mismo ancho que las filas
            borderBottom: `${borderWidth} solid ${borderColor}`,
            fontSize,
            fontWeight: "bold",     
          }}
        >
          {columns
            .filter((col) => col.visible !== false)
            .map((col) => {
              const isSorted = sortConfig?.key === col.key;
              const sortIcon = col.sortable
              ? isSorted
                ? sortConfig?.direction === "asc"
                  ? <FontAwesomeIcon icon={faSortUp} style={{ color: "#0d6efd" }} />
                  : <FontAwesomeIcon icon={faSortDown} style={{ color: "#0d6efd" }} />
                : <FontAwesomeIcon icon={faSort} style={{ color: "#6c757d" }} />//ícono incial para mosrtar que la columna es ordenable
              : "";
  // console.log('col',col.key,columnWidths[String(col.key)],col.width, columnWidths[String(col.key)] || col.width || "150px")
              return(
              <div
                key={String(col.key)}
                onClick={() => col.sortable && onSort?.(col.key as keyof T)}
                style={{
                  width: columnWidths[String(col.key)] || col.width || "150px",
                  textAlign: col.textAlign || "left",
                  padding,
                  borderRight: borderVertical ? `${borderWidth} solid ${borderColor}` : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  whiteSpace: "nowrap", // Evita que el texto se divida en varias líneas
                  overflow: "hidden",
                  cursor: col.sortable ? "pointer" : "default",
                }}
                title={col.sortable ? "Haz clic para ordenar" : undefined}
              >
                <span
                  style={{
                    textDecoration: col.sortable ? "underline dotted" : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    color: "inherit",
                  }}
                >
                  {col.label}
                  {col.sortable && (
                    <span
                      style={{
                        color: isSorted ? "#0d6efd" : "#6c757d", // azul fuerte o gris claro
                        fontWeight: isSorted ? "bold" : "normal",
                        fontSize: "1rem",
                      }}
                    >
                      {sortIcon}
                    </span>
                  )}
                </span>
  
              </div>
              )
          })}
          {actions.length > 0 && (
            <div
              style={{
                width: "100px", // 🔹 Asegura que "Acciones" tenga un ancho fijo
                minWidth: "100px",
                maxWidth: "100px",
                textAlign: "left",
                padding,
                borderRight: borderVertical ? `${borderWidth} solid ${borderColor}` : "none",
                display: "flex",
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
            >
              Acciones
            </div>
          )}
        </div>
      );
    };
    
  //   return (
  //     <div
  //     style={{
  //       display: "flex",
  //       width: "100%", // Asegura que el encabezado tenga el mismo ancho que las filas
  //       borderBottom: `${borderWidth} solid ${borderColor}`,
  //       fontSize,
  //       fontWeight: "bold",
     
  //     }}

  //     >
  //       {columns
  //         .filter((col) => col.visible !== false)
  //         .map((col) => (
  //           <div
  //             key={String(col.key)}
  //             style={{
  //               width: columnWidths[String(col.key)] || col.width || "150px",
  //               textAlign: col.textAlign || "left",
  //               padding,
  //               borderRight: borderVertical ? `${borderWidth} solid ${borderColor}` : "none",
  //               display: "flex",
  //               alignItems: "center",
  //               justifyContent: "center",
  //               whiteSpace: "nowrap", // Evita que el texto se divida en varias líneas
  //               overflow: "hidden",
  //             }}
  //           >
  //             <span>{col.label}</span>
  //           </div>
  //         ))}
  //       {actions.length > 0 && (
  //         <div
  //           style={{
  //             width: "100px", // 🔹 Asegura que "Acciones" tenga un ancho fijo
  //             minWidth: "100px",
  //             maxWidth: "100px",
  //             textAlign: "left",
  //             padding,
  //             borderRight: borderVertical ? `${borderWidth} solid ${borderColor}` : "none",
  //             display: "flex",
  //             //alignItems: "center",
  //             //justifyContent: "center",
  //             whiteSpace: "nowrap",
  //             overflow: "hidden",
  //           }}
  //         >
  //           Acciones
  //         </div>
  //       )}
  //     </div>
  //   );
  // };
  