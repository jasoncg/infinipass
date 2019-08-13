import { Component, OnInit } from '@angular/core';
import { BookdbService } from '../bookdb.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  showEncryptDatabase: boolean = false;
  showRemoveDatabasePassword: boolean = false;
  encryptDatabasePassword: string = '';
  encryptDatabasePasswordConfirm: string = '';
  encryptDatabasePasswordErrors: string | null = null;
  encryptionInProgress: boolean = false;

  constructor(private bookdb: BookdbService,
    private _snackbar: MatSnackBar) { }

  ngOnInit() {
  }

  dbIsEncrypted(): boolean {
    return this.bookdb.dbIsEncrypted;
  }
  setDatabasePassword() {
    this.encryptDatabasePasswordErrors = null;

    if (this.encryptDatabasePassword != this.encryptDatabasePasswordConfirm) {
      this.encryptDatabasePasswordErrors = 'The passwords do not match';
      return;
    }
    if (this.encryptDatabasePassword.length == 0) {
      this.encryptDatabasePasswordErrors = 'A password is required';
      return;
    }

    this.encryptionInProgress = true;
    this.bookdb.encryptDatabase(this.bookdb.encryptionKey, this.encryptDatabasePassword).then(result => {
      console.log(result);
      this.encryptDatabasePassword = '';
      this.encryptDatabasePasswordConfirm = '';
      this.showEncryptDatabase = false;

      this._snackbar.open('Database Encrypted', 'Okay');
    }).catch(error => {
      this.encryptDatabasePasswordErrors = error;
      this._snackbar.open('Error encrypting database', '', {
        duration: 3000
      });
    }).finally(() => {
      this.encryptionInProgress = false;
    });
  }
  removeDatabasePassword() {
    this.encryptionInProgress = true;
    this.bookdb.encryptDatabase(this.bookdb.encryptionKey, null).then(result => {
      console.log(result);
      this.showRemoveDatabasePassword = false;
      this._snackbar.open('Database Unencrypted', 'Okay');
    }).catch(error => {
      this.encryptDatabasePasswordErrors = error;
      this._snackbar.open('Error unencrypting database', '', {
        duration: 3000
      });
    }).finally(() => {
      this.encryptionInProgress = false;
    });
  }
}
