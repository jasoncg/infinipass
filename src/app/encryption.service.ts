import { Injectable } from '@angular/core';
import { toBase64String } from '@angular/compiler/src/output/source_map';
import * as base64_arraybuffer from 'base64-arraybuffer';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {

  constructor() { }


  static async passwordToKey(password: string): Promise<CryptoKey> {
    let encoder = new TextEncoder();

    let passkey = await window.crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    var dkey = await window.crypto.subtle.deriveKey(
      {
        "name": "PBKDF2",
        "salt": encoder.encode("the salt is this random string"),
        "iterations": 50000,
        "hash": "SHA-512"
      },
      passkey,
      {
        "name": "AES-GCM",
        "length": 128
      },
      false,
      ["encrypt", "decrypt"]
    );

    return dkey;
  }

  static stringEncrypt(password: string, data: string): Promise<string> {
    return new Promise((resolve, reject) => {
      EncryptionService.passwordToKey(password).then(dkey => {
        resolve(EncryptionService.stringEncryptWithKey(dkey, data));
      });
    });
  }
  static stringEncryptWithKey(dkey: CryptoKey, data: string): Promise<string> {
    return new Promise((resolve, reject) => {
      //console.log('stringEncrypt', password);

      let encoder = new TextEncoder();
      let decoder = new TextDecoder("utf8");

      let encoded = encoder.encode(data);


      let ep = window.crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: new Uint8Array((128 / 8))
        },
        dkey,
        encoded);

      ep.then(
        (result) => {
          var d = decoder.decode(result);
          //console.log('DECODED:', d);
          //let b64 =Base64.encode(result);

          resolve(base64_arraybuffer.encode(result));
        },
        (e) => {
          console.error(e);
          reject("Error while encrypting data: " + e.message);
        }
      );

      });

  }

  static stringDecrypt(password: string, data: string): Promise<string> {
    return new Promise((resolve, reject) => {
      EncryptionService.passwordToKey(password).then(dkey => {
        resolve(EncryptionService.stringDecryptWithKey(dkey, data));
      });
    });
  }
  static stringDecryptWithKey(dkey: CryptoKey, data: string): Promise<string> {
    return new Promise((resolve, reject) => {
      //let encoder = new TextEncoder();
      let decoder = new TextDecoder("utf8");

      let encoded = base64_arraybuffer.decode(data);

      let ep = window.crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: new Uint8Array((128 / 8))
        },
        dkey,
        encoded);
      ep.then(
        (result) => {
          var d = decoder.decode(result);

          resolve(d);
        },
        (e) => {
          console.error(e);
          reject("Error while decrypting data: " + e.message);
        }
      );
    });
  }

}
