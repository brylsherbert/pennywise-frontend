import { Component, EnvironmentInjector, inject, ChangeDetectionStrategy, signal, viewChild } from '@angular/core';
import {
  IonFab,
  IonFabButton,
  IonFabList,
  IonIcon,
  IonLabel,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  pieChartOutline,
  pieChart,
  swapHorizontalOutline,
  swapHorizontal,
  cardOutline,
  card,
  barChartOutline,
  barChart,
  settingsOutline,
  settings,
  pricetagsOutline,
} from 'ionicons/icons';
import { AccountCreateModalComponent } from '../../features/accounts/components/account-create-modal/account-create-modal.component';
import { BudgetCreateModalComponent } from '../../features/budgets/components/budget-create-modal/budget-create-modal.component';
import { CategoryCreateModalComponent } from '../../features/categories/components/category-create-modal/category-create-modal.component';
import { TransactionCreateModalComponent } from '../../features/transactions/components/transaction-create-modal/transaction-create-modal.component';

type QuickCreateModal = 'account' | 'budget' | 'category' | 'transaction';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    IonFab,
    IonFabButton,
    IonFabList,
    AccountCreateModalComponent,
    BudgetCreateModalComponent,
    CategoryCreateModalComponent,
    TransactionCreateModalComponent,
  ],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);

  private readonly quickCreateFab = viewChild(IonFab);

  protected readonly activeCreateModal = signal<QuickCreateModal | null>(null);
  protected readonly isQuickCreateFabOpen = signal(false);

  constructor() {
    addIcons({
      addOutline,
      pieChartOutline,
      pieChart,
      swapHorizontalOutline,
      swapHorizontal,
      cardOutline,
      card,
      barChartOutline,
      barChart,
      settingsOutline,
      settings,
      pricetagsOutline,
    });
  }

  protected toggleQuickCreateFab(): void {
    this.isQuickCreateFabOpen.update(isOpen => !isOpen);
  }

  protected async openCreateModal(modal: QuickCreateModal): Promise<void> {
    this.isQuickCreateFabOpen.set(false);
    await this.quickCreateFab()?.close();
    this.activeCreateModal.set(modal);
  }

  protected closeCreateModal(): void {
    this.activeCreateModal.set(null);
  }
}
