import { Injectable } from '@angular/core';
//import { NgxIndexedDB } from 'ngx-indexed-db';

import { Subject } from 'rxjs';

import { MatSnackBar } from '@angular/material/snack-bar';
import { PassgenService, IHash } from './passgen.service';
import { EncryptionService } from './encryption.service';

export interface ISettings {
  key: string | null;
  value: string | null;
}

export interface IService {
  id: number|null;
  passbookId: number | null;
  name: string;
  user: string;
  count: number;
  password: boolean;
  pin: boolean;
  passwordLength: number;
  pinLength: number;
  color: number | null;
  icon: string | null;
  customStrings: string[] | null;
}
export interface IPassBook {
  id: number;
  name: string;
  passphrase: string;
  visualPassphrase: string; //A hashed visual representation of the passphrase

  //Settings
  hideVisualPassphraseHash: boolean;

  //If savePassphrase is false, the user will need to type the passphrase
  //in every time the book is opened
  savePassphrase: true;

  // If enabled, allows changing password generation values.
  // This makes it more difficult to recover since the user will need to
  // remember to make the same configuration changes when reinstalling
  // the app.
  advancedSettings: boolean;

  caseSensitiveServiceData: boolean;

  defaultPasswordLength: number;
  defaultPinLength: number;

  passwordIncludeLower: boolean;
  passwordIncludeUpper: boolean;
  passwordIncludeNumbers: boolean;
  passwordIncludeSpecial: boolean;

  //If set, adds the specified characters to the password RNG
  passwordIncludeCustom: string;
}
const SETTINGS = 'settings';
const PASSBOOKS = 'passbooks';
const SERVICES = 'services';

@Injectable({
  providedIn: 'root'
})
export class BookdbService {

  db: IDBDatabase|null=null;
  dbReady = new Subject<IDBDatabase>();

  encryptionKey: string|null=null;//CryptoKey|null = null;
  dbIsEncrypted: boolean = false;

  settingsSubject = new Subject<any>();
  settingsModified = new Subject<ISettings>();

  //Notified whenever the datastore changes
  passbooksSubject = new Subject<any>();
  servicesSubject = new Subject<any>();

  passbookAdded = new Subject<IPassBook>();
  serviceAdded = new Subject<IService>();

  passbookModified = new Subject<IPassBook>();
  serviceModified = new Subject<IService>();

  passbookRemoved = new Subject<IPassBook>();
  serviceRemoved = new Subject<IService>();

