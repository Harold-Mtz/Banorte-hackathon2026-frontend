export const money = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value) : 'Sin dato';
export const date = (value: unknown) => {
  if (!value || Number.isNaN(Date.parse(String(value)))) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(String(value)));
};
export const percent = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? new Intl.NumberFormat('es-MX', { style: 'percent', maximumFractionDigits: 2 }).format(value / 100) : 'Sin dato';
