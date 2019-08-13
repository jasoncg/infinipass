import { Component, OnInit } from '@angular/core';

import { PassgenService, IHash, IPasswordSettings } from '../passgen.service';
import { ClipboardService } from '../clipboard.service';

@Component({
  selector: 'app-quick-generate',
  templateUrl: './quick-generate.component.html',
  styleUrls: ['./quick-generate.component.css']
})
export class QuickGenerateComponent implements OnInit {
  Math = Math;
  visualizationCharacters = [...PassgenService.visualizationCharacters];
  quickGenerate = {
    passphrase: '',
    serviceName: '',
    userName: '',
    version: 0,
    advancedSettings:false,
    passwordLength: 8,
    pinLength: 4,

    passphraseVisualization: '',

    caseSensitiveServiceData: false,

    includeLower: true,
    includeUpper: true,
    includeNumbers: true,
    includeSpecial: true,
    includeExtraCharacters: '',

    passphraseVisible: false,

    passwordVisible: false,
    pinVisible: false,

    passwordResult: '',
    pinResult: ''
  }

  constructor(
    private passgen: PassgenService,
    private clipboard: ClipboardService) { }

  ngOnInit() {
    
  }
  private  getPasswordSettings(): IPasswordSettings {

    return <IPasswordSettings>{
      length: this.quickGenerate.passwordLength,
      lowercase: this.quickGenerate.includeLower,
      uppercase: this.quickGenerate.includeUpper,
      numbers: this.quickGenerate.includeNumbers,
      special: this.quickGenerate.includeSpecial,
      extraCharacters: this.quickGenerate.includeExtraCharacters
    };
  }
  timeoutVisualization: any = null;
  timeoutPassword: any = null;

  currentPasswordString: string = '';
  quickGeneratePassword() {
    let passwordString = this.quickGenerate.passphrase +':'+
      this.quickGenerate.caseSensitiveServiceData + ':' +
      this.quickGenerate.serviceName + ':' +
      this.quickGenerate.userName + ':' +
      this.quickGenerate.version + ':' +
      this.quickGenerate.passwordLength + ':' +
      this.quickGenerate.pinLength + ':' +
      this.quickGenerate.includeLower + ':' +
      this.quickGenerate.includeUpper + ':' +
      this.quickGenerate.includeNumbers + ':' +
      this.quickGenerate.includeSpecial;


    if (this.currentPasswordString == passwordString) {
      return;
    }
    if (this.quickGenerate.passphrase == '' ||
      this.quickGenerate.serviceName  == '')
      return;

    if (this.timeoutPassword != null)
      clearTimeout(this.timeoutPassword);

    this.timeoutPassword = setTimeout(() => {
      let tpid = this.timeoutPassword;

      let serviceName = this.quickGenerate.serviceName;
      let serviceUser = this.quickGenerate.userName;

      if (!this.quickGenerate.caseSensitiveServiceData) {
        serviceName = serviceName.toLowerCase();
        serviceUser = serviceUser.toLowerCase();
      }

      let hashPromise = this.passgen.generateHashWebCrypto(
        this.quickGenerate.passphrase,
        serviceName,
        serviceUser,
        this.quickGenerate.version);

      hashPromise.then((hash) => {
        //In case WebCrypto is working while the timeout is reset
        if (tpid != this.timeoutPassword) {
          console.warn("tpid!=timeoutVisualization", tpid, this.timeoutPassword);
          //return;
        }

      /*let hash = this.passgen.generateHash(
        this.quickGenerate.passphrase,
        this.quickGenerate.serviceName,
        this.quickGenerate.userName,
        this.quickGenerate.version);*/
      //this.quickGenerate.passphraseVisualization = this.passgen.visualizePassphrase(this.quickGenerate.passphrase);

        this.quickGenerate.passwordResult = this.passgen.generatePassword(hash, this.getPasswordSettings());
        this.quickGenerate.pinResult = this.passgen.generatePin(hash, this.quickGenerate.pinLength);
        this.timeoutPassword = null;
        this.currentPasswordString = passwordString;

      });
    }, 1000);
  }
  currentPassphraseVisualization: string = '';

