import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    this.handleSplashScreen();
  }

  handleSplashScreen(): void {
    setTimeout(() => {
      void SplashScreen.hide({
        fadeOutDuration: 500,
      });
    }, 1000);
  }
}
