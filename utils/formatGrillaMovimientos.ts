import { monthMap } from './monthMap';
import { GrillaMovimientos, GrillaMovimientosAggregated } from '@/types/interfaceGastosComunes';

export const formatGrillaMovimientos = (rawResults: GrillaMovimientosAggregated[]): GrillaMovimientos[] => {
  const grilla: Record<string, GrillaMovimientos> = {};
   return rawResults;
  // rawResults.forEach(({ id, fechaDocumento, comentario, ingreso, salida,saldo }) => {
  //   const key = `${id.toString()}`;
  //   if (!grilla[key]) {
  //     grilla[key] = { fechaDocumento, comentario, ingreso, salida, saldo };
  //     // Object.values(monthMap).forEach(m => {
  //     //   grilla[key][m] = 0;
  //     // });
  //   }
  //   const mesStr = monthMap[mes];
  //   grilla[key][mesStr] = totalMonto;
  // });

  /*
  rawResults.forEach(({ id, comentario, ingreso, salida,saldo }) => {
    const key = `${id}`;
    if (!grilla[key]) {
      grilla[key] = { id, comentario, ingreso, salida, saldo };
      Object.values(monthMap).forEach(m => {
        grilla[key][m] = 0;
      });
    }
    const mesStr = monthMap[mes];
    grilla[key][mesStr] = totalMonto;
  });
    // Calcular total anual para cada fila
  Object.values(grilla).forEach((fila) => {
    fila.totalAnual = Object.values(monthMap)
    .map(m => Number(fila[m]) || 0)
    .reduce((acc, val) => acc + val, 0);
  });
    // Crear fila TOTAL
  const totales: CarteraGrilla = { idCasa: -1, codigoCasa: '', familia: 'TOTAL' };
  Object.values(monthMap).forEach(m => {
    totales[m] = Object.values(grilla)
    .map(f => Number(f[m]) || 0)
    .reduce((a, b) => a + b, 0);
  });
  
  totales.totalAnual = Object.values(monthMap)
    .map(m => Number(totales[m]) || 0)
    .reduce((a, b) => a + b, 0);
  // Combinar filas y ordenar por codigoCasa (deja TOTAL al final)
  const filasOrdenadas = [...Object.values(grilla)]
    .sort((a, b) => {
      if (!a.codigoCasa) return 1;
      if (!b.codigoCasa) return -1;
      return String(a.codigoCasa).localeCompare(String(b.codigoCasa));
    });
    */
  //return [...filasOrdenadas, totales];
  //return rawResults;
};
