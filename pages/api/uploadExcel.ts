import { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import { runMiddleware } from "@/utils/middleware";
import * as XLSX from "xlsx";
// import fs from "fs";


import { ExcelColumn } from "@/types/interfaces";
import { calculateDuration } from "@/utils/calculateDuration";
import { camelizeKeys } from "@/utils/camelizeKeys";

// Configuración de Multer para manejar archivos
// const upload = multer({ dest: "uploads/" });
// ✅ Multer usando almacenamiento en memoria (no escribe en disco)
const upload = multer({ storage: multer.memoryStorage() });//Vercel es serverless
// Función para convertir nombres de columnas a PascalCase y eliminar comillas correctamente
const toPascalCase = (str: string): string => {
  return str
    .trim() // Elimina espacios al inicio y final
    .replace(/['"]/g, "") // Elimina todas las comillas simples y dobles
    .replace(/\s+/g, " ") // Reemplaza múltiples espacios con uno solo
    .split(" ") // Divide por espacios en blanco
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Convierte cada palabra con primera letra en mayúscula
    .join(""); // Une las palabras sin espacios
};
// 📌 Función para obtener los encabezados del Excel con metadatos
const getColumnHeaders = (worksheet: XLSX.WorkSheet): ExcelColumn[] => {
  
  const columnHeaders: ExcelColumn[] = [];
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "");
  
  if (range.s && range.e) {
    for (let colIndex = range.s.c; colIndex <= range.e.c; colIndex++) {
      const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: colIndex });
      const cell = worksheet[cellAddress];
      
      if (cell && cell.v) {
        const columnName = toPascalCase(String(cell.v));//los títulos del excel deben ser PascalCase       
        // 📌 Definir tipo y formato según el nombre de la columna
        let columnMetadata: {name:string, inputType:string, type:string} = { name: columnName, inputType: "text", type: "string" };
        
        if (columnName.startsWith("Fecha")) {
          columnMetadata = { name: columnName, inputType: "date", type: "string" };
        } else if (columnName === "Presupuesto") {
          columnMetadata = { name: columnName, inputType: "number", type: "number" };
        }        
        columnHeaders.push(columnMetadata);
      }
    }
    //console.log("📌 Columnas en el orden original API uploadExcel/getColumnHeaders:", columnHeaders);
  }

  // 📌 Buscar la posición de "FechaTermino" para insertar "Duracion" después
 
    const fechaTerminoIndex = columnHeaders.findIndex(col => col.name === "FechaTermino");
    // console.log('fechaTerminoIndex',fechaTerminoIndex);
    if (fechaTerminoIndex !== -1) {
      columnHeaders.splice(fechaTerminoIndex + 1, 0, {
        name: "duracion",
        inputType: "number",
        type: "number"
      });
    } else {
      // 📌 Si "FechaTermino" no está, simplemente agregarla al final
      columnHeaders.push({
        name: "duracion",
        inputType: "number",
        type: "number"
      });
    }
 
  return columnHeaders;
};
// Función para formatear fecha en dd/mm/yyyy
const formatDate = (dateValue: any): string => {
  const dateObj = XLSX.SSF.parse_date_code(dateValue); // Convierte el número de Excel a Date
  // console.log('dateObj',dateObj);
  if (!dateObj) return "";

  const day = String(dateObj.d).padStart(2, "0");
  const month = String(dateObj.m).padStart(2, "0");
  const year = String(dateObj.y);
  return `${day}/${month}/${year}`;
};


// Función para limpiar y normalizar datos del Excel
const trimExcelData = (data: any[]): any[] => {
  //console.log('En trimExcelData',data);
  return data.map(row => {
    const cleanedRow: any = {};
    Object.keys(row).forEach(originalKey => {
      // const pascalCaseKey = toPascalCase(originalKey); // Convertir a camelCase y limpiar comillas
      const camelCaseKey = originalKey; // Convertir a camelCase y limpiar comillas
      let value = row[originalKey];
      // console.log('camelCaseKey',camelCaseKey);
     // 📌 Detectar columnas de fecha y convertirlas
      if (camelCaseKey.startsWith("fecha") && typeof value === "number") {
        value = formatDate(value);
      }
      // 📌 Si la columna es "Presupuesto", asegurarse de que sea numérico
      if (camelCaseKey === "presupuesto") {
        value = isNaN(Number(value)) ? 0 : Number(value);
      }
      // Aplicar trim() solo a strings
      cleanedRow[camelCaseKey] = typeof value === "string" ? value.trim() : value;
    });

    return cleanedRow;
  });
};

