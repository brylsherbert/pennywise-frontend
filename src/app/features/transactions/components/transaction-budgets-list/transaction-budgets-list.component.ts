import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { BudgetsListSkeletonComponent } from "../../../budgets/components/budgets-list-skeleton/budgets-list-skeleton.component";
import { IonItemGroup, IonItem, IonLabel, ModalController } from "@ionic/angular/standalone";
import { BudgetsItemComponent } from "../../../budgets/components/budgets-item/budgets-item.component";
import { BudgetsStore } from '../../../../core/services/store/budgets.store';
import { CategoriesStore } from '../../../../core/services/store/categories.store';
import { buildGroupedBudgets } from '../../../budgets/shared/budget-utils';
import { Budget } from '../../../../core/models/budgets.model';
import { TransactionBudgetAllocationModalComponent } from '../transaction-budget-allocation-modal/transaction-budget-allocation-modal.component';
import { TransactionBudgetPayload } from '../../shared/transaction-form.model';
import { TransactionBudget } from '../../../../core/models/transactions.model';

@Component({
  selector: 'app-transaction-budgets-list',
  templateUrl: './transaction-budgets-list.component.html',
  styleUrls: ['./transaction-budgets-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonLabel, IonItem, IonItemGroup, BudgetsListSkeletonComponent, BudgetsItemComponent]
})
export class TransactionBudgetsListComponent {
  private readonly modalController = inject(ModalController);
  private readonly budgetsStore = inject(BudgetsStore);
  private readonly categoriesStore = inject(CategoriesStore);

  protected readonly isLoadingBudgets = this.budgetsStore.loading;
  protected readonly budgets = this.budgetsStore.budgets;
  protected readonly categories = this.categoriesStore.categories;
  protected readonly groupedBudgets = computed(() => buildGroupedBudgets(this.budgets(), this.categories()));

  readonly transactionActionType = input<string | null>(null);
  readonly transactionBudgets = input<TransactionBudget[] | undefined>();
  protected readonly totalUnallocated = computed(() => Number(this.budgetsStore.budgetSummary()?.total_unallocated));

  readonly budgetsData = output<TransactionBudgetPayload[]>();

  protected readonly budgetsPayload = signal<TransactionBudgetPayload[]>([]);

  protected async openBudget(budget: Budget): Promise<void> {
    const existingBudgetPayload = this.findBudgetInBudgetPayload(budget);
    const existingTransactionBudget = this.findBudgetInTransactionBudget(budget);

    const modal = await this.modalController.create({
      component: TransactionBudgetAllocationModalComponent,
      componentProps: {
        budget,
        budgetPayload: existingBudgetPayload,
        transactionActionType: this.transactionActionType(),
        transactionBudget: existingTransactionBudget,
        totalUnallocated: this.totalUnallocated(),
      },
      initialBreakpoint: 1,
      canDismiss: true,
    });

    await modal.present();

    const { data, role } = await modal.onDidDismiss();

    if (role !== 'save' || !data) {
      return;
    }

    this.handleBudgetPayload(data);
  }

  protected handleBudgetPayload(budgetPayload: TransactionBudgetPayload) {
    this.budgetsPayload.update((budgets: TransactionBudgetPayload[]) => {
      if (budgetPayload.new_allocated_amount <= 0 && this.transactionActionType() === 'create') {
        return budgets.filter(
          budget => budget.budget_id !== budgetPayload.budget_id
        );
      }

      const existingBudget = budgets.find(
        budget => budget.budget_id === budgetPayload.budget_id
      );

      if (existingBudget) {
        return budgets.map((budget: TransactionBudgetPayload) => {
          return budget.budget_id === budgetPayload.budget_id ? budgetPayload : budget
        }
        );
      }

      return [...budgets, budgetPayload];
    });

    this.budgetsData.emit(this.budgetsPayload());
  }

  protected findBudgetInBudgetPayload(budget: Budget) {
    return this.budgetsPayload()?.find((bp) => bp.budget_id === budget.id);
  }

  protected findBudgetInTransactionBudget(budget: Budget) {
    return this.transactionBudgets()?.find((tb) => tb.budget_id === budget.id);
  }
}

