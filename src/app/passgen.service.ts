import { Injectable } from '@angular/core';
import { IPassBook, IService } from './bookdb.service';

export interface IHash {
  hash: any|null;
  d1: number;
  d2: number;
  d3: number;
  d4: number;
}

export interface IPasswordSettings {
  length: number;
  lowercase: boolean;
  uppercase: boolean;
  numbers: boolean;
  special: boolean;
  extraCharacters: string;
}

@Injectable({
  providedIn: 'root'
})
export class PassgenService {
  static visualizationCharacters = '😀😁😂🤣😃😄😅😆😉😊😋😎😍😘🥰😗😙😚🙂🤗🤩🤔🤨😐😑😶🙄😏😣😥😮🤐😯😪😫😴😌😛😜😝🤤😒😓😔😕🙃🤑😲🙁😖😞😟😤😢😭😦😧😨😩🤯😬😰😱🥵🥶😳🤪😵😡😠🤬😷🤒🤕🤢🤮🤧😇🤠🤡🥳🥴🥺🤥🤫🤭🧐🤓😈👿👹👺💀👻👽🤖😺😸😹😻😼😽🙀😿😾👩‍⚕️👨‍⚕️👩‍🌾👨‍🌾👩‍🍳👨‍🍳👩‍🎓👨‍🎓👩‍🎤👨‍🎤👩‍🏫👨‍🏫👩‍🏭👨‍🏭👩‍💻👨‍💻👩‍💼👨‍💼👩‍🔧👨‍🔧👩‍🔬👨‍🔬👩‍🎨👨‍🎨👩‍🚒👨‍🚒👩‍🚀👨‍🚀👩‍⚖️👨‍⚖️👰🤵👸🤴🤶🎅🧥👚👕👖👔👗👙👘👠👡👢👞👟🥾🥿🧦🧤🧣🎩🧢👒🎓⛑👑👝👛👜💼🎒👓🕶🥽🥼🌂🧵🧶🐶🐱🐭🐹🐰🦊🦝🐻🐼🦘🦡🐨🐯🦁🐮🐷🐽🐸🐵🙈🙉🙊🐒🐔🐧🐦🐤🐣🐥🦆🦢🦅🦉🦚🦜🦇🐺🐗🐴🦄🐝🐛🦋🐌🐚🐞🐜🦗🕷🕸🦂🦟🦠🐢🐍🦎🦖🦕🐙🦑🦐🦀🐡🐠🐟🐬🐳🐋🦈🐊🐅🐆🦓🦍🐘🦏🦛🐪🐫🦙🦒🐃🐂🐄🐎🐖🐏🐑🐐🦌🐕🐩🐈🐓🦃🕊🐇🐁🐀🐿🦔🐾🐉🐲🌵🎄🌲🌳🌴🌱🌿☘️🍀🎍🎋🍃🍂🍁🍄🌾💐🌷🌹🥀🌺🌸🌼🌻🌞🌝🌛🌜🌚🌕🌖🌗🌘🌑🌒🌓🌔🌙🌎🌍🌏💫⭐️🌟✨⚡️☄️💥🔥🌪🌈☀️🌤⛅️🌥☁️🌦🌧⛈🌩🌨❄️☃️⛄️🌬💨💧💦☔️☂️🌊🌫🚗🚕🚙🚌🚎🏎🚓🚑🚒🚐🚚🚛🚜🛴🚲🛵🏍🚨🚔🚍🚘🚖🚡🚠🚟🚃🚋🚞🚝🚄🚅🚈🚂🚆🚇🚊🚉✈️🛫🛬🛩💺🛰🚀🛸🚁🛶⛵️🚤🛥🛳⛴🚢⚓️⛽️🚧🚦🚥🚏🗺🗿🗽🗼🏰🏯🏟🎡🎢🎠⛲️⛱🏖🏝🏜🌋⛰🏔🗻🏕⛺️🏠🏡🏘🏚🏗🏭🏢🏬🏣🏤🏥🏦🏨🏪🏫🏩💒🏛⛪️🕌🕍🕋⛩🛤🛣🗾🎑🏞🌅🌄🌠🎇🎆🌇🌆🏙🌃🌌🌉🌁⌚️📱📲💻⌨️🖥🖨🖱🖲🕹🗜💽💾💿📀📼📷📸📹🎥📽🎞📞☎️📟📠📺📻🎙🎚🎛⏱⏲⏰🕰⌛️⏳📡🔋🔌💡🔦🕯🗑🛢💸💵💴💶💷💰💳🧾💎⚖️🔧🔨⚒🛠⛏🔩⚙️⛓🔫💣🔪🗡⚔️🛡🚬⚰️⚱️🏺🧭🧱🔮🧿🧸📿💈⚗️🔭🧰🧲🧪🧫🧬🧯🔬🕳💊💉🌡🚽🚰🚿🛁🛀🛀🏻🛀🏼🛀🏽🛀🏾🛀🏿🧴🧵🧶🧷🧹🧺🧻🧼🧽🛎🔑🗝🚪🛋🛏🛌🖼🛍🧳🛒🎁🎈🎏🎀🎊🎉🧨🎎🏮🎐🧧✉️📩📨📧💌📥📤📦🏷📪📫📬📭📮📯📜📃📄📑📊📈📉🗒🗓📆📅📇🗃🗳🗄📋📁📂🗂🗞📰📓📔📒📕📗📘📙📚📖🔖🔗📎🖇📐📏📌📍✂️🖊🖋✒️🖌🖍📝✏️🔍🔎🔏🔐🔒🔓';
  textEncoder: TextEncoder = new TextEncoder();
  textDecoder: TextDecoder = new TextDecoder();
  validCharacters = {
    'lowercase' : 'abcdefghijklmnopqrstuvwxyz',
    'uppercase' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    'numbers'   : '0123456789',
    'special'   : '~!@#$%^&*()_+'
  };

