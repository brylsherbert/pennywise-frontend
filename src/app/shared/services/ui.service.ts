import { inject, Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class UiService {
  private toastController = inject(ToastController);
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
}
