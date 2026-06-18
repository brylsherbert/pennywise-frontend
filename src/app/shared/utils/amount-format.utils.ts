export function toAmount(value: string | undefined): number {
  const amount = Number(value ?? 0);
  return Number.isNaN(amount) ? 0 : amount;
}

export function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}
