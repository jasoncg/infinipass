import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PassbookComponent } from './passbook/passbook.component';
import { AboutPageComponent } from './about-page/about-page.component';
import { QuickGenerateComponent } from './quick-generate/quick-generate.component';
import { ImportExportComponent } from './import-export/import-export.component';
import { BrowserHelperComponent } from './browser-helper/browser-helper.component';
import { SettingsComponent } from './settings/settings.component';

declare global {
  interface Window {
    chrome: any|null;
  }
  interface browser {
    tabs: any | null;
  }
}

const routes: Routes = [
  { path: '', component: PassbookComponent },
  { path: 'about', component: AboutPageComponent },
  { path: 'quick', component: QuickGenerateComponent },
  { path: 'passbooks/:passbookId', component: PassbookComponent },
  { path: 'passbooks/:passbookId/:serviceId', component: PassbookComponent },

  { path: 'import-export', component: ImportExportComponent },
  { path: 'browser-helper', component: BrowserHelperComponent },
  { path: 'settings', component: SettingsComponent },


  { path: '**', component: PassbookComponent, pathMatch:'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: (window.hasOwnProperty('chrome') && (window.chrome.hasOwnProperty('browserAction')))?true:false })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
