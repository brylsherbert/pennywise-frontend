import { inject, Injectable } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class UiService {
  private toastController = inject(ToastController);
  private loadingController = inject(LoadingController);

  async showToast(
    message: string,
    options?: {
      duration?: number;
      color?: string;
      position?: 'top' | 'bottom' | 'middle';
      buttons?: any[];
      header?: string;
    }
  ): Promise<void> {
    const toast = await this.toastController.create({
      message: message,
      duration: options?.duration ?? 2000,
      color: options?.color ?? 'primary',
      position: options?.position ?? 'bottom',
      buttons: options?.buttons,
      header: options?.header,
    });
    await toast.present();
  }

  async showLoading(
    message?: string,
    options?: {
      duration?: number;
      spinner?: 'lines' | 'lines-small' | 'crescent' | 'dots' | 'bubbles' | 'circles' | null;
      translucent?: boolean;
      cssClass?: string | string[];
      backdropDismiss?: boolean;
    }
  ): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingController.create({
      mode: 'ios',
      message: message,
      duration: options?.duration,
      spinner: options?.spinner ?? 'crescent',
      translucent: options?.translucent ?? true,
      cssClass: options?.cssClass,
      backdropDismiss: options?.backdropDismiss ?? false
    });
    await loading.present();
    return loading;
  }
}
