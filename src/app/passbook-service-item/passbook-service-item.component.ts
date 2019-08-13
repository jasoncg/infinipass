import { Component, OnInit, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, Subject, of, from, Subscription, Subscriber } from 'rxjs';


import { BookdbService, IPassBook, IService } from '../bookdb.service';
import { PassgenService, IHash, IPasswordSettings } from '../passgen.service';
//import { passbooks } from '../passbooks';

//import * as asmcrypto from './asmcrypto.all.js'
//import * from './asmcrypto.all.js'

import { PassbookServiceModifyComponent } from '../passbook-service-modify/passbook-service-modify.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { PassbookComponent } from '../passbook/passbook.component';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-passbook-service-item',
  templateUrl: './passbook-service-item.component.html',
  styleUrls: ['./passbook-service-item.component.css']
})
export class PassbookServiceItemComponent implements OnInit {
  @Input()
  asTile: boolean = false;
  @Input()
  passbookComponent: PassbookComponent|null = null;

  @Input()
  passbookId: number = -1;
  @Input()
  serviceId: number = -1;

  hash: IHash | null = null;

  private _passbook: IPassBook | null = null;
  @Input('passbook')
  set passbook(passbook: IPassBook | null) {
    this._passbook = passbook;
    this.refresh();
  }
  get passbook(): IPassBook|null {
    return this._passbook;
  }

  private _service: IService | null = null;
  @Input('service')
  set service(service: IService | null) {
    this._service = service;
    this.refresh();
  }
  get service(): IService | null {
    return this._service;
  }

  opassbook: Subject<IPassBook>|null=null;
  oservice: Subject<IService> | null = null;

  passbookSubscription: Subscription | null = null;
  servicesSubscription: Subscription | null = null;
  serviceRemovedSubscription: Subscription | null = null;

  modifyMode: boolean = false;

  password: string='';
  pin: string='';

  passwordVisible: boolean = false;
  pinVisible: boolean = false;