  encryptionKeyRequired(): boolean {
    //console.log('encryptionKeyRequired', this.dbIsEncrypted, this.encryptionKey);
    return (this.dbIsEncrypted && this.encryptionKey == null);
  }
  setEncryptionKey(password: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      if (!this.dbIsEncrypted) {
        resolve('Unlocked');
        return;
      }

      if (this.db == null) {
        reject("Database not ready");
        return;
      }
      let db = this.db;




      let tx = this.db.transaction(SETTINGS, 'readonly');
      let store = tx.objectStore(SETTINGS);

      //Get salt
      let saltR = store.get('salt');
      //Get encrypted string
      let checkEncryptedR = store.get('encrypted');

      saltR.onsuccess = e => {
        password += ':' + saltR.result.value;

        checkEncryptedR.onsuccess = s => {
          let encrypted = checkEncryptedR.result.value;

          EncryptionService.stringDecrypt(password, encrypted).then(
            decrypted => {
              if (password.length + ' encrypted' == decrypted) {
                this.encryptionKey = password;

                this.dbReady.next(db);
                this.dbReady.complete();

                this.settingsSubject.next();
                this.passbooksSubject.next();
                this.servicesSubject.next();
                resolve('Unlocked');
                return;
              }
              reject("Invalid Password");
            }).catch(() => {
              //Wait for encryption key
              reject("Invalid Password");
            });
        };
      };
      saltR.onerror = e => {
        reject("Salt not found");
      };

    });
  
  }
  constructor(
    private encryption: EncryptionService,
    private _snackBar: MatSnackBar,
    private passgen: PassgenService) {
    console.log('BOOKDB Service Constructor');
    
    let request = window.indexedDB.open('bookdb', 2);

    request.onerror = e => {
      console.error(request.error);
    };
    request.onupgradeneeded = event => {
      const db: IDBDatabase = request.result;

      console.log('UPGRADE bookdb native', db);
      console.log('Create datastore ' + SETTINGS);
      const settingsOS = db.createObjectStore(SETTINGS, {
        keyPath: 'key', autoIncrement: false
      });

      console.log('Create datastore ' + PASSBOOKS);
      const passbooksOS = db.createObjectStore(PASSBOOKS, {
        keyPath: 'id', autoIncrement: true
      });
      console.log('Create datastore ' + SERVICES);
      let servicesOS = db.createObjectStore(SERVICES, {
        keyPath: 'id', autoIncrement: true
      });
      servicesOS.createIndex("PassbookIndex", "passbookId");
    };

    request.onsuccess = e => {
      const db: IDBDatabase = request.result;

      this.db = db;
      console.log('SUCCESS bookdb native', this.db);

      //Check if database is encrypted
      let tx = this.db.transaction(SETTINGS, 'readonly');
      let store = tx.objectStore(SETTINGS);
      let checkEncryptedR = store.get('encrypted');

      checkEncryptedR.onsuccess = e => {
        let value = (checkEncryptedR.result == null || checkEncryptedR.result == undefined) ? '' : checkEncryptedR.result.value;

        if (value == null || value== '') {
          this.dbIsEncrypted = false;
        } else {
          this.dbIsEncrypted = true;
        }
        if (this.encryptionKey == null && !this.dbIsEncrypted) {
          this.dbReady.next(db);
          this.dbReady.complete();

          this.settingsSubject.next();
          this.passbooksSubject.next();
          this.servicesSubject.next();
        } else {

          if (this.encryptionKey=null)
            EncryptionService.stringDecrypt(this.encryptionKey, checkEncryptedR.result.value).then(
            decrypted => {
              if (this.encryptionKey!=null)
              if (this.encryptionKey.length + ' encrypted' == decrypted) {
                this.dbReady.next(db);
                this.dbReady.complete();

                this.settingsSubject.next();
                this.passbooksSubject.next();
                this.servicesSubject.next();
                return;
              }
              console.warn("Database is encrypted - invalid key");
            }).catch(() => {
              //Wait for encryption key
              console.warn("Database is encrypted");
            });
        }
        /*
        if (this.verifyEncryptionKey(this.encryptionKey)) {
          this.dbReady.next(db);
          this.dbReady.complete();

          this.settingsSubject.next();
          this.passbooksSubject.next();
          this.servicesSubject.next();
        }*/

      };
      request.onerror = e => {
        // Not encrypted
        this.dbIsEncrypted = false;
        this.dbReady.next(db);
        this.dbReady.complete();

        this.settingsSubject.next();
        this.passbooksSubject.next();
        this.servicesSubject.next();
      };


      //Check if the database is encrypted. If it is, don't
      // trigger dbReady until valid key is provided
      this.settingsGet('encrypted', '').then(val => {

        this.dbIsEncrypted = val != '' ? true : false;

        if (this.verifyEncryptionKey(this.encryptionKey)) {
          this.dbReady.next(db);
          this.dbReady.complete();

          this.settingsSubject.next();
          this.passbooksSubject.next();
          this.servicesSubject.next();
        } else {
          this.encryptionKey = null;
          //Wait until a valid encryption key is provided before
          //setting db is ready
        }
        /*
        if (this.dbIsEncrypted) {
          if (this.encryptionKey != null) {
            //Verify the key is valid
            EncryptionService.stringDecrypt(this.encryptionKey, val).then()
          }


        } else {
          this.dbReady.next(db);
          this.dbReady.complete();

          this.settingsSubject.next();
          this.passbooksSubject.next();
          this.servicesSubject.next();
        }*/
      });
    };

  }
  //Returns true if password is the key used to encrypt the database
  async verifyEncryptionKey(password: string|null): Promise<boolean> {
    let encrypted = await this.settingsGet('encrypted', '');
    if (password == null) {
      if (encrypted == '')
        return true;
      else return false;
    }
    if (encrypted == '' && password != null && password!='')
      return false;
    try {
      var decrypted = await EncryptionService.stringDecrypt(password, encrypted);
      if (decrypted == password.length + ' encrypted')
        return true;
    } catch (e) {

    }
    return false;
  }
  private snackbarMessage(text: string) {
    this._snackBar.open(text, '', { duration: 2000 });
  }

  static newIPassBook(): IPassBook {
    return <IPassBook>{
      //id: -1,
      name: '',
      passphrase: '',
      visualPassphrase:'',

      hideVisualPassphraseHash: false,
      savePassphrase: true,

      advancedSettings: false,
      caseSensitiveServiceData:false,

      defaultPasswordLength: 12,
      defaultPinLength: 4,

      passwordIncludeLower: true,
      passwordIncludeUpper: true,
      passwordIncludeNumbers: true,
      passwordIncludeSpecial: true,

      passwordIncludeCustom: ''
    }
  }
  settingsSet(key: string, value: string): Promise<ISettings> {
    return new Promise((resolve, reject) => {

      if (this.db == null) {
        reject('settingsSet Database not found');
        return;
      }

      const transaction = this.db.transaction(SETTINGS, 'readwrite');
      const os = transaction.objectStore(SETTINGS);
      let kvp = { key: key, value: value };
      let request = os.put(kvp);

      request.onsuccess = event => {
        let et: any = event.target;
        this.settingsSubject.next();
        this.settingsModified.next(kvp);
        //console.log('settingsSet success', event, et, et.result, kvp);
        resolve(kvp);
      };
      request.onerror = event => {
        let et: any = event.target;
        //console.error('settingsSet error', event, et, kvp);
        reject(request.error);
      };
    });
  }
  async settingsGet(key: string, defaultValue: string=''): Promise<string> {
    await this.dbReady.toPromise();

    return new Promise((resolve, reject) => {
      if (this.db == null) {
        reject('settingsGet Database not found');
        return;
      }
      let tx = this.db.transaction(SETTINGS, 'readonly');
      let store = tx.objectStore(SETTINGS);
      let request = store.get(key);

      //let request = store.openCursor(passbookId);
      request.onsuccess = s => {
        let resultValue = (request.result != undefined) ? request.result.value:null;

        //console.log('settingsGet result', resultValue);
        if (resultValue != null) {
          resolve(resultValue);
        } else {
          resolve(defaultValue);
        }
      };
      request.onerror = e => {
        resolve(defaultValue);
      }

    });
  }


  async settingsGetAll(): Promise<ISettings[]> {
    await this.dbReady.toPromise();

    return new Promise((resolve, reject) => {
      if (this.db == null) {
        reject('settingsGetAll Database not found');
        return;
      }
      let tx = this.db.transaction(SETTINGS, 'readonly');
      let store = tx.objectStore(SETTINGS);
      let request = store.getAll();

      //let request = store.openCursor(passbookId);
      request.onsuccess = s => {
        let et: any = s.target;

        //console.log('settingsGetAll result', et.result);

        resolve(et.result.value);
      };

    });
  }

  // Similar to settingsGet, but also receives updates when the
  // value changes
  settingsGetAsync(key: string, defaultValue: string=''): Subject<string> {
    let s = new Subject<string>();

    let initValue = this.settingsGet(key, defaultValue);

    initValue.then(e => {
      s.next(e);

      //this.passbookModified.pipe(takeUntil(s)).subscribe((p) => {
      let sub = this.settingsModified.subscribe((p) => {
        if (s.isStopped || s.closed) {
          //console.log('settingsGetAsync CLOSING');
          sub.unsubscribe();
          return;
        }
        //console.log('settingsGetAsync', p);
        if (p.key == key) {
          let val = typeof(p.value)=='string'?p.value:defaultValue;
          s.next(val);
        }
      });
    });

    return s;
  }

  // Creates a new PassBook. Returns the id of the new book
  createBook(passbookInfo: IPassBook, services:IService[]=[]): Promise<number> {
    return new Promise(async (resolve, reject) => {
      if (this.db == null) {
        reject('createBook Database not found');
        return;
      }

      passbookInfo.visualPassphrase = await this.passgen.visualizePassphrase(passbookInfo.passphrase);

      passbookInfo = await BookdbService.encryptPassbook(passbookInfo, null, this.encryptionKey);


      const transaction = this.db.transaction(PASSBOOKS, 'readwrite');
      const passbooksOS = transaction.objectStore(PASSBOOKS);

      let request = passbooksOS.add(passbookInfo);

      request.onsuccess = event => {
        let et: any = event.target;
        passbookInfo.id = et.result;
        this.passbooksSubject.next();
        this.passbookAdded.next(et.result);
        //console.error('createBook success', event, et, et.result);
        if (services.length > 0) {
          this.createServices(passbookInfo.id, services).then((serviceIds) => {
            this.snackbarMessage('Passbook Created');
          });
        } else {
          this.snackbarMessage('Passbook Created');
        }
        resolve(et.result);
      };

      request.onerror = event => {
        let et: any = event.target;
        reject(et.result);
        console.error('createBook error', event, et);
      };
    });
  }
  /// Creates a new Service and adds it to the specified Passbook.
  /// Returns the id of the new service.
  createService(passbookId: number, serviceInfo: IService): Promise<number> {
    return new Promise(async (resolve, reject) => {
      serviceInfo.passbookId = passbookId;
      //Force create a new record
      delete serviceInfo.id;

      serviceInfo = await BookdbService.encryptService(serviceInfo, null, this.encryptionKey);

      //console.log('createService(', passbookId, serviceInfo, ')');

      if (this.db == null) {
        reject('createService Database not found');
        return;
      }
      const transaction = this.db.transaction(SERVICES, 'readwrite');
      const servicesOS = transaction.objectStore(SERVICES);

      let request = servicesOS.add(serviceInfo);
      request.onsuccess = event => {
        let et: any = event.target;
        serviceInfo.id = et.result;
        //console.log('createService(', passbookId, serviceInfo, ') => ADDED ', et.result);

        resolve(et.result);
        this.servicesSubject.next();
        this.serviceAdded.next(serviceInfo);
        this.snackbarMessage('Added ' + serviceInfo.name);
      };
      request.onerror = event => {
        let et: any = event.target;
        reject(et.result);
      };

    });
  }

  async createServices(passbookId: number, serviceInfo: IService[]): Promise<number> {
    return new Promise(async (resolve, reject) => {
      for (let i in serviceInfo) {
        serviceInfo[i].passbookId = passbookId;
        delete serviceInfo[i].id;

        serviceInfo[i] = await BookdbService.encryptService(serviceInfo[i], null, this.encryptionKey);
      }

      //console.log('createServices(', passbookId, serviceInfo, ')');

      if (serviceInfo.length == 0) {
        reject('createService No services provided');
        return;
      }
      if (this.db == null) {
        reject('createService Database not found');
        return;
      }
      const transaction = this.db.transaction(SERVICES, 'readwrite');
      const servicesOS = transaction.objectStore(SERVICES);
      let createdCount: number = 0;
      let failedCount: number = 0;
      for (let i in serviceInfo) {

        let request = servicesOS.add(serviceInfo[i]);
        request.onsuccess = event => {
          let et: any = event.target;
          createdCount++;
          //console.log('createService(', passbookId, serviceInfo[i], ') => ADDED ', et.result);

          //this.servicesSubject.next();
          //this.serviceAdded.next(serviceInfo[0]);

        };
        request.onerror = event => {
          failedCount++;
          let et: any = event.target;
          console.error(et.result);
        };
      }

      transaction.oncomplete = () => {
        this.servicesSubject.next();
        resolve(createdCount);
      };

    });
  }

  getPassbooksAsync(): Subject<IPassBook[]> {

    //return of(this.passbooks);
    let s = new Subject<IPassBook[]>();

    this.dbReady.toPromise().finally(() => {
      console.log('getPassbooksAsync dbReady');

      if (this.db == null) {
        s.error('getPassbooksAsync Database not found');
        return;
      }
      this.db.transaction(PASSBOOKS, 'readonly')
        .objectStore(PASSBOOKS)
        .getAll().onsuccess = e => {
          let et: any = e.target;
          //console.log('getPassbooksAsync', et.result);
          let passbooks: IPassBook[] = et.result;
          BookdbService.decryptPassbooks(passbooks, this.encryptionKey).then(
            decrypted => {
              s.next(decrypted);
            });
        };

      //this.passbooksSubject.pipe(takeUntil(s.)).subscribe((p) => {
      let subscription = this.passbooksSubject.subscribe((p) => {
        if (s.isStopped) {
          subscription.unsubscribe();
          return;
        }
        if (this.db == null) {
          s.error('getPassbooksAsync Database not found');
          return;
        }
        //Get passbooks
        this.db.transaction(PASSBOOKS, 'readonly')
          .objectStore(PASSBOOKS)
          .getAll().onsuccess = e => {
            let et: any = e.target;
            //console.log('getPassbooksAsync', et.result);
            let passbooks: IPassBook[] = et.result;

            BookdbService.decryptPassbooks(passbooks, this.encryptionKey).then(
              decrypted => {
                s.next(decrypted);
              });
          };
      });

    });
    return s;
  }
  getPassbookAsync(passbookId: number): Subject<IPassBook> {
    let s = new Subject<IPassBook>();

    let passbookInfo = this.getPassbookInfo(passbookId);

    passbookInfo.then(e => {
      s.next(e);

      //this.passbookModified.pipe(takeUntil(s)).subscribe((p) => {
      let sub = this.passbookModified.subscribe((p) => {
        if (s.isStopped || s.closed) {
          //console.log('getPassbookAsync CLOSING');
          sub.unsubscribe();
          return;
        }
        //console.log('getPassbookAsync', p);
        if (p.id == passbookId) {
          s.next(p);
        }
      });
    });

    return s;
  }
  getServicesByNameAsync(serviceName: string): Subject<IService[]> {
    let s = new Subject<IService[]>();

    serviceName = serviceName.toLowerCase();
    let services = this.getServicesByName(serviceName);

    services.then(e => {
      s.next(e);

      let subscriptionAdded = this.serviceAdded.subscribe((service) => {
        if (s.isStopped || s.closed) {
          subscriptionAdded.unsubscribe();
          return;
        }
        /*
        if (this.db == null) {
          s.error('getServicesAsync Database not found');
          return;
        }*/
        if (service.name.toLowerCase() == serviceName) {
          this.getServicesByName(serviceName).then((e) => {
            s.next(e);
          });
        }
      });
      //this.serviceModified.pipe(takeUntil(s)).subscribe((service) => {
      let subscriptionModified = this.serviceModified.subscribe((service) => {
        if (s.isStopped) {
          subscriptionModified.unsubscribe();
          return;
        }
        /*if (this.db == null) {
          s.error('getServicesAsync Database not found');
          return;
        }*/

        if (service.name.toLowerCase() == serviceName) {
          this.getServicesByName(serviceName).then((e) => {
            s.next(e);
          });
        }
      });
      let subscriptionRemoved = this.serviceRemoved.subscribe((service) => {
        if (s.isStopped) {
          subscriptionRemoved.unsubscribe();
          return;
        }
        /*if (this.db == null) {
          s.error('getServicesAsync Database not found');
          return;
        }*/

        if (service.name.toLowerCase() == serviceName) {
          this.getServicesByName(serviceName).then((e) => {
            s.next(e);
          });
        }
      });
    });
    return s;
  }
  getServicesAsync(passbookId: number): Subject<IService[]> {
    //return of(this.services.filter(s => s.passbookId==passbookId));
    let s = new Subject <IService[]>();

    let services = this.getServices(passbookId);

    services.then(e => {
      s.next(e);

      let subscriptionAdded = this.serviceAdded.subscribe((service) => {
        if (s.isStopped || s.closed) {
          subscriptionAdded.unsubscribe();
          return;
        }
        if (this.db == null) {
          s.error('getServicesAsync Database not found');
          return;
        }
        //console.log('getServicesAsync', service, 'looking for passbookId', passbookId);

        if (service.passbookId == passbookId) {
          this.getServices(passbookId).then((e) => {
            s.next(e);
          });

        }
      });
      //this.serviceModified.pipe(takeUntil(s)).subscribe((service) => {
      let subscriptionModified = this.serviceModified.subscribe((service) => {
        if (s.isStopped) {
          subscriptionModified.unsubscribe();
          return;
        }
        /*if (this.db == null) {
          s.error('getServicesAsync Database not found');
          return;
        }*/

        if (service.passbookId == passbookId) {

          this.getServices(passbookId).then((e) => {
            s.next(e);
          });
        }
      });
      let subscriptionRemoved = this.serviceRemoved.subscribe((service) => {
        if (s.isStopped) {
          subscriptionRemoved.unsubscribe();
          return;
        }
        /*if (this.db == null) {
          s.error('getServicesAsync Database not found');
          return;
        }*/

        if (service.passbookId == passbookId) {

          this.getServices(passbookId).then((e) => {
            s.next(e);
          });
        }
      });
    });
    return s;
  }
  getServiceAsync(serviceId: number): Subject<IService> {
    //return of(this.services[serviceId]);
    let s = this.getServiceInfo(serviceId)// new Subject<IService>();
    
    let subscription = this.serviceModified.subscribe((service) => {
      //console.log('getServiceAsync subscription',service);
      if (s.isStopped) {
        subscription.unsubscribe();
        //console.log('getServiceAsync subscription UNSUBSCRIBE');
        return;
      }
      if (service.id == serviceId) {
        //console.log('getServiceAsync', service);
        s.next(service);
      }
    });

    return s;
  }

  async passbooksGetAll(): Promise<IPassBook[]> {
    await this.dbReady.toPromise();

    return new Promise((resolve, reject) => {
      if (this.db == null) {
        reject('getPassbookInfo Database not found');
        return;
      }

      let tx = this.db.transaction(PASSBOOKS, 'readonly');
      let store = tx.objectStore(PASSBOOKS);
      let request = store.getAll();

      request.onsuccess = s => {
        let et: any = s.target;

        let passbooks: IPassBook[] = et.result;
        BookdbService.decryptPassbooks(passbooks, this.encryptionKey).then(
          decrypted => {
            resolve(decrypted);
          });
        //resolve(et.result);
      };
      request.onerror = e => {
        reject(request.error);
      };
    });
  }

  async getPassbookInfo(passbookId: number): Promise<IPassBook> {

    await this.dbReady.toPromise();

    return new Promise((resolve, reject) => {

      if (this.db == null) {
        reject('getPassbookInfo Database not found');
        return;
      }

      let tx = this.db.transaction(PASSBOOKS, 'readonly');
      let store = tx.objectStore(PASSBOOKS);
      let request = store.get(passbookId);

      //let request = store.openCursor(passbookId);
      store.get(passbookId).onsuccess = s => {
        let et: any = s.target;

        //console.log('getPassbookInfo result', et.result);
        if (et.result != null) {
          let passbook = et.result;
          BookdbService.decryptPassbook(passbook, this.encryptionKey).then(decrypted => {
            resolve(BookdbService.sanitizePassbook(decrypted));
          });
        } else {
          reject('Passbook(' + passbookId + ':' + typeof (passbookId)+') Not Found');
        }
      };
      /*r.onerror = e => {
        reject(r.error);
      };*/

    });
  }

  async servicesGetAll(): Promise<IService[]> {
    await this.dbReady.toPromise();

    return new Promise((resolve, reject) => {
      if (this.db == null) {
        reject('servicesGetAll Database not found');
        return;
      }

      let tx = this.db.transaction(SERVICES, 'readonly');
      let store = tx.objectStore(SERVICES);
      let request = store.getAll();

      request.onsuccess = s => {
        let et: any = s.target;
        let services: IService[] = et.result;
        BookdbService.decryptServices(services, this.encryptionKey).then(decrypted => {
          resolve(decrypted);
        });
      };
      request.onerror = e => {
        reject(request.error);
      };
    });
  }
  
  async getServicesByName(serviceName: string, caseSensitive:boolean=false): Promise<IService[]> {
    await this.dbReady.toPromise();

    return new Promise((resolve, reject) => {

      if (this.db == null) {
        reject('getServices Database not found');
        return;
      }
      let tx = this.db.transaction(SERVICES, 'readonly');
      let store = tx.objectStore(SERVICES);

      const request = store.openCursor();

      let services: IService[] = [];

      request.onsuccess = s => {
        const et: any = s.target;
        const cursor: IDBCursorWithValue = et.result;
        if (cursor) {
          let value: IService = cursor.value;
          //console.log('CURSOR', cursor, value);
          if (value.hasOwnProperty('name')) {
            if ((caseSensitive && value.name == serviceName) ||
              (!caseSensitive && value.name.toLowerCase() == serviceName.toLowerCase())) {
              services.push(value);
            }
            //console.log('got ', value.name);
          }
          cursor.continue();
        }
      };

      tx.oncomplete = d => {

        BookdbService.decryptServices(services, this.encryptionKey).then(decrypted => {
          decrypted.sort((a, b) => {
            let aname: string = a.name ? a.name : '';
            let auser: string = a.user ? a.user : '';
            let bname: string = b.name ? b.name : '';
            let buser: string = b.user ? b.user : '';
            //let cmp = (bname + buser).localeCompare(aname + auser);
            let cmp = (aname + auser).localeCompare(bname + buser);
            //console.log(aname, bname, cmp);
            return cmp;
          });

          resolve(decrypted);
        });
      };
      tx.onerror = e => {
        reject(e);
      }
    });
  }
  async getServices(passbookId: number): Promise<IService[]> {
    await this.dbReady.toPromise();

    return new Promise((resolve, reject) => {

      if (this.db == null) {
        reject('getServices Database not found');
        return;
      }
      let tx = this.db.transaction(SERVICES, 'readonly');
      let store = tx.objectStore(SERVICES);
      const idx = store.index("PassbookIndex");
      const request = idx.getAll(passbookId);

      request.onsuccess = s => {
        let et: any = s.target;
        if (et.result != null) {
          let services: IService[] = et.result;

          BookdbService.decryptServices(services, this.encryptionKey)
            .then(decrypted => {
              //console.log('getServices getAll('+passbookId+') result', et.result);
                decrypted.sort((a, b) => {
                  let aname: string = a.name ? a.name : '';
                  let auser: string = a.user ? a.user : '';
                  let bname: string = b.name ? b.name : '';
                  let buser: string = b.user ? b.user : '';
                  //let cmp = (bname + buser).localeCompare(aname + auser);
                  let cmp = (aname + auser).localeCompare(bname + buser);
                  //console.log(aname, bname, cmp);
                  return cmp;
                });

                resolve(decrypted);
              });
        } else {
          reject('Passbook.Services(' + passbookId + ':' + typeof (passbookId) + ') Not Found');
        }
      };
      /*r.onerror = e => {
        reject(r.error);
      };*/

    });
  }

  getServiceInfo(serviceId: number): Subject<IService> {

    let result = new Subject<IService>();
    this.dbReady.toPromise().then(() => {
      if (this.db == null) {
        result.error('getServiceInfo Database not found');
        return;
      }
      let request = this.db.transaction('services', 'readonly')
        .objectStore('services')
        .get(serviceId);

      request.onsuccess = e => {
        let et: any = e.target;
        //console.log('getServiceInfo', et.result);
        let service: IService = et.result;
        BookdbService.decryptService(service, this.encryptionKey).then(
          decrypted => {
            result.next(decrypted);
          });
        //result.next(e.returnValue);
      };
      request.onerror = e => {
        console.error(e);
        result.error(e);
      };
    });
    return result;
  }
  static sanitizePassbook(passbookInfo: IPassBook) {
    let defaultPassbook = BookdbService.newIPassBook();
    return <IPassBook>{ ...defaultPassbook, ...passbookInfo };
  }
  updatePassbook(passbookId: number, passbookInfo: IPassBook, isUndo: boolean = false): Promise<IPassBook> {
    return new Promise(async (resolve, reject) => {

      passbookInfo = BookdbService.sanitizePassbook(passbookInfo);

      passbookInfo.id = passbookId;

      //Get the current value of the passbook (to allow undo)
      let originalPassbookInfo = await this.getPassbookInfo(passbookId);

      let visualPassphrase = await this.passgen.visualizePassphrase(passbookInfo.passphrase);

      if (this.db == null) {
        reject('Database not found');
        return;
      }

      //console.log('UpdatePassbook', originalPassbookInfo, passbookInfo);
      passbookInfo.visualPassphrase = visualPassphrase;

      //Encrypt passbook
      let encrypted = await BookdbService.encryptPassbook(passbookInfo, null, this.encryptionKey);

      const os = this.db.transaction(PASSBOOKS, 'readwrite')
        .objectStore(PASSBOOKS);

      let r = os.put(encrypted);

      r.onsuccess = e => {
        let et: any = e.target;
        //console.log('updatePassbook', e, et);
        //result.next(e.returnValue);

        resolve(passbookInfo);
        this.passbooksSubject.next();
        this.passbookModified.next(passbookInfo);
        //this.snackbarMessage('Updated ' + passbookInfo.name);

        if (isUndo) {
          this.snackbarMessage('Undo Update ' + passbookInfo.name);
        } else {
          this._snackBar.open('Updated ' + passbookInfo.name,
            'Undo',
            { duration: 10000 })
            .onAction().subscribe(() => {
              //delete serviceInfo.id;
              //Undo button pressed
              if (passbookId == null)
                return;
              this.updatePassbook(passbookId, originalPassbookInfo, true);
            });
        }
      };

    });
  }

  updatePassbooksAndServices(passbooks: IPassBook[], services:IService[]): Promise<number> {
    return new Promise(async (resolve, reject) => {
      //Sanitize and encrypt passbooks
      for (let i in passbooks) {
        passbooks[i] = BookdbService.sanitizePassbook(passbooks[i]);
        passbooks[i] = await BookdbService.encryptPassbook(passbooks[i], null, this.encryptionKey);

        /*
        //Update visual passphrases
        let p = (this.passgen.visualizePassphrase(passbooks[i].passphrase));
        p.then((visualPassphrase) => {
          passbooks[i].visualPassphrase = visualPassphrase;
        });
        vp.push(p);
  
        //Get the current value of the passbook (to allow undo)
        let getOriginalP = this.getPassbookInfo(passbooks[i].id);
        getOriginalP.then(originalPassbookInfo => {
          originalPassbooks[originalPassbookInfo.id]=(originalPassbookInfo);
        });
        originalPassbooksPromise.push(getOriginalP);*/
      }
      //Sanitize and encrypt services
      for (let i in services) {
        //services[i] = BookdbService.sanitizePassbook(services[i]);
        services[i] = await BookdbService.encryptService(services[i], null, this.encryptionKey);
      }

      if (this.db == null) {
        throw new Error('Database not found');
        //return 0;
      }
      const tx = this.db.transaction([PASSBOOKS, SERVICES], 'readwrite');
      const passbooksos = tx.objectStore(PASSBOOKS);
      const servicesos = tx.objectStore(SERVICES);


      for (let pb of passbooks) {
        let r = passbooksos.put(pb);

        r.onsuccess = e => {
          let et: any = e.target;
          //console.log('updatePassbook', e, et.result);
          //this.passbooksSubject.next();
          // this.passbookModified.next(pb);

        };
        r.onerror = err => {
          tx.abort();
          console.error(err, pb);
          throw new Error('Unable to import passbook')
        };
      }
      for (let s of services) {
        let r = servicesos.put(s);

        r.onsuccess = e => {
          let et: any = e.target;
          console.log('updateService', e, et.result);
        };
        r.onerror = err => {
          tx.abort();
          console.error(err, s);
          throw new Error('Unable to import service')
        };
      }
      tx.oncomplete = e => {
        this.passbooksSubject.next();
        this.servicesSubject.next();
        resolve(passbooks.length);
      };
      tx.onerror = e => {
        reject(tx.error);
      };
    });
  }

  updateService(serviceId: number, serviceInfo: IService): Promise<IService> {
    return new Promise(async (resolve, reject) => {
      serviceInfo.id = serviceId;
      if (this.db == null) {
        reject('Database not found');
        return;
      }
      let encrypted = await BookdbService.encryptService(serviceInfo, null, this.encryptionKey);

      const os = this.db.transaction(SERVICES, 'readwrite')
                      .objectStore(SERVICES);
      let r = os.put(encrypted);
      r.onsuccess = e => {
        let et: any = e.target;
        //console.log('updateService', e, et);
        //result.next(e.returnValue);
        resolve(serviceInfo);
        this.serviceModified.next(serviceInfo);
        this.snackbarMessage('Updated ' + serviceInfo.name);
      };

    });

  }
  // Encrypts the entire database. If the database is already
  // encrypted, it decrtyps it in memory first before encrypting
  // with the new password.
  // If newPassword is null, decrypts the database and saves it
  encryptDatabase(oldPassword: string | null,
    newPassword: string | null): Promise<string> {
    return new Promise(async (resolve, reject) => {
      if (this.db == null) {
        reject('Database not found');
        return;
      }

      // Since we can't perform async operations within a curosor
      // (AFAIK), we'll get all the records first in one transaction,
      // then decrypt / encryt them, then reinsert them in another
      // transaction
      let passbooks: IPassBook[] = [];
      let services: IService[] = [];
      try {
        passbooks = await this.passbooksGetAll();
      } catch (e) {
        reject('Unable to get passbooks: '+e.message);
        return;
      }

      try {
        services = await this.servicesGetAll();
      } catch (e) {
        reject('Unable to get services: '+e.message);
        return;
      }


      //passbooks and services values are already decrypted at this point
      /*
      for (let i in passbooks) {
        console.log('Encrypt', i, passbooks[i]);
        passbooks[i] = await BookdbService.encryptPassbook(
          passbooks[i], null, newPassword);
      }
      for (let i in services) {
        services[i] = await BookdbService.encryptService(
          services[i], null, newPassword);
      }*/
      let currentPassword = this.encryptionKey;
      let salt = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      if (newPassword != null)
        newPassword += ':' + salt;

      this.encryptionKey = newPassword;

      let result: number = 0;
      try {
        result = await this.updatePassbooksAndServices(passbooks, services);
      } catch (e) {
        this.encryptionKey = currentPassword;
        reject("Error encrypting/decrypting database:" + e.message);
        return;
      }

      if (newPassword != null) {

        let encryptedString = await EncryptionService.stringEncrypt(newPassword, newPassword.length + ' encrypted');
        let setSaltResult = await this.settingsSet('salt', salt);
        let setEncryptedResult = await this.settingsSet('encrypted', encryptedString);

        this.dbIsEncrypted = true;

        this.passbooksSubject.next();
        this.servicesSubject.next();

        if (newPassword != null)
          resolve('Database encrypted');
        else
          resolve('Database decrypted');

        } else {
          this.settingsSet('encrypted', '');
          this.settingsSet('salt', '');

          this.dbIsEncrypted = false;

          this.passbooksSubject.next();
          this.servicesSubject.next();
          if (newPassword != null)
            resolve('Database encrypted');
          else
            resolve('Database decrypted');
        }

    });
  }
  private static async encryptPassbook(passbook: IPassBook, oldPassword: string | null, newPassword: string | null): Promise<IPassBook>{
    let result: IPassBook = { ...passbook };

    result = await BookdbService.decryptPassbook(result, oldPassword);
    if (newPassword != null) {
      result.name = await EncryptionService.stringEncrypt(newPassword, result.name);

      result.passphrase = await EncryptionService.stringEncrypt(newPassword, result.passphrase);
      result.visualPassphrase = await EncryptionService.stringEncrypt(newPassword, result.visualPassphrase);
    }

    return result;
  }
  private static async decryptPassbook(passbook: IPassBook, password: string | null): Promise<IPassBook> {
    if (password != null) {

      passbook.name = await EncryptionService.stringDecrypt(password, passbook.name);

      passbook.passphrase = await EncryptionService.stringDecrypt(password, passbook.passphrase);
      passbook.visualPassphrase = await EncryptionService.stringDecrypt(password, passbook.visualPassphrase);
    }
    return passbook;
  }
  private static async decryptPassbooks(passbooks: IPassBook[], password: string | null): Promise<IPassBook[]> {
    if (password != null) {
      let key = await EncryptionService.passwordToKey(password);
      for (const i in passbooks) {
        passbooks[i].name = await EncryptionService.stringDecryptWithKey(key, passbooks[i].name);
        passbooks[i].passphrase = await EncryptionService.stringDecryptWithKey(key, passbooks[i].passphrase);
        passbooks[i].visualPassphrase = await EncryptionService.stringDecryptWithKey(key, passbooks[i].visualPassphrase);

      }
    }
    return passbooks;
  }

  private static async encryptService(service: IService, oldPassword: string | null, newPassword: string | null): Promise<IService> {
    let result:IService = { ...service };
    if (oldPassword != null) {
      result = await BookdbService.decryptService(result, oldPassword);
    }
    if (newPassword != null) {
      result.name = await EncryptionService.stringEncrypt(newPassword, result.name);
      result.user = await EncryptionService.stringEncrypt(newPassword, result.user);
      if (result.icon != null)
        result.icon = await EncryptionService.stringEncrypt(newPassword, result.icon);

      if (result.customStrings != null)
        for (const i in result.customStrings) {
          result.customStrings[i] = await EncryptionService.stringEncrypt(newPassword, result.customStrings[i]);
        }
    }

    return result;
  }
  private static async decryptService(service: IService, password: string | null): Promise<IService> {
    let result: IService = { ...service };

    if (password != null) {
      result.name = await EncryptionService.stringDecrypt(password, result.name);
      result.user = await EncryptionService.stringDecrypt(password, result.user);
      if (result.icon != null)
        result.icon = await EncryptionService.stringDecrypt(password, result.icon);

      if (result.customStrings != null)
        for (const i in result.customStrings) {
          result.customStrings[i] = await EncryptionService.stringDecrypt(password, result.customStrings[i]);
        }
    }
    return result;
  }
  private static async decryptServices(services: IService[], password: string | null): Promise<IService[]> {
    if (password != null) {
      let key = await EncryptionService.passwordToKey(password);

      for (const i in services) {
        services[i].name = await EncryptionService.stringDecryptWithKey(key, services[i].name);
        services[i].user = await EncryptionService.stringDecryptWithKey(key, services[i].user);
        let ico = services[i].icon;
        if (ico != null) {
          services[i].icon = await EncryptionService.stringDecryptWithKey(key, ico);
        }
        let cs = services[i].customStrings;
        if (cs != null)
          for (const i2 in cs) {
            cs[i2] = await EncryptionService.stringDecryptWithKey(key, cs[i2]);
          }
        services[i].customStrings = cs;
      }
    }
    return services;
  }

  deletePassbook(passbookId: number): Promise<IPassBook> {
    return new Promise((resolve, reject) => {

      this.getPassbookInfo(passbookId).then(passbookInfo => {
        // Get all services for the passbook
          if (this.db == null) {
            reject('Database not found');
            return;
          }
        const txsvc = this.db.transaction(SERVICES, 'readwrite');
        const oss = txsvc.objectStore(SERVICES);
        const idxsvc = oss.index("PassbookIndex");
        let passbookServices: IService[] = [];
        let pdestroy = idxsvc.openCursor(passbookId);
        pdestroy.onsuccess = () => {
          var cursor = pdestroy.result;
          if (cursor) {
            passbookServices.push(cursor.value);
            cursor.delete();
            cursor.continue();
          }
        };
        txsvc.oncomplete = () => {
          //Then, delete the passbook
            if (this.db == null) {
              reject('Database not found');
              return;
            }

            const osp = this.db.transaction(PASSBOOKS, 'readwrite')
              .objectStore(PASSBOOKS);

            let r = osp.delete(passbookId);
            r.onsuccess = evp => {
              this.passbookRemoved.next(passbookInfo);
              this.passbooksSubject.next();
              resolve(passbookInfo);

              this._snackBar.open('Removed ' + passbookInfo.name,
                'Undo',
                { duration: 20000 })
                .onAction().subscribe(() => {
                  //delete serviceInfo.id;
                  //Undo button pressed
                  if (passbookInfo.id == null)
                    return;
                  this.createBook(passbookInfo, passbookServices);
                });
          };
          r.onerror = e => {
            reject(e);
          };
          };
        });
    });
  }
  deleteService(serviceId: number): Promise<IService>{
    return new Promise((resolve, reject) => {
      this.getServiceInfo(serviceId).subscribe((serviceInfo) => {
        if (this.db == null) {
          reject('Database not found');
          return;
        }
        const os = this.db.transaction(SERVICES, 'readwrite')
                       .objectStore(SERVICES);
        let r = os.delete(serviceId);

        r.onsuccess = e => {
          let et: any = e.target;
          //console.log('deleteService', e, et);
          //result.next(e.returnValue);
          //this.servicesSubject.next();
          this.serviceRemoved.next(serviceInfo);

          resolve(serviceInfo);

          this._snackBar.open('Removed ' + serviceInfo.name,
            'Undo',
            { duration: 10000 })
            .onAction().subscribe(() => {
              //delete serviceInfo.id;
              //Undo button pressed
              if (serviceInfo.passbookId == null)
                return;
              this.createService(serviceInfo.passbookId, serviceInfo);
            });
        };
        r.onerror = e => {
          console.error(e);
          this.snackbarMessage('Error: ' + e);
          reject(e);
        };
      });
    });
  }
}
