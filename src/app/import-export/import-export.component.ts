import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookdbService, IPassBook, IService, ISettings } from '../bookdb.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClipboardService } from '../clipboard.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { EncryptionService } from '../encryption.service';

interface IDatabaseDump {
  settings: ISettings[];
  passbooks: IPassBook[];
  services: IService[];
}

@Component({
  selector: 'app-import-export',
  templateUrl: './import-export.component.html',
  styleUrls: ['./import-export.component.css']
})
export class ImportExportComponent implements OnInit {
  encryptedDataForExport: string | null = null;
  encryptedDataForImport: string | null = null;
  pasteTextVisible: boolean = false;
  decryptedDataFromImport: IDatabaseDump | null = null;

  currentDatabaseData: IDatabaseDump | null=null;

  decryptionError: string | null = null;
  downloadLink: any | null = null;

  importDataFrom = '';
  password = '';

  exportDataJSON = '';
  importDataResult = '';

  constructor(
    private encryption: EncryptionService,
    private sanitizer: DomSanitizer,
    private _snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router,
    private bookdb: BookdbService,
    private clipboard: ClipboardService
  ) { }

  ngOnInit() {
    //this.bookdb.passbooksSubject.subscribe()
    this.getAllData().then(data => {
      //Get the current database dump for compare
      this.currentDatabaseData;
    });
  }

  exportToClipboard() {
    if (this.encryptedDataForExport != null && this.encryptedDataForExport !='') {
      navigator.clipboard.writeText(this.encryptedDataForExport);
      this._snackBar.open('Exported to clipboard', '', {
        duration: 5000
      });
    } else {
      this._snackBar.open('Export data first', 'Dismiss');
    }
  }
  static textFile: any | null = null;

  static saveTextToFile(text:string):any {
    var data = new Blob([text], { type: 'text/plain' });

    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (ImportExportComponent.textFile !== null) {
      window.URL.revokeObjectURL(ImportExportComponent.textFile);
    }

    ImportExportComponent.textFile = window.URL.createObjectURL(data);

    // returns a URL you can use as a href
    return ImportExportComponent.textFile;
  };

  decryptTimeout: any = null;
  decryptDataFromImport() {
    this.decryptionError = null;
    this.decryptedDataFromImport = null;

    if (this.decryptTimeout != null)
      clearTimeout(this.decryptTimeout);

    this.decryptTimeout = setTimeout(() => {
      this.decryptTimeout = null;

      //Attempt to decrypt paste data
      if (this.password == null) {
        return;
      }
      if (this.encryptedDataForImport == null) {
        return;
      }
      if (this.password != null && this.password != '') {
        let p = EncryptionService.stringDecrypt(this.password, this.encryptedDataForImport);
        p.then(data => {
          try {
            this.decryptedDataFromImport = JSON.parse(data);
          } catch (e) {
            this.decryptionError = 'Decryption successfull, but the encrypted data is not valid.';
          }
        }).catch(err => {
          this.decryptionError = 'Unable to decrypt. Verify the password and pasted text.';
        });
      } else {
        try {
          this.decryptedDataFromImport = JSON.parse(this.encryptedDataForImport);
        } catch (e) {
          this.decryptionError = 'The data is not valid.';
        }
      }
    }, 1000);
  }

  clickField(fieldId: string) {
    if (document==null)
      return;
    let field: HTMLElement|null = document.getElementById(fieldId);
    if(field!=null)
      field.click();
  }
  uploadFile(field: any) {
    if (field == null)
      return;
    let reader = new FileReader();
    reader.onload = (fileData) => {
      let src: any = fileData.srcElement;
      this.encryptedDataForImport = src.result;
      this.decryptDataFromImport();
    };
    reader.readAsText(field.target.files[0]);

  }

  prepareExportData() {
    //console.log('encrypting with ', this.password);
    let p = this.exportData(this.password);
    p.then(encrypted => {
      this.encryptedDataForExport = encrypted;
      let file = ImportExportComponent.saveTextToFile(this.encryptedDataForExport);
      //console.log('file', file);
      this.downloadLink = this.sanitizer.bypassSecurityTrustResourceUrl(file);
      //console.log(encrypted);
    });
    p.catch(err => {
      console.error(err);
      this._snackBar.open('Unable to encrypt', 'Dismiss');
    });
  }
  /*
  importDataTest() {
    let p = this.importData(this.password, this.importDataFrom);

    p.then(data => {
      this.importDataResult = data;
    });
    p.catch(err => {
      console.error(err);
      this._snackBar.open('Password is invalid', 'Dismiss');
    });
  }*/

  private async getAllData(): Promise<IDatabaseDump> {
    let db: IDatabaseDump = <IDatabaseDump>{};

    //Get all settings
    //db.settings = await this.bookdb.settingsGetAll();

    //Get all passbooks
    db.passbooks = await this.bookdb.passbooksGetAll();
    //Get all services
    db.services = await this.bookdb.servicesGetAll();

    return db;

  }

  // Dumps the entire database and encrypts it with the specified key
  async exportData(password: string|null): Promise<string> {
    let data = '';
    let db: IDatabaseDump = await this.getAllData();

    data = JSON.stringify(db);

    if (password!=null)
      data = await EncryptionService.stringEncrypt(password, data);

    return data;
  }
  /*
  // Decrypts the data, then imports it into the database
  async importData(password:string|null, encrypted: string) : Promise<any> {
    //Decrypt data
    let data: string;
    if (password != null)
      data = await EncryptionService.stringDecrypt(password, encrypted);
    else
      data = encrypted;

    return data;
  }*/
  dataImportInProgress: boolean = false;
  importData() {
    if (this.decryptedDataFromImport == null)
      return;

    this.dataImportInProgress = true;
    console.log('DECRYPTED', this.decryptedDataFromImport);
    //Import settings
    if (this.decryptedDataFromImport.settings)
    for (let r of this.decryptedDataFromImport.settings) {
      console.log('Setting', r);
    }
    let promises: Promise<any>[] = [];

    //Import passbooks
    if (this.decryptedDataFromImport.passbooks) {
      var pp = this.bookdb.updatePassbooksAndServices(
                this.decryptedDataFromImport.passbooks,
                this.decryptedDataFromImport.services
      );
      pp.then(results => {
        this._snackBar.open('Imported '+ results +' records', 'Dismiss');
      }).catch(err => {
        console.error(err);
        this._snackBar.open('Import failed ' + err, 'Dismiss');
      }).finally(() => {
        this.dataImportInProgress = false;
      });
    }

  }
}
