import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonLabel,
  IonItem,
  IonItemGroup,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  RefresherCustomEvent,
  InfiniteScrollCustomEvent,
} from '@ionic/angular/standalone';
import { Budget, BudgetCategoryGroup, BUDGET_OTHERS_CATEGORY_KEY } from '../../core/models/budgets.model';
import { Category } from '../../core/models/categories.model';
import { BudgetsStore } from '../../core/services/store/budgets.store';
import { CategoriesStore } from '../../core/services/store/categories.store';
import { BudgetsListSkeletonComponent } from '../../features/budgets/components/budgets-list-skeleton/budgets-list-skeleton.component';
import { BudgetsItemComponent } from '../../features/budgets/components/budgets-item/budgets-item.component';
import { HeaderComponent } from '../../layout/header/header.component';
import { formatCompactCurrency, toAmount } from '../../shared/utils/amount-format.utils';
import { buildGroupedBudgets } from '../../features/budgets/shared/budget-utils';

@Component({
  selector: 'app-budgets-page',
  templateUrl: './budgets-page.component.html',
  styleUrls: ['./budgets-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonInfiniteScrollContent,
    IonInfiniteScroll,
    IonItemGroup,
    IonItem,
    IonLabel,
    IonSearchbar,
    IonRefresherContent,
    IonRefresher,
    IonContent,
    HeaderComponent,
    BudgetsListSkeletonComponent,
    BudgetsItemComponent,
  ],
})
export class BudgetsPageComponent {
  private readonly budgetsStore = inject(BudgetsStore);
  private readonly categoriesStore = inject(CategoriesStore);
  private readonly router = inject(Router);

  protected readonly searchQuery = signal('');
  protected readonly isLoadingBudgets = this.budgetsStore.loading;
  protected readonly groupedBudgets = computed(() =>
    buildGroupedBudgets(
      this.budgetsStore.budgets(),
      this.categoriesStore.categories(),
      this.searchQuery(),
    ),
  );
  protected readonly hasMoreBudgets = this.budgetsStore.hasMore;
  protected readonly nextBudgetCursor = this.budgetsStore.nextCursor;
  protected readonly headerSummary = computed(() => {
    const unallocated = toAmount(this.budgetsStore.budgetSummary()?.total_unallocated);

    return `${formatCompactCurrency(unallocated)} unallocated`;
  });

  protected onSearch(event: Event): void {
    const value = (event as CustomEvent<{ value?: string }>).detail.value;
    this.searchQuery.set(value?.toLowerCase() ?? '');
  }

  protected async onRefresh(event: RefresherCustomEvent): Promise<void> {
    try {
      this.budgetsStore.clearBudgets();
      await this.budgetsStore.getAllBudgets();
    } finally {
      event.detail.complete();
    }
  }

  protected async loadMore(event: InfiniteScrollCustomEvent): Promise<void> {
    try {
      if (this.hasMoreBudgets() && this.nextBudgetCursor()) {
        await this.budgetsStore.getAllBudgets({
          cursor: this.nextBudgetCursor()!,
          limit: this.budgetsStore.defaultBudgetsLimit,
        });
      }
    } catch (error) {
      console.error('[BudgetsPage] Error loading more budgets:', error);
    } finally {
      event.target.complete();
    }
  }

  protected openBudget(budget: Budget): void {
    void this.router.navigate(['/budgets', budget.id], { state: { budget } });
  }
}