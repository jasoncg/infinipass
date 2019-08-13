import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ClipboardService {

  constructor(private _snackBar: MatSnackBar) { }

  /// Sets the clipboard with the specified value.
  /// If message is provided, displays the message.
  copyToClipboard(val: string, message: string) {
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
  getClipboard(): string {
    document.addEventListener('paste', event => {
      if (event==null || event.clipboardData == null) return;

      const text = event.clipboardData.getData('text/plain');
      console.log('Clipboard event: ', text);
    });
    let selBox = document.createElement('textarea');
    selBox.contentEditable = 'true';

    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';

    document.body.appendChild(selBox);
    selBox.focus();
    //selBox.select();
    document.execCommand('paste');
    console.log(selBox);
    let value = selBox.value;

    document.body.removeChild(selBox);

    return value!=null?value:'NONE';
  }
}