  generatePassphraseVisualization() {
    if (this.currentPassphraseVisualization == this.quickGenerate.passphrase)
      return;

    if (this.timeoutVisualization != null)
      clearTimeout(this.timeoutVisualization);

    this.timeoutVisualization = setTimeout(() => {
      let tvid = this.timeoutVisualization;
      this.passgen.visualizePassphrase(this.quickGenerate.passphrase)
        .then((passphraseVisualization) => {
          //In case WebCrypto is working while the timeout is reset
          if (tvid != this.timeoutVisualization) {
            console.warn("1tvid!=timeoutVisualization", tvid, this.timeoutVisualization);
            //return;
          }
          this.quickGenerate.passphraseVisualization = passphraseVisualization;
          this.currentPassphraseVisualization = this.quickGenerate.passphrase;
        });
      if (this.quickGenerate.passphrase == '' ||
        this.quickGenerate.serviceName == '') {
        this.timeoutVisualization = null;

        return;
      }
      let hashPromise = this.passgen.generateHashWebCrypto(
        this.quickGenerate.passphrase,
        this.quickGenerate.serviceName,
        this.quickGenerate.userName,
        this.quickGenerate.version);
      hashPromise.then((hash) => {
        //In case WebCrypto is working while the timeout is reset
        if (tvid != this.timeoutVisualization) {
          console.warn("2tvid!=timeoutVisualization", tvid, this.timeoutVisualization);
          //return;
        }

        //this.quickGenerate.passphraseVisualization = this.passgen.visualizePassphrase(this.quickGenerate.passphrase);

        this.quickGenerate.passwordResult = this.passgen.generatePassword(hash, this.getPasswordSettings());
        this.quickGenerate.pinResult = this.passgen.generatePin(hash, this.quickGenerate.pinLength);
        this.timeoutVisualization = null;
      });
    }, 1000);
  }
  showPassword() {
    this.quickGenerate.passwordVisible = !this.quickGenerate.passwordVisible;
  }
  showPin() {
    this.quickGenerate.pinVisible = !this.quickGenerate.pinVisible;
  }

  copyToClipboardPassword() {
    this.clipboard.copyToClipboard(this.quickGenerate.passwordResult, this.quickGenerate.serviceName + ' password copied to clipboard');

  }
  copyToClipboardPin() {
    this.clipboard.copyToClipboard(this.quickGenerate.pinResult, this.quickGenerate.serviceName + ' PIN copied to clipboard');
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
      console.log(this.encryptCustomString, ' mapped to', str);

      this.generateCustomEncryptedString(str)
        .then((result) => {
          console.log('RESULT:', result);
          this.encryptCustomStringResult = result;
          this.timeoutEncryptStringRefresh = null;
        });
    }, 1000);
  }

  async generateCustomEncryptedString(text: string): Promise<string> {

    //this.hash = this.passgen.generateHash(this.passbook.passphrase, this.service.name, this.service.user, this.service.count);
    let serviceName = this.quickGenerate.serviceName;
    let serviceUser = this.quickGenerate.userName;

    if (!this.quickGenerate.caseSensitiveServiceData) {
      serviceName = serviceName.toLowerCase();
      serviceUser = serviceUser.toLowerCase();
    }

    let hash = await this.passgen.generateHashWebCrypto(
      this.quickGenerate.passphrase,
      serviceName,
      serviceUser + ":" + text,
      0);

    if (hash == null)
      return '';
    let passwordSettings = this.getPasswordSettings();

    let password = this.passgen.generatePassword(
      hash,
      passwordSettings);

    return password;
  }
  copyToClipboardEncryptCustomStringResult() {
    this.clipboard.copyToClipboard(this.encryptCustomStringResult, this.quickGenerate.serviceName + ' custom string copied to clipboard');

  }
}
