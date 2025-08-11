
"use client";
import { ColumnConfigType } from "@/types/interfaces";
type GridHeaderProps<T> = {// <T> indica genérico
    columns: ColumnConfigType<T>[]; // Configuración de columnas
    actions: ("edit" | "delete" | "zoom")[]; // Acciones disponibles (sin "add")
    borderColor: string; // Color del borde
    borderWidth: string; // Ancho del borde
    padding: string; // Padding interno
    borderVertical?: boolean;
    columnWidths: Record<string, string>; 
    fontSize: string;
  };
  //const MAX_COLUMN_WIDTH = 200; // 📌 Define el ancho máximo por columna
  export const GridHeader = <T,>({ columns, actions, borderColor, borderWidth, padding, borderVertical = false,  columnWidths, fontSize }: GridHeaderProps<T>) => {
    return (
      <div
      style={{
        display: "flex",
        width: "100%", // Asegura que el encabezado tenga el mismo ancho que las filas
        borderBottom: `${borderWidth} solid ${borderColor}`,
        fontSize,
        fontWeight: "bold",
     
      }}
        //  style={{
        //   display: "grid",
        //   gridTemplateColumns: [
        //     ...columns.filter((col) => col.visible !== false).map((col) => columnWidths[String(col.key)] || col.width || "1fr"),
        //     ...(actions.length > 0 ? ["100px"] : []),
        //   ].join(" "),
        //   columnGap: "0px", 
        //   borderBottom: `${borderWidth} solid ${borderColor}`,
        //   fontSize,
        //   fontWeight: "bold",
        //   boxSizing: "border-box",
        // }}
      >
        {columns
          .filter((col) => col.visible !== false)
          .map((col) => (
            <div
              key={String(col.key)}
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
              }}
              // style={{
              //   flex: `0 0 ${columnWidths[String(col.key)] || "150px"}`, // 🔹 Ajustar ancho dinámico
              //   textAlign: col.textAlign || "left",
              //   padding,
              //   borderRight: borderVertical ? `${borderWidth} solid ${borderColor}` : "none",
              //   display: "flex",
              //   alignItems: "center",
              //   justifyContent: "center",
              //   whiteSpace: "pre-wrap",
              //   overflow: "hidden",
              // }}
            >
              <span>{col.label}</span>
            </div>
          ))}
        {actions.length > 0 && (
          <div
            // style={{
            //   textAlign: "left", // Alineación del título de la columna "Acciones"
            //   borderRight: borderVertical
            //   ? `${borderWidth} solid ${borderColor}`
            //   : "none",
            //   padding,
            //   boxSizing: "border-box",
            // }}
            style={{
              width: "100px", // 🔹 Asegura que "Acciones" tenga un ancho fijo
              minWidth: "100px",
              maxWidth: "100px",
              textAlign: "left",
              padding,
              borderRight: borderVertical ? `${borderWidth} solid ${borderColor}` : "none",
              display: "flex",
              //alignItems: "center",
              //justifyContent: "center",
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
  