import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

//Angular Material BEGIN
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTreeModule } from '@angular/material/tree';

//Angular Material END

import { SidebarComponent } from './sidebar/sidebar.component';
import { PassbookComponent } from './passbook/passbook.component';
import { PassbookServiceItemComponent } from './passbook-service-item/passbook-service-item.component';
import { PassbookDialogNewComponent } from './passbook-dialog-new/passbook-dialog-new.component';
import { PassbookServiceModifyComponent } from './passbook-service-modify/passbook-service-modify.component';
import { AboutPageComponent } from './about-page/about-page.component';
import { QuickGenerateComponent } from './quick-generate/quick-generate.component';
import { MatRippleModule } from '@angular/material/core';
import { PassbookModifyComponent } from './passbook-modify/passbook-modify.component';
import { RandomAnimatedTextComponent } from './random-animated-text/random-animated-text.component';
import { ImportExportComponent } from './import-export/import-export.component';
import { BrowserHelperComponent } from './browser-helper/browser-helper.component';
import { SettingsComponent } from './settings/settings.component';


@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    PassbookComponent,
    PassbookServiceItemComponent,
    PassbookDialogNewComponent,
    PassbookServiceModifyComponent,
    AboutPageComponent,
    QuickGenerateComponent,
    PassbookModifyComponent,
    RandomAnimatedTextComponent,
    ImportExportComponent,
    BrowserHelperComponent,
    SettingsComponent
  ],
  entryComponents: [
    PassbookDialogNewComponent,
    PassbookServiceModifyComponent,
    PassbookModifyComponent,
    RandomAnimatedTextComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,

    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    //Angular Material BEGIN
    MatButtonModule, MatCheckboxModule,
    MatToolbarModule, MatIconModule,
    MatSidenavModule, MatListModule,
    MatFormFieldModule, MatInputModule,
    MatCardModule, MatExpansionModule,
    MatGridListModule, MatSnackBarModule,
    MatDialogModule, MatSlideToggleModule,
    MatProgressSpinnerModule, MatProgressBarModule,
    MatRippleModule, MatBottomSheetModule,
    MatTabsModule, MatTreeModule
    //Angular Material END
  ],
  exports: [
    //Angular Material BEGIN
    MatButtonModule, MatCheckboxModule,
    MatToolbarModule, MatIconModule,
    MatSidenavModule, MatListModule,
    MatFormFieldModule, MatInputModule,
    MatCardModule, MatExpansionModule,
    MatGridListModule, MatSnackBarModule,
    MatDialogModule, MatSlideToggleModule,
    MatProgressSpinnerModule, MatProgressBarModule,
    MatRippleModule, MatBottomSheetModule,
    MatTabsModule, MatTreeModule
    //Angular Material END
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
