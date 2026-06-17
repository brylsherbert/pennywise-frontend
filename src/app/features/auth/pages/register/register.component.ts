import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { email, form, FormField, minLength, required, submit, validate } from '@angular/forms/signals';
import { Router, RouterModule } from '@angular/router';
import { IonContent, IonItem, IonInput, IonText, IonButton, IonSpinner } from "@ionic/angular/standalone";
import { AuthStore } from '../../../../core/services/store/auth.store';
import { UiService } from '../../../../shared/services/ui.service';

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
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
export class RegisterComponent {
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);
  private readonly uiService = inject(UiService);

  protected readonly _registerModel = signal<RegisterData>({
    username: '',
    email: '',
    password: '',
  });

  protected readonly registerForm = form(this._registerModel, (schemaPath) => {
    required(schemaPath.email, { message: 'Email is required' });
    email(schemaPath.email, { message: 'Enter a valid email address' });
    required(schemaPath.password, { message: 'Password is required' });
    minLength(schemaPath.password, 8, {
      message: 'Password must be at least 8 characters',
    });

    // validate(schemaPath.confirmPassword, ({ value, valueOf }) => {
    //   const confirmPassword = value();
    //   const password = valueOf(schemaPath.password);
    //   if (confirmPassword !== password) {
    //     return {
    //       kind: 'passwordMismatch',
    //       message: 'Passwords do not match',
    //     };
    //   }
    //   return null;
    // });
  });

  private _isSubmitting = signal<boolean>(false);

  public isSubmitting = this._isSubmitting.asReadonly();

  ionViewWillLeave(): void {
    this.registerForm().reset({
      username: '',
      email: '',
      password: '',
    });

    this._isSubmitting.set(false);
  }

  onSubmit(event: Event): void {
    event.preventDefault();

    submit(this.registerForm, {
      action: async () => {
        this._isSubmitting.set(true);
        
        try {
          const credentials = this._registerModel();

          await this.authStore.register(credentials);
          await this.router.navigate(['/auth/login']);
        } catch (error: any) {
          this.uiService.showToast(error?.error?.error, { color: 'danger' });
        } finally {
          this._isSubmitting.set(false);
        }
      },
    });
  }
}
