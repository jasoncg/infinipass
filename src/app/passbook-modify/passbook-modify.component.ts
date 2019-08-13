import { Component, OnInit, Inject, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BookdbService, IPassBook } from '../bookdb.service';
import { ErrorStateMatcher } from '@angular/material/core';
import { PassgenService } from '../passgen.service';
// Error when invalid control is dirty, touched, or submitted.
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isRefreshed = false;
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted || this.isRefreshed));
  }
  refresh() {
    this.isRefreshed = true;
  }
}

@Component({
  selector: 'app-passbook-modify',
  templateUrl: './passbook-modify.component.html',
  styleUrls: ['./passbook-modify.component.css']
})
export class PassbookModifyComponent implements OnInit {
  visualizationCharacters = [...PassgenService.visualizationCharacters];

  passbookId: number | null = null;
  passbook: IPassBook = BookdbService.newIPassBook();
  passphraseVisible: boolean = false;

  passbookName = new FormControl('', [
    Validators.required,
    //Validators.minLength(2)
  ]);
  passphrase = new FormControl('', [
    Validators.required,
    //Validators.minLength(2)
  ]);
  visualPassphrase: string = '';

  timeoutVisualization: any = null;

  constructor(fb: FormBuilder,
    private passgen: PassgenService,
    private _bottomSheetRef: MatBottomSheetRef<PassbookModifyComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    public dialog: MatDialog,
    private router: Router,
    //public dialogRef: MatDialogRef<PassbookServiceModifyComponent>,
    //@Inject(MAT_DIALOG_DATA) public data:any,
    private bookdb: BookdbService) {

    if (data != null) {
      this.passbookId = data.passbookId;
    }
    if (this.passbookId != null) {
      //this.serviceInfo = passbooks[this.passbookId].services[this.serviceId];

      this.bookdb.getPassbookAsync(this.passbookId).subscribe(passbook => {
        this.passbook = passbook;
        this.passbookName.setValue(this.passbook.name);
        this.passphrase.setValue(this.passbook.passphrase);
        this.visualPassphrase = this.passbook.visualPassphrase;

        /*
        this.serviceName.setValue(this.serviceInfo.name);
        this.userName.setValue(this.serviceInfo.user);
        this.hasPassword = this.serviceInfo.password;
        this.hasPin = this.serviceInfo.pin;

        this.passwordLength.setValue(this.serviceInfo.passwordLength);
        this.pinLength.setValue(this.serviceInfo.pinLength);
        */
      });


    } else {
      //this.serviceSettings = fb.group({});
    }

  }

  ngOnInit() {
  }

  formIsValid(): boolean {
    return true;
  }

  generatePassphraseVisualization() {
    if (this.timeoutVisualization != null)
      clearTimeout(this.timeoutVisualization);

    this.timeoutVisualization = setTimeout(() => {
      let tvid = this.timeoutVisualization;
      this.passgen.visualizePassphrase(this.passphrase.value)
        .then((passphraseVisualization) => {

          this.visualPassphrase = passphraseVisualization;
          this.timeoutVisualization = null;
        });
    }, 1000);
  }
  onCancel() {
    this._bottomSheetRef.dismiss();
  }
  onSave() {
    
    this.passbook.name = this.passbookName.value;
    this.passbook.passphrase = this.passphrase.value;
    this.passbook.visualPassphrase = this.visualPassphrase;

    if (this.passbookId != null) {
      this.bookdb.updatePassbook(this.passbookId, this.passbook);
    } else {
      this.bookdb.createBook(this.passbook);
    }
    this._bottomSheetRef.dismiss();
  }
  popupDialog(templateRef: TemplateRef<any>, data: any) {
    this.dialog.open(templateRef, { data: data });
  }
  deletePassbook() {
    if (this.passbookId == null)
      return;

    this._bottomSheetRef.dismiss();
    this.bookdb.deletePassbook(this.passbookId);

    this.router.navigate(['about']);
  }
}