// Validación del campo "Plazo"
const validatePlazoColumn = (data: any[]) => {
  const plazoRegex = /^\d+d$/; // Expresión regular para valores tipo "3d", "7d"

  for (const [index, row] of data.entries()) {
    if ("Plazo" in row) {
      const plazoValue = row["Plazo"];

      if (plazoValue !== "" && !plazoRegex.test(plazoValue)) {
        throw new Error(
          `Error en la fila ${index + 2}: El campo "Plazo" debe estar en blanco o tener un valor en formato "Nd" (Ejemplo: "3d", "7d").`
        );
      }
    }
  }
};
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  try {
    // Ejecutar middleware de subida de archivos
    await runMiddleware(req, res, upload.single("file"));
    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ message: "No se subió ningún archivo." });
    }

    console.log("Archivo recibido en API uploadExcel:", file.originalname);
    // Leer el archivo Excel con SheetJS
    // const workbook = XLSX.readFile(file.path);
  // ✅ Leer directamente desde el buffer en memoria
    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const columnHeaders = getColumnHeaders(worksheet);    
    let jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    // console.log("Contenido procesado del Excel jsonData[0] en API uploadExcel:", jsonData[0]);
    jsonData=camelizeKeys(jsonData);//convierte todas las llaves de jsonData a camelCase
    jsonData = trimExcelData(jsonData);
    // console.log("Contenido procesado del Excel trimeado en API jsonData[1]:", jsonData[1]);

    // console.log('jsonData camelCase',camelizeKeys(jsonData));
    // Validaciones
    if (!jsonData.length) {
      return res.status(400).json({ message: "El archivo Excel está vacío." });
    }
    const requiredColumns = ["NumActividad", "Actividad","Presupuesto","FechaInicio","FechaTermino"]; //deben ser PascalCase en el Excel
    //const missingColumns = requiredColumns.filter(col => !columnHeaders.includes(col));
    //console.log('columnHeaders en API uploadExcel:',columnHeaders); 
    const missingColumns = requiredColumns.filter(col => !columnHeaders.some(c => c.name === col));

    // console.log('requiredColumns en API uploadExcel:',requiredColumns); 
    //  console.log('missingColumns en API uploadExcel:', missingColumns); 
    if (missingColumns.length > 0) {
      return res.status(400).json({
        message: `El archivo Excel debe incluir las siguientes columnas: ${missingColumns.join(", ")}`,
      });
    }
    // 📌 Convertir "NumActividad" a string antes de enviar al frontend
    jsonData = jsonData.map((row: any) => ({ 
      ...row,
      "numActividad": row["numActividad"] !== undefined ? String(row["numActividad"]) : "", 
    }));
    validatePlazoColumn(jsonData); 

    // Convertir las fechas y agregar Duracion
    jsonData = jsonData.map((row: any) => {
      const fechaInicio = row["fechaInicio"] || row["Fecha Inicio"];
      const fechaTermino = row["fechaTermino"] || row["Fecha Término"];
      if (fechaTermino) row["duracion"] = calculateDuration(fechaInicio, fechaTermino) ?? " ";
      return row;
    });
    //console.log('en API uploadExcel jsonData',jsonData);
    // Enviar respuesta al frontend
    const excelColumns: ExcelColumn[]=columnHeaders;
    // console.log('jsonData enviado al FE',jsonData);
    // console.log(excelColumns);
    res.status(200).json({ message: "Archivo procesado correctamente", data: jsonData,  excelColumns,});
  } catch (error) {
    console.error("Error en la API uploadExcel:", error);

    res.status(500).json({
      message: "Error en el servidor al procesar el archivo.",
      error: (error as Error).message || "Error desconocido",
    });
  } 
  // finally {
  //   // Eliminar archivo temporal después del procesamiento
  //   try {
  //     const filePath = (req as any).file?.path;
  //     if (filePath && fs.existsSync(filePath)) {
  //       fs.unlinkSync(filePath);
  //     }
  //   // if ((req as any).file?.path) {
  //   //   fs.unlinkSync((req as any).file.path);
  //   // }
  //   } catch (e) {
  //       console.warn("No se pudo eliminar el archivo temporal:", e);
  //   }
  // }
};

// Deshabilitar el body parser predeterminado de Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
