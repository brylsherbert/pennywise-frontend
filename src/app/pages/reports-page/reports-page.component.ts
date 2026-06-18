import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  IonContent,
  IonRefresher,
  IonRefresherContent,
  RefresherCustomEvent,
} from '@ionic/angular/standalone';
import { Budget } from '../../core/models/budgets.model';
import { Category } from '../../core/models/categories.model';
import { Transaction } from '../../core/models/transactions.model';
import { BudgetsStore } from '../../core/services/store/budgets.store';
import { CategoriesStore } from '../../core/services/store/categories.store';
import { TransactionsStore } from '../../core/services/store/transactions.store';
import {
  buildBudgetFundingHealth,
} from '../../features/budgets/shared/budget-health.utils';
import { ReportBudgetHealthCardComponent } from '../../features/reports/components/report-budget-health-card/report-budget-health-card.component';
import { ReportCashFlowCardComponent } from '../../features/reports/components/report-cash-flow-card/report-cash-flow-card.component';
import { ReportCategoryBreakdownCardComponent } from '../../features/reports/components/report-category-breakdown-card/report-category-breakdown-card.component';
import { ReportDailySpendingCardComponent } from '../../features/reports/components/report-daily-spending-card/report-daily-spending-card.component';
import { ReportSummaryCardComponent } from '../../features/reports/components/report-summary-card/report-summary-card.component';
import {
  BudgetHealthReport,
  CategoryBreakdownReport,
  SpendingDayReport,
} from '../../features/reports/shared/reports.model';
import { HeaderComponent } from '../../layout/header/header.component';
import { formatCompactCurrency, toAmount } from '../../shared/utils/amount-format.utils';

const RECENT_SPENDING_DAYS = 7;
const MIN_SPENDING_BAR_PERCENT = 24;
const MAX_BREAKDOWN_ITEMS = 5;
const DEFAULT_CATEGORY_COLOR = '#3880ff';

@Component({
  selector: 'app-reports-page',
  templateUrl: './reports-page.component.html',
  styleUrls: ['./reports-page.styles.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonContent,
    IonRefresher,
    IonRefresherContent,
    HeaderComponent,
    ReportBudgetHealthCardComponent,
    ReportCashFlowCardComponent,
    ReportCategoryBreakdownCardComponent,
    ReportDailySpendingCardComponent,
    ReportSummaryCardComponent,
  ],
})
export class ReportsPageComponent {
  private readonly budgetsStore = inject(BudgetsStore);
  private readonly categoriesStore = inject(CategoriesStore);
  private readonly transactionsStore = inject(TransactionsStore);

  protected readonly isLoadingSummary = signal(false);
  protected readonly budgetSummary = this.budgetsStore.budgetSummary;
  protected readonly transactions = this.transactionsStore.transactions;
  protected readonly budgets = this.budgetsStore.budgets;
  protected readonly categories = this.categoriesStore.categories;
  protected readonly currentDate = signal(new Date());

  protected readonly totalExpense = computed(() =>
    toAmount(this.budgetSummary()?.total_expense_amount),
  );

  protected readonly totalIncome = computed(() =>
    toAmount(this.budgetSummary()?.total_income_amount),
  );

  protected readonly totalAllocated = computed(() =>
    toAmount(this.budgetSummary()?.total_allocated),
  );

  protected readonly totalUnallocated = computed(() =>
    toAmount(this.budgetSummary()?.total_unallocated),
  );

  protected readonly totalBalance = computed(() =>
    toAmount(this.budgetSummary()?.total_balance),
  );

  protected readonly budgetUsagePercent = computed(() => {
    const allocated = this.totalAllocated();
    if (!allocated) return 0;

    const percent = (this.totalExpense() / allocated) * 100;
    return Math.min(Math.max(percent, 0), 100);
  });

  protected readonly budgetUsageValue = computed(() => this.budgetUsagePercent() / 100);

  protected readonly netCashFlow = computed(() => this.totalIncome() - this.totalExpense());
  protected readonly headerSummary = computed(() =>
    `${formatCompactCurrency(this.netCashFlow())} cash flow`,
  );

  protected readonly hasPositiveCashFlow = computed(() => this.netCashFlow() >= 0);

  protected readonly spendingToIncomePercent = computed(() => {
    const income = this.totalIncome();
    const expense = this.totalExpense();

    if (!income) return expense ? 100 : 0;

    return Math.min(Math.max((expense / income) * 100, 0), 100);
  });

  protected readonly spendingToIncomeValue = computed(() => this.spendingToIncomePercent() / 100);

  protected readonly recentSpending = computed(() =>
    buildRecentSpendingReport(this.transactions(), RECENT_SPENDING_DAYS),
  );

  protected readonly categoryBreakdown = computed(() =>
    buildCategoryBreakdownReport(
      this.transactions(),
      this.budgets(),
      this.categories(),
      MAX_BREAKDOWN_ITEMS,
    ),
  );

