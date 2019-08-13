import { Component, OnInit, Inject, TemplateRef, Input } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormControl, FormGroupDirective, NgForm, Validators, ValidationErrors } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

import { BookdbService, IPassBook, IService } from '../bookdb.service';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
//import { passbooks } from '../passbooks';

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
  selector: 'app-passbook-service-modify',
  templateUrl: './passbook-service-modify.component.html',
  styleUrls: ['./passbook-service-modify.component.css']
})
export class PassbookServiceModifyComponent {
  passbookId: number | undefined;
  serviceId: number | null = null;

  passbook: IPassBook|undefined;
  passbooksAll: IPassBook[] = [];

  advancedToggle: boolean = false;

  serviceInfo: IService = {
    id: null, passbookId:null,
    name: '', 'user': '', count: 0,
    password: true, pin: false,
    passwordLength: 8, pinLength: 4,
    color: null, icon: null,
    customStrings:[]
  };
  serviceNamePrefill: string | null = null;
  //serviceSettings: FormGroup;

  serviceName = new FormControl('', [
    Validators.required,
    //Validators.minLength(2)
  ]);
  userName = new FormControl('', [
  ]);

  hasPassword: boolean = true;
  hasPin: boolean = false;
  passwordLength = new FormControl(8, [
  ]);
  pinLength = new FormControl(4, [
  ]);

  constructor(fb: FormBuilder,
    private _bottomSheetRef: MatBottomSheetRef<PassbookServiceModifyComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    public dialog: MatDialog,
    private router: Router,
    //public dialogRef: MatDialogRef<PassbookServiceModifyComponent>,
    //@Inject(MAT_DIALOG_DATA) public data:any,
    private bookdb: BookdbService) {
    
    if (data != null) {
      this.passbookId = data.passbookId;
      this.serviceId = data.serviceId;
      this.serviceNamePrefill = data.serviceNamePrefill;
      if (this.serviceNamePrefill != null) {
        this.serviceName.setValue(this.serviceNamePrefill);
        //this.serviceName.disable();
      }
    }
    this.bookdb.passbooksGetAll().then(passbooks => {
      this.passbooksAll = passbooks;
      if (!this.passbookId) {
        if (this.passbooksAll.length == 0) {
          //Create a new empty passbook
          /*this.passbook = BookdbService.newIPassBook();
          this.passbook.name = 'Default';
          this.passbook.p
          this.bookdb.createBook()*/
        } else
        if (this.passbooksAll.length == 1) {
          this.passbookId = this.passbooksAll[0].id;
        } else {
          //todo: show Pick a passbook
          this.passbookId = this.passbooksAll[0].id;
        }
      }

      /*if (!this.passbookId) {
        //Get the default passbook
  
        console.error('Passbook ID is required');
        return;
      }*/
      if (this.passbookId!=null)
      this.bookdb.getPassbookInfo(this.passbookId).then((pb) => {
        this.passbook = pb;
        this.passwordLength.setValue(pb.defaultPasswordLength);
        this.pinLength.setValue(pb.defaultPinLength);

        if (this.serviceId != null) {
          //this.serviceInfo = passbooks[this.passbookId].services[this.serviceId];

          this.bookdb.getServiceAsync(this.serviceId).subscribe(service => {
            this.serviceInfo = service;

            this.serviceName.setValue(this.serviceInfo.name);
            this.userName.setValue(this.serviceInfo.user);
            this.hasPassword = this.serviceInfo.password;
            this.hasPin = this.serviceInfo.pin;

            this.passwordLength.setValue(this.serviceInfo.passwordLength);
            this.pinLength.setValue(this.serviceInfo.pinLength);

          });
        }

      });

    });
  }

  ngOnInit() {
  }
  versionDecrement() {
    this.serviceInfo.count--;
    if (this.serviceInfo.count < 0)
      this.serviceInfo.count = 0;
  }
  versionIncrement() {
    this.serviceInfo.count++;
  }
  setColor(colorId:number|null) {
    this.serviceInfo.color = colorId;
  }
  colorIdToStyle(colorId: number | null):string {
    switch (colorId) {
      case 1:
        return "background-color:black; color:white;";
      case 2:
        return "background-color:red; color:white;";
      case 3:
        return "background-color:green; color:white;";
      case 4:
        return "background-color:blue; color:white;";
      case 0:
      default:
        return "background-color:white; color:black;";
    }
  }
  formIsValid(): boolean {
    return true;
    /*
    this.passbookName.updateValueAndValidity();
    this.passphrase.updateValueAndValidity();
    this.passphraseConfirm.updateValueAndValidity();

    if (!this.passbookName.valid) return false;
    if (!this.passphrase.valid) return false;
    if (!this.passphraseConfirm.valid) return false;

    return true;*/
  }
  onCancel(): void {
    this._bottomSheetRef.dismiss();
    //this.dialogRef.close();
  }
  onSave(): void {
    if (this.passbookId == null) {
      console.error('PassbookId not set');
      return;
    }
    //if (!this.formIsValid())
    //  return;
    this.serviceInfo.name     = this.serviceName.value;
    this.serviceInfo.user     = this.userName.value;
    this.serviceInfo.password = this.hasPassword;
    this.serviceInfo.pin      = this.hasPin;
    this.serviceInfo.passwordLength = this.passwordLength.value;
    this.serviceInfo.pinLength      = this.pinLength.value;

    if (this.serviceId == null) {
      //Create the service
      this.bookdb.createService(this.passbookId, this.serviceInfo);
    } else {
      //Update the service
      this.bookdb.updateService(this.serviceId, this.serviceInfo);
    }

    //this.dialogRef.close({ 'name': this.passbookName.value, 'passphrase': this.passphrase.value });
    //this.dialogRef.close();
    this._bottomSheetRef.dismiss();
  }
  popupDialog(templateRef: TemplateRef<any>, data:any) {
    console.log('Open', templateRef);
    this.dialog.open(templateRef, { data: data});
  }
  deleteService() {
    if (this.serviceId == null)
      return;

    this._bottomSheetRef.dismiss();
    this.bookdb.deleteService(this.serviceId);

    //this.router.navigate(['passbooks', this.passbookId]);
  }
}
