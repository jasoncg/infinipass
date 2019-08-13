import { Component, HostListener, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { BookdbService } from './bookdb.service';

declare global {
  interface Window {
    chrome: any | null;
    browser: any | null;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  inExtenstion: boolean = false;

  title = 'Infinipass';
  events: string[] = [];

  databasePassword: string = '';
  databasePasswordErrors: string | null = null;

  @ViewChild('sidenav', {static: false}) sidenav: any;
  //opened: boolean = false;
  innerWidth: number = window.innerWidth;

  @HostListener('window:resize', ['$event'])
  onResize(event:any) {
    this.innerWidth = window.innerWidth;
  }
  constructor(
    private titleService: Title,
    private bookdb: BookdbService
  ) {
    this.inExtenstion = (window.hasOwnProperty('chrome') && (window.chrome.hasOwnProperty('browserAction'))) ? true : false;
    if (this.inExtenstion) {
      document.body.classList.add('in-webextension');
      document.documentElement.classList.add('in-webextension');
    }
  }
  getTitle(): string {
    return this.titleService.getTitle();
  }
  encryptionKeyRequired(): boolean {
    return this.bookdb.encryptionKeyRequired();
  }
  unlockDatabase() {
    this.databasePasswordErrors = null;
    this.bookdb.setEncryptionKey(this.databasePassword).then(
      message => {
        console.log(message);
      }).catch(error => {
        console.error(error);
        this.databasePasswordErrors = error;
      });
  }
}
