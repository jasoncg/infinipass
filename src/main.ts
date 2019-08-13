import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
// Gesture support BEGIN
import 'hammerjs';
// Gesture support END

if (environment.production) {
  enableProdMode();
}

/*
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
*/
const bootstrap = () => {
  platformBrowserDynamic().bootstrapModule(AppModule);
};

//if (typeof window['cordova'] !== 'undefined') {
if (window.hasOwnProperty('cordova')) {
  document.addEventListener('deviceready', () => {
    bootstrap();
  }, false);
} else {
  bootstrap();
}
