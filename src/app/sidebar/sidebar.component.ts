import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, ParamMap } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';

import { BookdbService, IPassBook } from '../bookdb.service';
//import { passbooks } from '../passbooks';
import { PassbookDialogNewComponent } from '../passbook-dialog-new/passbook-dialog-new.component';
import { PassbookModifyComponent } from '../passbook-modify/passbook-modify.component';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  passbookId:number|null=null;
  passbooks: IPassBook[]=[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private _bottomSheet: MatBottomSheet,
    private bookdb: BookdbService
  ) { }

  ngOnInit() {

    //console.log(this.paramMap.keys);
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        /*console.log("Sidebar event", event,
          this.router.routerState.snapshot.root.queryParamMap.keys,
          this.route.snapshot.paramMap.keys,
          this.route.snapshot.params['passbookId'],
          this.route.snapshot.queryParams['passbookId']);*/
      }
    });
    /*
    this.route.params.subscribe(params => {
      console.log("Sidebar params", params);
    });
    this.route.queryParams.subscribe(params => {
      console.log("Sidebar queryParams", params);
    });*/
    this.route.queryParamMap.subscribe(params => {
      let pbids:string|null = params.get('passbookId');
      if (pbids!=null) {
        this.passbookId = parseInt(pbids);
      } else {
        this.passbookId = null;
      }
      //console.log("qpm Sidebar hit", this.passbookId);
    });
    this.route.paramMap.subscribe(params => {
      let pbids: string | null = params.get('passbookId');
      if (pbids != null) {
        this.passbookId = parseInt(pbids);
      } else {
        this.passbookId = null;
      }
      //console.log("Sidebar hit", this.passbookId, params.keys);
    });

    this.bookdb.getPassbooksAsync().subscribe(passbooks => {
      passbooks.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
      this.passbooks = passbooks;
      //console.log('Sidebar: ', this.passbooks);
    });
  }
  openDialogNewBook() {
    let bs = this._bottomSheet.open(PassbookModifyComponent, {
      panelClass: 'wide-panel',
      data: { }
    });
    /*bs.afterDismissed().subscribe(result => {
      console.log('The panel was closed', result);
    });*/
  }

  openDialogNewBook2() {
    const dialogRef = this.dialog.open(PassbookDialogNewComponent, {
      maxWidth: '90vw',
      maxHeight: '90vh',
      height: '95%',
      width: '95%',
      data: { }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);

      if (result != null && typeof (result) != "undefined") {
        let passbook = BookdbService.newIPassBook();
        passbook.name = result.name;
        passbook.passphrase = result.passphrase;

        this.bookdb.createBook(passbook);
      }

    });
  }
}
