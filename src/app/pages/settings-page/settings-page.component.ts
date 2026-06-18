import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  chevronForwardOutline,
  logInOutline,
  logOutOutline,
  personCircleOutline,
  pieChartOutline,
  pricetagsOutline,
  readerOutline,
  swapHorizontalOutline,
  walletOutline,
} from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';
import { AuthStore } from '../../core/services/store/auth.store';
import { CategoriesManageModalComponent } from '../../features/categories/components/categories-manage-modal/categories-manage-modal.component';
import { UserEditModalComponent } from '../../features/user/components/user-edit-modal/user-edit-modal.component';
import { HeaderComponent } from '../../layout/header/header.component';
import { UiService } from '../../shared/services/ui.service';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonContent,
    IonIcon,
    CategoriesManageModalComponent,
    UserEditModalComponent,
    HeaderComponent,
  ],
})
export class SettingsPageComponent {
  private readonly authService = inject(AuthService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly uiService = inject(UiService);

  protected readonly user = this.authStore.user;
  protected readonly isAuthenticated = this.authStore.isAuthenticated;
  protected readonly displayName = computed(() => this.user()?.username ?? 'Pennywise User');
  protected readonly email = computed(() => this.user()?.email ?? '');
  protected readonly accountCardTitle = computed(() =>
    this.isAuthenticated() ? this.displayName() : 'Free Account',
  );
  protected readonly accountCardSubtitle = computed(() =>
    this.isAuthenticated() ? this.email() : 'Sign in to sync your Pennywise data.',
  );
  protected readonly isCategoriesModalOpen = signal(false);
  protected readonly isUserEditModalOpen = signal(false);

  constructor() {
    addIcons({
      chevronForwardOutline,
      logInOutline,
      logOutOutline,
      personCircleOutline,
      pieChartOutline,
      pricetagsOutline,
      readerOutline,
      swapHorizontalOutline,
      walletOutline,
    });
  }

  protected routeToLoginPage(): void {
    void this.router.navigate(['/auth']);
  }

  protected routeToSignupPage(): void {
    void this.router.navigate(['/auth'], { state: { authMode: 'sign-up' } });
  }

  protected openCategoriesModal(): void {
    this.isCategoriesModalOpen.set(true);
  }

  protected closeCategoriesModal(): void {
    this.isCategoriesModalOpen.set(false);
  }

  protected openUserEditModal(): void {
    this.isUserEditModalOpen.set(true);
  }

  protected closeUserEditModal(): void {
    this.isUserEditModalOpen.set(false);
  }

  protected routeToAccountsPage(): void {
    void this.router.navigate(['/accounts']);
  }

  protected routeToBudgetsPage(): void {
    void this.router.navigate(['/budgets']);
  }

  protected routeToTransactionsPage(): void {
    void this.router.navigate(['/transactions']);
  }

  protected async handleLogout(): Promise<void> {
    const isLoggedOut = await this.authService.logout();

    if (!isLoggedOut) {
      await this.uiService.showToast('Unable to sign out. Please try again.', { color: 'danger' });
      return;
    }

    await this.uiService.showToast('Signed out successfully.');
  }

}
