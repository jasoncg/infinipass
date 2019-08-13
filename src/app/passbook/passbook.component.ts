import { Component, OnInit } from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { BookdbService, IPassBook, IService } from '../bookdb.service';
/*import { PassbookServiceItemComponent } from '../passbook-service-item/passbook-service-item.component';*/
//import { passbooks } from '../passbooks';
import { PassbookServiceModifyComponent } from '../passbook-service-modify/passbook-service-modify.component';
import { Subscription, Subject, Observable } from 'rxjs';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { PassbookModifyComponent } from '../passbook-modify/passbook-modify.component';

enum PassphraseState {
  Hidden,
  Show,
  Modify
}
@Component({
  selector: 'app-passbook',
  templateUrl: './passbook.component.html',
  styleUrls: ['./passbook.component.css']
})
export class PassbookComponent implements OnInit {
  PassphraseState: typeof PassphraseState = PassphraseState;

  services: IService[] = [];
  passbookSubscription: Subject<IPassBook> | null= null;
  servicesSubscription: Subject<IService[]>| null = null;

  passbook: IPassBook = <IPassBook>{ };
  passbookId: number | null = null;
  serviceId: number | null = null;
  passphraseText:string='';

  changePassphase: PassphraseState = PassphraseState.Hidden;

  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private router: Router,
    private _bottomSheet: MatBottomSheet,
    private bookdb: BookdbService
  ) { }
  ngOnInit() {
    //this.passbooksSubscription=this.bookdb.getPassbooksAsync().subscribe(passbooks => this.passbooks = passbooks);

    this.route.paramMap.subscribe(params => {
      //console.log('passbook.component ROUTE CHANGED', this.passbookId, '=>', params.get('passbookId'));

      //console.log(params.getAll("passbookId"));
      //console.log(params.keys);
      let passbookIdS: string | null = params.get('passbookId');
      let serviceIdS: string  | null = params.get('serviceId');
      

      if (passbookIdS != null) {
        if (this.passbookId == parseInt(passbookIdS)) {
          return;
        }
        this.passbookId = parseInt(passbookIdS);


        if (this.passbookSubscription != null) {
          //console.log('***** passbookSubscription unsubscribe');
          //this.passbookSubscription.unsubscribe();
          this.passbookSubscription.complete();
        }
        if (this.servicesSubscription != null) {
          //console.log('***** servicesSubscription unsubscribe');
          //this.servicesSubscription.unsubscribe();
          this.servicesSubscription.complete();
        }
        if (this.passbookId != null) {
          this.passbookSubscription = this.bookdb.getPassbookAsync(this.passbookId);
          this.passbookSubscription.subscribe(passbook => {
            this.passbook = passbook;
            //console.log('Passbook', passbook);
            //console.log('Services for this passbook[', this.passbookId, ']: ', this.services);
            if (this.passbook != null) {
              this.passphraseText = this.passbook.passphrase;
            }
          });
          this.servicesSubscription = this.bookdb.getServicesAsync(this.passbookId);
          this.servicesSubscription.subscribe(services => {
            this.services = services;
            //console.log('Services for this passbook[', this.passbookId, ']: ', this.services);

          });
        }

      } else {
        this.passbookId = null;
        //Route to about page
        this.router.navigate(['about']);
        return;
      }


      if (serviceIdS != null) {
        //Display the specified service
        this.serviceId = parseInt(serviceIdS);

      } else {
        this.serviceId = null;
      }

      //this.passbook = passbooks[+params.get('passbookId')];
    });
  }
  ngOnDestroy() {

    if (this.passbookSubscription != null) {
      this.passbookSubscription.complete();
    }
    if (this.servicesSubscription != null) {
      this.servicesSubscription.complete();
    }
  }

  passphraseEditShow() {
    this.passphraseText = this.passbook.passphrase;
    this.changePassphase = PassphraseState.Modify;
  }
  passphraseEditCancel() {
    this.passphraseText = this.passbook.passphrase;
    this.changePassphase = PassphraseState.Show;
  }
  passphraseEditSave() {
    this.passbook.passphrase = this.passphraseText;
    if (this.passbookId == null) {
      console.error('PassbookId is null');
      return;
    }
    this.bookdb.updatePassbook(this.passbookId, this.passbook);

    //this.passbook = passbooks[+this.passbookId];

    //console.log(this.passbook, this.passphraseText);
    this.changePassphase = PassphraseState.Show;
  }
  modifyPassbook() {
    if (this.passbookId == null) {
      //console.error('PassbookId is null');
      return;
    }
    let bs = this._bottomSheet.open(PassbookModifyComponent, {
      panelClass: 'wide-panel',
      data: { passbookId: this.passbookId }
    });
    bs.afterDismissed().subscribe(result => {
      //console.log('The panel was closed', result);
    });
  }
  addNewService() {
    if (this.passbookId == null) {
      //console.error('PassbookId is null');
      return;
    }
    let bs = this._bottomSheet.open(PassbookServiceModifyComponent, {
      panelClass: 'wide-panel',
      data: { passbookId: this.passbookId }
    });
    bs.afterDismissed().subscribe(result => {
      console.log('The panel was closed', result);
    });

  }
  styleColor(colorId: number | null): string {
    if (colorId != null)
      switch (colorId) {
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
  styleBackgroundColor(colorId: number | null): string {
    if (colorId!=null)
    switch (colorId) {
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
  selectService(serviceIndex: number) {
    console.log('selectService', serviceIndex);
  }
}
