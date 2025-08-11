// utils/formatSalary.ts
export const formatMoney = (salary: number | undefined): string => {
  if (salary === undefined || salary === null || isNaN(salary)) {
    return '0'; // Valor por defecto en caso de valores inválidos
  }
  return salary.toLocaleString('es-CL');
};