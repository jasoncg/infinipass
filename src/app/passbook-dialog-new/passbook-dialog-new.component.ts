import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormControl, FormGroupDirective, NgForm, Validators, ValidationErrors } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';


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
  selector: 'app-passbook-dialog-new',
  templateUrl: './passbook-dialog-new.component.html',
  styleUrls: ['./passbook-dialog-new.component.css']
})
export class PassbookDialogNewComponent implements OnInit {
  //passbookName: string = '';
  //passphrase: string = '';
  //passphraseConfirm: string = '';

  valuesMatchValidator(matchesControl: FormControl): any {
    return (control: FormControl) => {

      if (control.value == matchesControl.value) {
        return null;
      }
      return {
        'values-must-match': {
          passphraseConfirm: control.value
        }
      };
    };

  }
  passbookOptions: FormGroup;

  passbookName = new FormControl('', [
    Validators.required,
    //Validators.minLength(2)
  ]);
  storePassphrase = new FormControl(true, [
  ]);

  passphrase = new FormControl('', [
    Validators.required,
    //Validators.minLength(3)
  ]);
  passphraseConfirm = new FormControl('', [
    this.valuesMatchValidator(this.passphrase)
  ]);

  errorStateMatcher = new MyErrorStateMatcher();

  constructor(fb: FormBuilder,
    public dialogRef: MatDialogRef<PassbookDialogNewComponent>,
    @Inject(MAT_DIALOG_DATA) public data:any) {
    this.passbookOptions = fb.group({});
  }

  ngOnInit() {
  }


  formIsValid(): boolean {
    this.passbookName.updateValueAndValidity();
    this.passphrase.updateValueAndValidity();
    this.passphraseConfirm.updateValueAndValidity();

    if (!this.passbookName.valid) return false;
    if (!this.passphrase.valid) return false;
    if (!this.passphraseConfirm.valid) return false;

    return true;
  }

  onCancel(): void {
    this.dialogRef.close();
  }
  onCreate(): void {
    if (!this.formIsValid())
      return;

    /*if (this.passbookName.errors!=null&&this.passbookName.errors.length > 0)
      return;
    if (this.passphrase.errors != null &&this.passphrase.errors.length > 0)
      return;
    if (this.passphraseConfirm.errors != null &&this.passphraseConfirm.errors.length > 0)
      return;*/

    this.dialogRef.close({
      'name': this.passbookName.value,
      'passphrase': this.passphrase.value
    });
  }
}
