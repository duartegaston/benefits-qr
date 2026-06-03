export function buildOrderNumberFromReclamoId(reclamoId: string): string {
  const clean = reclamoId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return `ORD-${clean.slice(-8).padStart(8, "0")}`;
}