  protected readonly budgetHealth = computed(() =>
    buildBudgetHealthReport(this.budgets(), MAX_BREAKDOWN_ITEMS),
  );

  constructor() {
    void this.loadReports();
  }

  protected async onRefresh(event: RefresherCustomEvent): Promise<void> {
    try {
      await this.loadReports();
    } finally {
      event.detail.complete();
    }
  }

  private async loadReports(): Promise<void> {
    this.isLoadingSummary.set(true);

    try {
      await Promise.all([
        this.budgetsStore.getBudgetSummary(),
        this.loadAllTransactions(),
        this.loadAllBudgets(),
        this.categoriesStore.getAllCategories(),
      ]);
    } finally {
      this.isLoadingSummary.set(false);
    }
  }

  private async loadAllTransactions(): Promise<void> {
    await this.transactionsStore.getAllTransactions();

    while (this.transactionsStore.hasMore() && this.transactionsStore.nextCursor()) {
      const cursor = this.transactionsStore.nextCursor();
      if (!cursor) return;

      await this.transactionsStore.getAllTransactions({
        cursor,
        limit: this.transactionsStore.defaultTransactionsLimit,
      });
    }
  }

  private async loadAllBudgets(): Promise<void> {
    await this.budgetsStore.getAllBudgets();

    while (this.budgetsStore.hasMore() && this.budgetsStore.nextCursor()) {
      const cursor = this.budgetsStore.nextCursor();
      if (!cursor) return;

      await this.budgetsStore.getAllBudgets({
        cursor,
        limit: this.budgetsStore.defaultBudgetsLimit,
      });
    }
  }
}

function buildRecentSpendingReport(
  transactions: Transaction[],
  daysToShow: number,
): SpendingDayReport[] {
  const expensesByDate = new Map<string, number>();

  for (const transaction of transactions) {
    if (transaction.type !== 'expense') continue;

    const dateKey = transaction.transaction_date?.slice(0, 10);
    if (!dateKey) continue;

    expensesByDate.set(dateKey, (expensesByDate.get(dateKey) ?? 0) + toAmount(transaction.amount));
  }

  const recentDates = getRecentDateKeys(daysToShow);
  const maxAmount = Math.max(...recentDates.map(date => expensesByDate.get(date) ?? 0), 0);

  return recentDates.map(date => {
    const amount = expensesByDate.get(date) ?? 0;

    return {
      date,
      label: getShortWeekdayLabel(date),
      amount,
      percent: maxAmount && amount ? Math.max((amount / maxAmount) * 100, MIN_SPENDING_BAR_PERCENT) : 0,
    };
  });
}

function getRecentDateKeys(daysToShow: number): string[] {
  const today = new Date();
  const dates: string[] = [];

  for (let offset = daysToShow - 1; offset >= 0; offset--) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    dates.push(toDateKey(date));
  }

  return dates;
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function buildCategoryBreakdownReport(
  transactions: Transaction[],
  budgets: Budget[],
  categories: Category[],
  limit: number,
): CategoryBreakdownReport[] {
  const budgetsById = new Map(budgets.map(budget => [budget.id, budget]));
  const categoriesById = new Map(categories.map(category => [category.id, category]));
  const totalsByCategory = new Map<string, { amount: number; color: string; label: string }>();

  for (const transaction of transactions) {
    if (transaction.type !== 'expense') continue;

    const budget = budgetsById.get(transaction.budget_id);
    const category = budget?.category_id ? categoriesById.get(budget.category_id) : null;
    const key = category?.id ?? budget?.id ?? 'uncategorized';
    const current = totalsByCategory.get(key);

    totalsByCategory.set(key, {
      amount: (current?.amount ?? 0) + toAmount(transaction.amount),
      color: category?.color ?? DEFAULT_CATEGORY_COLOR,
      label: category?.name ?? budget?.name ?? 'Uncategorized',
    });
  }

  const totalAmount = [...totalsByCategory.values()].reduce((sum, item) => sum + item.amount, 0);

  return [...totalsByCategory.values()]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit)
    .map(item => ({
      ...item,
      percent: totalAmount ? (item.amount / totalAmount) * 100 : 0,
    }));
}

function buildBudgetHealthReport(budgets: Budget[], limit: number): BudgetHealthReport[] {
  return budgets
    .map(budget => {
      const allocated = toAmount(budget.allocated_amount);
      const target = toAmount(budget.target_amount);
      const health = buildBudgetFundingHealth(allocated, target);

      return {
        id: budget.id,
        name: budget.name,
        allocated,
        target,
        percent: health.percent,
        progressValue: health.progressValue,
        status: health.status,
        color: health.color,
        className: health.className,
      };
    })
    .sort((a, b) => a.percent - b.percent)
    .slice(0, limit);
}

function getShortWeekdayLabel(date: string): string {
  const day = new Date(`${date}T00:00:00`).getDay();
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day] ?? '';
}
