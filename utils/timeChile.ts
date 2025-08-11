// Calcula el offset (en minutos) de una zona para un instante UTC dado
function getOffsetMinutesForTZByParts(dateUTC: Date, timeZone: string): number {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    }).formatToParts(dateUTC);
  
    const y = Number(parts.find(p => p.type === 'year')?.value);
    const m = Number(parts.find(p => p.type === 'month')?.value);
    const d = Number(parts.find(p => p.type === 'day')?.value);
    const h = Number(parts.find(p => p.type === 'hour')?.value);
    const mi = Number(parts.find(p => p.type === 'minute')?.value);
    const s = Number(parts.find(p => p.type === 'second')?.value);
  
    // Estos componentes representan la hora "civil" en esa zona para el MISMO instante.
    const tzLocalMs = Date.UTC(y, m - 1, d, h, mi, s);
    // Diferencia entre la hora civil (zona) y el instante UTC.
    return Math.round((tzLocalMs - dateUTC.getTime()) / 60000);
  }
  
  // parsea "dd-MM-yyyy" o "dd-MM-yyyy HH:mm"
  function parseDdMmYyyy(input: string): { y: number; m: number; d: number; h: number; mi: number } {
    const [datePart, timePart] = input.trim().split(/\s+/);
    const [dd, MM, yyyy] = datePart.split('-').map(Number);
    let h = 0, mi = 0;
    if (timePart) {
      const [hh, mm] = timePart.split(':').map(Number);
      h = hh ?? 0; mi = mm ?? 0;
    }
    return { y: yyyy, m: MM, d: dd, h, mi };
  }
  
  // Conversión local (America/Santiago) -> UTC (para guardar en Mongo)
  export function chileLocalToUTC(dateStr: string, timeZone = 'America/Santiago'): Date {
    dateStr = dateStr.replace(',', '').replace(/\s*hrs?\.?$/i, '').trim();// limpiar formato “de vitrina”: "15-08-2025, 20:30 hrs."
    const { y, m, d, h, mi } = parseDdMmYyyy(dateStr);
  
    // 1) Suposición de UTC con esos componentes
    let utcMs = Date.UTC(y, m - 1, d, h, mi, 0, 0);
  
    // 2) Calcula offset para esa fecha
    let offsetMin = getOffsetMinutesForTZByParts(new Date(utcMs), timeZone);
  
    // 3) Corrige: UTC = local - offset
    utcMs -= offsetMin * 60_000;
  
    // 4) (opcional) Recalcular por si cruzaste un cambio DST
    const offsetMin2 = getOffsetMinutesForTZByParts(new Date(utcMs), timeZone);
    if (offsetMin2 !== offsetMin) {
      utcMs = Date.UTC(y, m - 1, d, h, mi, 0, 0) - offsetMin2 * 60_000;
    }
  
    return new Date(utcMs);
  }
  