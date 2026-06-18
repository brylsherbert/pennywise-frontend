import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { Router } from '@angular/router';
import {
  AlertController,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonModal,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, trashOutline } from 'ionicons/icons';
import { UpdateUserRequest, User } from '../../../../core/models/user.model';
import { AuthService } from '../../../../core/services/auth.service';
import { UiService } from '../../../../shared/services/ui.service';
import { createUserSignalForm, toUserFormData, UserFormData } from '../../shared/user-form.model';

@Component({
  selector: 'app-user-edit-modal',
  templateUrl: './user-edit-modal.component.html',
  styleUrls: ['./user-edit-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonItem,
    IonInput,
    IonText,
    IonSpinner,
  ],
})
export class UserEditModalComponent {
  private readonly authService = inject(AuthService);
  private readonly uiService = inject(UiService);
  private readonly alertController = inject(AlertController);
  private readonly router = inject(Router);

  public readonly isOpen = input(false);
  public readonly user = input.required<User>();
  public readonly dismissed = output<void>();

  private readonly modal = viewChild(IonModal);
  private readonly _formModel = signal<UserFormData>({
    username: '',
    password: '',
    confirmPassword: '',
  });
  private readonly _isSubmitting = signal(false);
  private readonly _isDeleting = signal(false);

  protected readonly isSubmitting = this._isSubmitting.asReadonly();
  protected readonly isDeleting = this._isDeleting.asReadonly();
  protected readonly userForm: any = createUserSignalForm(this._formModel);
  protected readonly passwordsMismatch = computed(() => {
    const model = this._formModel();
    return !!model.confirmPassword && model.password !== model.confirmPassword;
  });
  protected readonly isSubmitDisabled = computed(
    () => this.userForm().invalid() || this.passwordsMismatch(),
  );
  protected readonly isActionDisabled = computed(
    () => this.isSubmitting() || this.isDeleting(),
  );

  constructor() {
    addIcons({ closeOutline, trashOutline });

    effect(() => {
      this._formModel.set(toUserFormData(this.user()));
      this.userForm().reset();
      this._isSubmitting.set(false);
      this._isDeleting.set(false);
    });
  }

  protected onModalDismiss(): void {
    this._isSubmitting.set(false);
    this._isDeleting.set(false);
    this.dismissed.emit();
  }

  protected async closeModal(): Promise<void> {
    await this.modal()?.dismiss();
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();

    this._isSubmitting.set(true);

    try {
      const isUpdated = await this.authService.updateUser(this.toUpdateRequest());

      if (isUpdated) {
        await this.uiService.showToast('Profile updated successfully', { color: 'success' });
        await this.closeModal();
        return;
      }

      await this.uiService.showToast('Failed to update profile', { color: 'danger' });
    } finally {
      this._isSubmitting.set(false);
    }
  }

  protected async onDelete(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete Account',
      message: 'Are you sure you want to delete your account? This action cannot be undone.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            void this.confirmDelete();
          },
        },
      ],
    });

    await alert.present();
  }

  private async confirmDelete(): Promise<void> {
    this._isDeleting.set(true);

    try {
      const isDeleted = await this.authService.deleteUser();

      if (isDeleted) {
        await this.uiService.showToast('Account deleted successfully', { color: 'success' });
        await this.closeModal();
        await this.router.navigate(['/auth']);
        return;
      }

      await this.uiService.showToast('Failed to delete account', { color: 'danger' });
    } finally {
      this._isDeleting.set(false);
    }
  }

  private toUpdateRequest(): UpdateUserRequest {
    const model = this._formModel();

    return {
      username: model.username.trim(),
      password: model.password,
      confirmPassword: model.confirmPassword,
    };
  }
}