  textEncoder: TextEncoder = new TextEncoder();
  textDecoder: TextDecoder = new TextDecoder();
  validCharacters = [
    { name:'lowercase',  characters: 'abcdefghijklmnopqrstuvwxyz' },
    { name: 'uppercase', characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' },
    { name: 'numbers',   characters:  '0123456789' },
    { name: 'special',   characters: '~!@#$%^&*()_+' }
  ];

  constructor(
    private route: ActivatedRoute,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
    private _bottomSheet: MatBottomSheet,
    private router: Router,
    private bookdb: BookdbService,
    private passgen: PassgenService) {

  }
  showPassword() {
    this.refresh();
    this.passwordVisible = true;
  }
  showPin() {
    this.refresh();
    this.pinVisible = true;
  }
  ngOnDestroy() {
    if (this.passbookSubscription!=null)
      this.passbookSubscription.unsubscribe();
    if (this.servicesSubscription!=null)
      this.servicesSubscription.unsubscribe();
    if (this.serviceRemovedSubscription != null)
      this.serviceRemovedSubscription.unsubscribe();

    if (this.opassbook != null)
    this.opassbook.complete();
    if (this.oservice != null)
    this.oservice.complete();
  }
  ngOnInit() {
    //this.passbook = passbooks[this.passbookId];
    //this.service = passbooks[this.passbookId].services[this.serviceId];
    //console.log('PassbookServiceItem serviceId', this.serviceId, typeof (this.serviceId));
    //Track changes to the passbook in case the passphrase changes or some other global setting
    if (this.passbook == null) {
      this.opassbook = this.bookdb.getPassbookAsync(this.passbookId);
      this.passbookSubscription = this.opassbook.subscribe(passbook => {
        this.passbook = passbook;
        this.refresh();
      });
    }
    if (this.service == null) {
      this.oservice = this.bookdb.getServiceAsync(this.serviceId);
      this.servicesSubscription = this.oservice.subscribe(service => {
        this.service = service;
        if (this.service == null) {
          this.router.navigate(['passbooks', this.passbookId]);
          return;
        }

        //console.log('Service updated', service);
        this.refresh();
      });
    }
    if (this.route.component == PassbookServiceItemComponent ||
      this.route.component == PassbookComponent) {
      if (this.serviceId != null) {
        this.serviceRemovedSubscription = this.bookdb.serviceRemoved.subscribe(service => {
          if (service.id == this.serviceId) {
            this.router.navigate(['passbooks', this.passbookId]);
          }
        });
      }
    }
  }
  async refresh() {
    await this.generateHash();
    if (this.hash != null) {
      this.password = await this.generatePassword();
      this.pin = await this.generatePin();
    }
  }
  colorIdToStyle(colorId:number) {
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
  styleBackgroundColor():string {
    if(this.service!=null)
    switch (this.service.color) {
      case 1:
        return "black";
      case 2:
        return "red";
      case 3:
        return "green";
      case 4:
        return "blue";
      case 0:
      default:
        break;
      }
    return "white";
  }
  styleColor():string {
    if (this.service != null)
    switch (this.service.color) {
      case 1:
        return "white";
      case 2:
        return "white";
      case 3:
        return "white";
      case 4:
        return "white";
      case 0:
      default:
        break;
      }
    return "black";
  }
  /// Generates a hash and RNG seed using the passbook and service information
  async generateHash():Promise<IHash|null> {
    if (this.passbook == null ||
        this.service == null) {
      this.hash = null;
      return null;
    }
    //this.hash = this.passgen.generateHash(this.passbook.passphrase, this.service.name, this.service.user, this.service.count);
    let serviceName = this.service.name;
    let serviceUser = this.service.user;

    if (!this.passbook.caseSensitiveServiceData) {
      serviceName = serviceName.toLowerCase();
      serviceUser = serviceUser.toLowerCase();
    }

    this.hash = await this.passgen.generateHashWebCrypto(
                          this.passbook.passphrase,
                          serviceName,
                          serviceUser,
                          this.service.count);

    return this.hash;
  }

  /// Generates a password from the hash/RNG seed
  async generatePassword() :Promise<string> {
    if (this.service == null || this.passbook==null) {
      return '';
    }

    if (this.hash == null)
      await this.generateHash();

    if (this.hash == null)
      return '';


    let password = this.passgen.generatePassword(
      this.hash,
      PassgenService.getPasswordSettings(this.passbook, this.service));

    return password;

  }

  /// Generates a PIN from the hash/RNG seed
  async generatePin(): Promise<string> {
    if (this.service == null) {
      return '';
    }

    if (this.hash == null)
      await this.generateHash();

    if (this.hash == null)
      return '';

    let pin = this.passgen.generatePin(this.hash, this.service.pinLength);

    return pin;
  }


  /// Sets the clipboard with the specified value.
  /// If message is provided, displays the message.
  copyToClipboard(val: string, message: string | null = null) {
    // from https://stackoverflow.com/questions/49102724/angular-5-copy-to-clipboard
    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);

    if (message != null) {
      this._snackBar.open(message, '', {
        duration: 5000
      });
    }
  }
  copyToClipboardPassword() {
    this.refresh();
    if (this.service == null) {

      return;
    }
    let message = this.service.name + ' password copied to clipboard';
    this.copyToClipboard(this.password);

    this._snackBar.open(message, 'Show', {
      duration: 50000,
      panelClass: 'show-button',
    }).onAction().subscribe(msg => {
      this._snackBar.open(this.password, 'Dismiss', {
        panelClass: 'large-text'
      });
    });
  }
  copyToClipboardPin() {
    this.refresh();
    if (this.service == null) {

      return;
    }
    let message = this.service.name + ' PIN copied to clipboard';

    this.copyToClipboard(this.pin);

    this._snackBar.open(message, 'Show', {
      duration: 5000,
      panelClass: 'show-button',
    }).onAction().subscribe(msg => {
      this._snackBar.open(this.pin, 'Dismiss', {
        panelClass: 'large-text'
      });
    });
  }

  timeoutEncryptStringRefresh: any = null;
  encryptCustomString: string = '';
  encryptCustomStringResult: string = '';
  encryptCustomStringResultVisible: boolean = false;


  generateCustomEncryptedStringRefresh() {
    if (this.timeoutEncryptStringRefresh != null)
      clearTimeout(this.timeoutEncryptStringRefresh);

    this.timeoutEncryptStringRefresh = setTimeout(() => {
      let tvid = this.timeoutEncryptStringRefresh;
      let str = this.encryptCustomString;
      str = str.toLocaleLowerCase().replace(/ /g, '');
      //console.log(this.encryptCustomString, ' mapped to', str);

      this.generateCustomEncryptedString(str)
        .then((result) => {
          //console.log('RESULT:', result);
          this.encryptCustomStringResult = result;
          this.timeoutEncryptStringRefresh = null;
        });
    }, 1000);
  }

  async generateCustomEncryptedString(text: string): Promise<string>  {

    if (this.service == null || this.passbook == null) {
      return '';
    }
    //this.hash = this.passgen.generateHash(this.passbook.passphrase, this.service.name, this.service.user, this.service.count);
    let serviceName = this.service.name;
    let serviceUser = this.service.user;

    if (!this.passbook.caseSensitiveServiceData) {
      serviceName = serviceName.toLowerCase();
      serviceUser = serviceUser.toLowerCase();
    }

    let hash = await this.passgen.generateHashWebCrypto(
      this.passbook.passphrase,
      serviceName,
      serviceUser+":"+text,
      0);
    
    if (hash == null)
      return '';

    let password = this.passgen.generatePassword(
      hash,
      PassgenService.getPasswordSettings(this.passbook, this.service));

    return password;
  }
  copyToClipboardEncryptCustomStringResult() {
    this.refresh();
    if (this.service == null) {

      return;
    }
    let message = this.service.name + ' encrypted custom string copied to clipboard';
    this.copyToClipboard(this.encryptCustomStringResult);

    this._snackBar.open(message, 'Show', {
      duration: 50000,
      panelClass: 'show-button',
    }).onAction().subscribe(msg => {
      this._snackBar.open(this.encryptCustomStringResult, 'Dismiss', {
        panelClass: 'large-text'
      });
    });
  }
  modifyService() {
    let bs = this._bottomSheet.open(PassbookServiceModifyComponent, {
      panelClass: 'wide-panel',
      data: { passbookId: this.passbookId, serviceId: this.serviceId }
    });
    /*bs.afterDismissed().subscribe(result => {
      console.log('The panel was closed', result);
    });*/
  }
}
