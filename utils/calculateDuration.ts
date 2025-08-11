
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
// Función para convertir fechas a `dayjs` y calcular diferencia en días, aceptar formato DD/MM/YYYY o DD-MM-YYYY
// Formatos permitidos: DD/MM/YYYY o DD-MM-YYYY
const allowedFormats = ["DD/MM/YYYY", "DD-MM-YYYY"];

export const calculateDuration = (startDate: string, endDate: string): number | null => {
  if (!startDate || !endDate) return null;

  const start = dayjs(startDate, allowedFormats, true);
  const end = dayjs(endDate, allowedFormats, true);

  if (!start.isValid() || !end.isValid()) return null;

  return end.diff(start, "day");
};

