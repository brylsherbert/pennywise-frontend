import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonList, IonItem, IonInput, IonButton, IonSpinner, IonText } from "@ionic/angular/standalone";
import { FormField, email, form, minLength, required, submit } from '@angular/forms/signals';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AuthStore } from '../../../../core/services/store/auth.store';
import { UiService } from '../../../../shared/services/ui.service';
import { AppBootstrapService } from '../../../../core/services/app-bootstrap.service';

interface LoginData {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonText,
    IonSpinner,
    IonButton,
    IonInput,
    IonItem,
    IonContent,
    FormField,
    RouterModule
  ]
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);
  private readonly appBootstrapService = inject(AppBootstrapService);
  private readonly uiService = inject(UiService);

  protected readonly _loginModel = signal<LoginData>({
    email: '',
    password: ''
  });

  protected readonly loginForm = form(this._loginModel, (schemaPath) => {
    required(schemaPath.email, { message: 'Email is required' });
    email(schemaPath.email, { message: 'Enter a valid email address' });
    required(schemaPath.password, { message: 'Password is required' });
    minLength(schemaPath.password, 8, {
      message: 'Password must be at least 8 characters',
    });
  });

  private _isSubmitting = signal<boolean>(false);

  public isSubmitting = this._isSubmitting.asReadonly();

  ionViewWillLeave(): void {
    this.loginForm().reset({
      email: '',
      password: '',
    });

    this._isSubmitting.set(false);
  }

  onSubmit(event: Event): void {
    event.preventDefault();

    submit(this.loginForm, {
      action: async () => {
        this._isSubmitting.set(true);
        try {
          const credentials = this._loginModel();

          await this.authStore.login(credentials);
          await this.appBootstrapService.initializeAppData();
          
          await this.router.navigate(['/budgets']);
        } catch (error: any) {
          this.uiService.showToast(error?.error?.error, { color: 'danger' });
        } finally {
          this._isSubmitting.set(false);
        }
      },
    });
  }
}
