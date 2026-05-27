export function formatCurrency(price: number): string {
  try {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(price);
  } catch {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'PEN',
    }).format(price);
  }
}
