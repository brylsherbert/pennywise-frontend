import { Component, computed, inject, signal } from '@angular/core';
import { email, form, FormField, minLength, required, submit } from '@angular/forms/signals';
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonText,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AppBootstrapService } from '../../../../core/services/app-bootstrap.service';
import { AuthStore } from '../../../../core/services/store/auth.store';
import { UiService } from '../../../../shared/services/ui.service';

type AuthMode = 'sign-in' | 'sign-up';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

@Component({
  selector: 'app-auth-page',
  templateUrl: './auth-page.component.html',
  styleUrls: ['./auth-page.component.scss'],
  imports: [
    FormField,
    IonButton,
    IonContent,
    IonInput,
    IonItem,
    IonLabel,
    IonSegment,
    IonSegmentButton,
    IonSpinner,
    IonText,
  ],
})
export class AuthPageComponent {
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);
  private readonly appBootstrapService = inject(AppBootstrapService);
  private readonly uiService = inject(UiService);

  private readonly _selectedMode = signal<AuthMode>(this.getInitialMode());
  private readonly _loginModel = signal<LoginData>({
    email: '',
    password: '',
  });
  private readonly _registerModel = signal<RegisterData>({
    username: '',
    email: '',
    password: '',
  });
  private readonly _isSubmitting = signal(false);

  protected readonly selectedMode = this._selectedMode.asReadonly();
  protected readonly isSubmitting = this._isSubmitting.asReadonly();
  protected readonly isSignUp = computed(() => this.selectedMode() === 'sign-up');
  protected readonly eyebrow = computed(() => (this.isSignUp() ? 'Start fresh' : 'Welcome'));
  protected readonly title = computed(() => (this.isSignUp() ? 'Create your account' : 'Sign in to PennyWise'));
  protected readonly description = computed(() =>
    this.isSignUp()
      ? 'Build your budget workspace and keep every money move organized.'
      : 'Track budgets, transactions, and goals from one calm place.',
  );
  protected readonly submitLabel = computed(() => (this.isSignUp() ? 'Create account' : 'Sign in'));
  protected readonly submittingLabel = computed(() => (this.isSignUp() ? 'Creating account...' : 'Signing in...'));
  protected readonly isSubmitDisabled = computed(() =>
    this.isSignUp() ? this.registerForm().invalid() : this.loginForm().invalid(),
  );

  protected readonly loginForm = form(this._loginModel, (schemaPath) => {
    required(schemaPath.email, { message: 'Email is required' });
    email(schemaPath.email, { message: 'Enter a valid email address' });
    required(schemaPath.password, { message: 'Password is required' });
    minLength(schemaPath.password, 8, {
      message: 'Password must be at least 8 characters',
    });
  });

  protected readonly registerForm = form(this._registerModel, (schemaPath) => {
    required(schemaPath.email, { message: 'Email is required' });
    email(schemaPath.email, { message: 'Enter a valid email address' });
    required(schemaPath.password, { message: 'Password is required' });
    minLength(schemaPath.password, 8, {
      message: 'Password must be at least 8 characters',
    });
  });

  protected onModeChange(mode: unknown): void {
    if (!this.isAuthMode(mode) || mode === this.selectedMode()) {
      return;
    }

    this._selectedMode.set(mode);
    this._isSubmitting.set(false);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();

    if (this.isSignUp()) {
      this.submitRegisterForm();
      return;
    }

    this.submitLoginForm();
  }

  private submitLoginForm(): void {
    submit(this.loginForm, {
      action: async () => {
        this._isSubmitting.set(true);

        try {
          await this.authStore.login(this._loginModel());
          await this.appBootstrapService.initializeAppData();
          await this.router.navigate(['/budgets']);
        } catch (error: unknown) {
          await this.uiService.showToast(this.getErrorMessage(error), { color: 'danger' });
        } finally {
          this._isSubmitting.set(false);
        }
      },
    });
  }

  private submitRegisterForm(): void {
    submit(this.registerForm, {
      action: async () => {
        this._isSubmitting.set(true);

        try {
          await this.authStore.register(this._registerModel());
          await this.uiService.showToast('Account created successfully.');
          this.loginForm().reset({
            email: this._registerModel().email,
            password: '',
          });
          this.registerForm().reset({
            username: '',
            email: '',
            password: '',
          });
          this._selectedMode.set('sign-in');
        } catch (error: unknown) {
          await this.uiService.showToast(this.getErrorMessage(error), { color: 'danger' });
        } finally {
          this._isSubmitting.set(false);
        }
      },
    });
  }

  private getInitialMode(): AuthMode {
    const mode = this.router.getCurrentNavigation()?.extras.state?.['authMode'];

    return this.isAuthMode(mode) ? mode : 'sign-in';
  }

  private isAuthMode(mode: unknown): mode is AuthMode {
    return mode === 'sign-in' || mode === 'sign-up';
  }

  private getErrorMessage(error: unknown): string {
    if (
      typeof error === 'object' &&
      error !== null &&
      'error' in error &&
      typeof error.error === 'object' &&
      error.error !== null &&
      'error' in error.error &&
      typeof error.error.error === 'string'
    ) {
      return error.error.error;
    }

    return 'Something went wrong. Please try again.';
  }
}
