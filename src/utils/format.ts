export const formatCurrencyMXN = (value: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);
export const formatDate = (value: string | null | undefined) => {
  if (!value || !Number.isFinite(new Date(value).getTime()))
    return "Sin fecha definida";
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
};
export const lifeLabels = {
  FIRST_HOME: "Mi primera casa",
  CAR_PURCHASE: "Comprar un auto",
  MARRIAGE: "Mi boda",
  CHILD: "Mi familia",
  EDUCATION: "Mi educación",
  TRAVEL: "Mi próximo viaje",
};
export const statusLabels = {
  ACTIVE: "Activa",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};
