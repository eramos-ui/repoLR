import * as XLSX from "xlsx";
export const exportToExcel = (fileName: string, data: any[], columns: any[]) => {

  if (!fileName) {
    alert("Debe proporcionar un nombre para el archivo.");
    return;
  }
  const headers = columns.map((col) => col.label); // Nombres de las columnas
  const rows = data.map((row) =>
    //columns.map((col) => row[col.key as keyof typeof row] || "") // Extraer valores basados en `key`
  columns.map((col) => {
    const value = row[col.key as keyof typeof row] || "";

      // 📌 Convertir "NumActividad" a string si es un número
      if (col.key.includes("Actividad") && typeof value === "number") {//si incluye la palabra "Actividad" se toma string
        return `${value}`; // 🔹 Se agrega `'` al inicio para que Excel lo trate como texto
      }
      return value;
    })
  );
  // Crear un libro de Excel
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Datos"); //nombre de la hoja
  // Exportar el archivo Excel
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
