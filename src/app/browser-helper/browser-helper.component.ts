import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookdbService, IService, IPassBook } from '../bookdb.service';
import { Subject } from 'rxjs';
import { PassbookServiceModifyComponent } from '../passbook-service-modify/passbook-service-modify.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { PassbookModifyComponent } from '../passbook-modify/passbook-modify.component';

@Component({
  selector: 'app-browser-helper',
  templateUrl: './browser-helper.component.html',
  styleUrls: ['./browser-helper.component.css']
})
export class BrowserHelperComponent implements OnInit {
  inExtenstion: boolean = false;

  tabInfo: any | null = null;
  tabUrl: URL | null = null;

  passbooksSub: Subject<IPassBook[]> | null = null;
  passbooks: IPassBook[] = [];

  servicesSub: Subject<IService[]> | null = null;
  services: IService[] = [];


  constructor(
    private _bottomSheet: MatBottomSheet,
    private router: Router,
    private bookdb: BookdbService
  ) {
  }

  ngOnInit() {
    this.inExtenstion = (window.hasOwnProperty('chrome') && (window.chrome.hasOwnProperty('browserAction'))) ? true : false;

    console.log('browser-helper chrome', window.chrome);
    console.log('browser-helper browser', window.browser);
    console.log('browser-helper this.inExtenstion', this.inExtenstion);
    this.passbooksSub = this.bookdb.getPassbooksAsync();

    this.passbooksSub.subscribe(passbooks => {
      this.passbooks = passbooks;
    });

    if (this.inExtenstion == false) {
      //this.router.navigate(['/']);
      //return;
      this.tabUrl = new URL('https://google.com');
      this.servicesSub = this.bookdb.getServicesByNameAsync(this.tabUrl.hostname);
      this.servicesSub.subscribe((services) => {
        this.services = services;
      });
    } else {

      window.chrome.tabs.query({ currentWindow: true, active: true }, (tabs: any[]) => {
        console.log('Got tab info', tabs);
        this.tabInfo = tabs[0];
        this.tabUrl = new URL(this.tabInfo.url);
        console.log(tabs[0]);

        this.servicesSub = this.bookdb.getServicesByNameAsync(this.tabUrl.hostname);
        this.servicesSub.subscribe((services) => {
          this.services = services;
        });
      });
    }

  }
  ngOnDestroy() {
    if (this.servicesSub != null) {
      this.servicesSub.complete();
      
    }
  }

  addNewService() {
    let bs = this._bottomSheet.open(PassbookServiceModifyComponent, {
      panelClass: 'wide-panel',
      data: {
        passbookId: null,
        serviceNamePrefill: ((this.tabUrl != null && this.tabUrl.hostname != null) ? this.tabUrl.hostname : null)
      }
    });
    bs.afterDismissed().subscribe(result => {

    });
  }
  addNewPassbook() {
    let bs = this._bottomSheet.open(PassbookModifyComponent, {
      panelClass: 'wide-panel',
      data: {
      }
    });

    bs.afterDismissed().subscribe(result => {

    });
  }
}
