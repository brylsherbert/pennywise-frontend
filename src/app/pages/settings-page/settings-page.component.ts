import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonContent, IonIcon } from '@ionic/angular/standalone';
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
  trashOutline,
  walletOutline,
} from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';
import { AuthStore } from '../../core/services/store/auth.store';
import { CategoriesManageModalComponent } from '../../features/categories/components/categories-manage-modal/categories-manage-modal.component';
import { UserEditModalComponent } from '../../features/user/components/user-edit-modal/user-edit-modal.component';
import { HeaderComponent } from '../../layout/header/header.component';
import { UiService } from '../../shared/services/ui.service';
import { UserStore } from '../../core/services/store/user.store';
import { AppBootstrapService } from '../../core/services/app-bootstrap.service';

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
  private readonly userStore = inject(UserStore);
  private readonly router = inject(Router);
  private readonly alertController = inject(AlertController);
  private readonly uiService = inject(UiService);
  private readonly appBootstrapService = inject(AppBootstrapService);

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
      trashOutline
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

  protected async handleResetAllData() {
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'Reset All Data',
      message: 'Are you sure you want to reset all data? This action cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Reset',
          role: 'destructive',
          handler: () => {
            alert.dismiss().then(async () => { 
              let loading: HTMLIonLoadingElement | undefined;
              try {
                loading = await this.uiService.showLoading('Resetting all data...');
                const success = await this.userStore.resetAllData();
  
                if (success) {
                  await this.appBootstrapService.initializeAppData();
                  await this.uiService.showToast('All data has been reset.', { color: 'success' });
                } else {
                  await this.uiService.showToast('Failed to reset all data.', { color: 'danger' });
                }
              } catch (error) {
                await this.uiService.showToast('An error occurred while resetting data.', { color: 'danger' });
                console.error(error);
              } finally {
                if (loading) {
                  await loading.dismiss();
                }
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  protected async handleLogout(): Promise<void> {
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'Sign Out',
      message: 'Are you sure you want to sign out? You will need to log in again to access your account.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Sign Out',
          role: 'destructive',
          handler: () => {
            // Dismiss the alert immediately when sign out is pressed
            alert.dismiss().then(async () => {
              let loading: HTMLIonLoadingElement | undefined;
              try {
                loading = await this.uiService.showLoading();
                const isLoggedOut = await this.authService.logout();

                if (isLoggedOut) {
                  await this.uiService.showToast('Signed out successfully.', { color: 'success' });
                } else {
                  await this.uiService.showToast('Unable to sign out. Please try again.', { color: 'danger' });
                }
              } catch (error) {
                await this.uiService.showToast('An error occurred while resetting data.', { color: 'danger' });
                console.error(error);
              } finally {
                if (loading) {
                  await loading.dismiss();
                }
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }
}