  constructor() { }

  static getPasswordSettings(passbook: IPassBook, service: IService): IPasswordSettings {

    return <IPasswordSettings>{
      length: service.passwordLength,
      lowercase: passbook.passwordIncludeLower,
      uppercase: passbook.passwordIncludeUpper,
      numbers: passbook.passwordIncludeNumbers,
      special: passbook.passwordIncludeSpecial,
      extraCharacters: passbook.passwordIncludeCustom
    };
  }

  /// Creates a random number genertor with the specified 128 bit (4 32 bit ints) seed
  sfc32(a: number, b: number, c: number, d: number) {
    //from https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
    return function () {
      a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
      var t = (a + b) | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = (c << 21 | c >>> 11);
      d = d + 1 | 0;
      t = t + d | 0;
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    }
  }
  static shuffle(str: string, rng: any) : string{
    //based on https://github.com/Daplie/knuth-shuffle
    let array = [...str];
    let currentIndex:number = array.length;
    let temporaryValue: string='';
    let randomIndex: number = 0;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(rng() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array.join('')
  }

  /// Generates a hash and RNG seed using the passbook and service information
  async generateHashWebCrypto(passphrase: string,
                              serviceName: string,
                              userName: string = '',
                              version: number = 0): Promise<IHash> {
    var passwordarr = this.textEncoder.encode(passphrase);
    let user: string = '';
    if (userName != null)
      user = userName;

    var saltarr = this.textEncoder.encode(user + "@" + serviceName + ":" + version);

    var starttime = (new Date).getTime();
    let keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      passwordarr, 
      "PBKDF2",
      false,
      ["deriveBits", "deriveKey"]
    );
    let key = await window.crypto.subtle.deriveKey(
      {
        "name": "PBKDF2",
        salt: saltarr,
        "iterations": 20480,
        "hash": "SHA-512"
      },
      keyMaterial,
      { "name": "AES-GCM", "length": 128 },
      //{ "name": 'AES-CBC', "length": 128 },
      true,
      ["encrypt", "decrypt"]
    );
    var hash = new Uint8Array(await crypto.subtle.exportKey("raw", key));

    //this.hash = asmcrypto.Pbkdf2HmacSha512(passwordarr, saltarr, 20000, 16);
    //let hash = asmcrypto.Pbkdf2HmacSha512(passwordarr, saltarr, 2048, 16);

    var endtime = (new Date).getTime();
    //console.log('Hash Time (webcrypto)', endtime - starttime);

    let resultHash: IHash = {
      hash: hash,
      d1: (hash[0] << 24) + (hash[1] << 26) + (hash[2] << 8) + (hash[3]),
      d2: (hash[4] << 24) + (hash[5] << 26) + (hash[6] << 8) + (hash[7]),
      d3: (hash[8] << 24) + (hash[9] << 26) + (hash[10] << 8) + (hash[11]),
      d4: (hash[12] << 24) + (hash[13] << 26) + (hash[14] << 8) + (hash[15])
    };

    //console.log('webcrypto', resultHash);
    return resultHash;
  }

  //Generates a visual representation of a passphrase
  async visualizePassphrase(passphrase: string): Promise<string> {
    let hash = await this.generateHashWebCrypto(passphrase, '', '', 0);

    let rng = this.sfc32(hash.d1, hash.d2, hash.d3, hash.d4);
    let characters = [...PassgenService.visualizationCharacters];

    let password = '';
    let length = 3;
    for (var i = 0; i < length; i++) {
      password += characters[(Math.floor(rng() * characters.length))];
    }
   // console.log('Visual passphrase: ', '['+password+']');
    return password;
  }

  /// Generates a password from the hash/RNG seed
  generatePassword(hash: IHash, settings: IPasswordSettings): string {

    let rng = this.sfc32(hash.d1, hash.d2, hash.d3, hash.d4);
    //console.log('RNG:', rng(), rng());
    let password = '';

    let vc = 0;
    let classes: string[] = [];

    if (settings.lowercase)
      classes.push(this.validCharacters.lowercase);
    if (settings.uppercase)
      classes.push(this.validCharacters.uppercase);
    if (settings.numbers)
      classes.push(this.validCharacters.numbers);
    if (settings.special)
      classes.push(this.validCharacters.special);

    if (settings.extraCharacters && settings.extraCharacters.length > 0)
      classes.push(settings.extraCharacters);

    if (classes.length == 0) {
      //Add all classes if none specified
      classes.push(this.validCharacters.lowercase);
      classes.push(this.validCharacters.uppercase);
      classes.push(this.validCharacters.numbers);
      classes.push(this.validCharacters.special);
    }
    for (var i = 0; i < settings.length; i++) {
      let characters = classes[vc];
      password += characters.charAt(Math.floor(rng() * characters.length));
      vc++;
      vc = vc % classes.length;
    }
    //console.log('Password Settings', settings, classes, password);
    return PassgenService.shuffle(password, rng);
  }

  /// Generates a PIN from the hash/RNG seed
  generatePin(hash: IHash, length: number): string {
    return this.generatePassword(hash, <IPasswordSettings>{
      length: length,
      numbers: true
    });
  }
}
