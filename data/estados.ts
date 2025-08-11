export const ESTADOS = ['SUBIDO', 'RECHAZADO', 'APROBADO'] as const;
export type Estado = typeof ESTADOS[number];

/** Reglas de transición permitidas */
export const TRANSICIONES_PERMITIDAS: Record<Estado, Estado[]> = {
  SUBIDO: ['APROBADO', 'RECHAZADO'], // ← Permitir transición directa
  RECHAZADO: [],                     // Estado final
  APROBADO: [],                      // Estado final
};
