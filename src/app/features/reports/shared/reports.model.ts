import {
  BudgetFundingColor,
  BudgetFundingStatus,
} from '../../budgets/shared/budget-health.utils';

export interface SpendingDayReport {
  date: string;
  label: string;
  amount: number;
  percent: number;
}

export interface CategoryBreakdownReport {
  label: string;
  amount: number;
  percent: number;
  color: string;
}

export interface BudgetHealthReport {
  id: string;
  name: string;
  allocated: number;
  target: number;
  percent: number;
  progressValue: number;
  status: BudgetFundingStatus;
  color: BudgetFundingColor;
  className: string;
}
