import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal, viewChild } from '@angular/core';
import { Navigation, Router } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
  RefresherCustomEvent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { createOutline } from 'ionicons/icons';
import { Budget } from '../../core/models/budgets.model';
import { BudgetsStore } from '../../core/services/store/budgets.store';
import { BudgetEditModalComponent } from '../../features/budgets/components/budget-edit-modal/budget-edit-modal.component';
import { BudgetTransactionsComponent } from '../../features/budgets/components/budget-transactions/budget-transactions.component';

@Component({
  selector: 'app-budget-transactions-page',
  templateUrl: './budget-transactions-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonButton,
    IonButtons,
    IonBackButton,
    IonIcon,
    IonHeader,
    IonToolbar,
    IonTitle,
    BudgetEditModalComponent,
    BudgetTransactionsComponent,
  ],
})
export class BudgetTransactionsPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly budgetsStore = inject(BudgetsStore);
  private readonly budgetTransactions = viewChild<BudgetTransactionsComponent>('budgetTransactions');
  private readonly currentNavigation = signal<Navigation | null>(null);
  private readonly _isBudgetEditModalOpen = signal(false);
  private readonly navigationBudget = computed(
    () => this.currentNavigation()?.extras?.state?.['budget'] as Budget | undefined,
  );

  readonly budgetId = input<string>('');
  protected readonly budget = computed(() => this.handleBudget());
  protected readonly isBudgetEditModalOpen = this._isBudgetEditModalOpen.asReadonly();

  constructor() {
    addIcons({ createOutline });
  }

  ngOnInit(): void {
    this.setCurrentNavigation();
  }

  protected async onRefresh(event: RefresherCustomEvent): Promise<void> {
    try {
      await this.budgetTransactions()?.reload();
    } finally {
      event.detail.complete();
    }
  }

  protected openBudgetEditModal(): void {
    this._isBudgetEditModalOpen.set(true);
  }

  protected onBudgetEditModalDismissed(): void {
    this._isBudgetEditModalOpen.set(false);
  }

  protected async onBudgetDeleted(): Promise<void> {
    this._isBudgetEditModalOpen.set(false);
    await this.router.navigate(['/budgets'], { replaceUrl: true });
  }

  private handleBudget(): Budget | null {
    return (
      this.budgetsStore.budgets().find(item => item.id === this.budgetId()) ??
      this.navigationBudget() ??
      null
    );
  }

  private setCurrentNavigation(): void {
    this.currentNavigation.set(this.router.currentNavigation());
  }
}
