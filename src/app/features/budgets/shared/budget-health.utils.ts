export type BudgetFundingStatus = 'Not Started' | 'Critical' | 'Low' | 'Watch' | 'Healthy' | 'Funded';
export type BudgetFundingColor = 'medium' | 'success' | 'warning' | 'danger';

export interface BudgetFundingHealth {
  allocated: number;
  target: number;
  percent: number;
  percentLabel: string;
  progressValue: number;
  status: BudgetFundingStatus;
  color: BudgetFundingColor;
  className: string;
  gapAmount: number;
  gapLabel: 'needed' | 'extra funded';
}

export function buildBudgetFundingHealth(allocated: number, target: number): BudgetFundingHealth {
  const rawPercent = target ? (allocated / target) * 100 : 0;
  const percent = Math.max(rawPercent, 0);
  const status = getBudgetFundingStatus(percent, allocated);
  const gapAmount = Math.abs(target - allocated);

  return {
    allocated,
    target,
    percent,
    percentLabel: `${Math.round(percent)}%`,
    progressValue: Math.min(percent, 100) / 100,
    status,
    color: getBudgetFundingColor(status),
    className: getBudgetFundingClassName(status),
    gapAmount,
    gapLabel: target - allocated <= 0 ? 'extra funded' : 'needed',
  };
}

export function getBudgetFundingStatus(percent: number, allocated: number): BudgetFundingStatus {
  if (allocated === 0) return 'Not Started';
  if (percent < 20) return 'Critical';
  if (percent < 50) return 'Low';
  if (percent < 80) return 'Watch';
  if (percent < 100) return 'Healthy';
  return 'Funded';
}

export function getBudgetFundingColor(status: BudgetFundingStatus): BudgetFundingColor {
  switch (status) {
    case 'Not Started':
      return 'medium';
    case 'Critical':
      return 'danger';
    case 'Low':
    case 'Watch':
      return 'warning';
    case 'Healthy':
    case 'Funded':
      return 'success';
  }
}

export function getBudgetFundingClassName(status: BudgetFundingStatus): string {
  return `budget-health--${status.toLowerCase().replaceAll(' ', '-')}`;
}
