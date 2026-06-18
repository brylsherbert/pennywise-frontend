import { inject, Injectable } from '@angular/core';
import { AuthStore } from '../services/store/auth.store';
import { Router } from '@angular/router';
import { AppBootstrapService } from '../services/app-bootstrap.service';

@Injectable({
  providedIn: 'root',
})
export class AppInitializer {
  private readonly router = inject(Router);
  private authStore = inject(AuthStore);
  private readonly appBootstrapService = inject(AppBootstrapService);

  async initializeApp(): Promise<void> {
    this.authStore.initializeAuthDataFromStorage();

    if (!this.authStore.isAuthenticated()) {
      await this.router.navigate(['/auth']);
      return;
    }

    await this.appBootstrapService.initializeAppData();
  }
}