export var currentPassbookId = 0;

export const passbooks = [
  {
    name: 'Default',
    passphrase: 'The quick brown fox jumped over the lazy dog',
    services: [
      { name: 'amazon.com', 'user': 'me@mymail.com', count:0, password: true, pin: true, passwordLength:12, pinLength:6, color:null, icon:null },
      { name: 'ebay.com', 'user': 'me@mymail.com', count: 0, password: true, pin: false, passwordLength: 12, pinLength: 6, color: null, icon: null },
  { name: 'wellsfargo.com', 'user': 'me@mymail.com', count: 0, password: true, pin: true, passwordLength: 12, pinLength: 6, color: null, icon: null }
    ]
  },{
    name: 'Social',
    passphrase: 'Testing 12345',
    services: [
      { name: 'facebook.com', 'user': 'me@mymail.com', count: 0, password: true, pin: false, passwordLength: 12, pinLength: 6, color: null, icon: null },
{ name: 'reddit.com', 'user': 'anon1', count: 0, password: true, pin: false, passwordLength: 12, pinLength: 6, color: null, icon: null },
{ name: 'wellsfargo.com', 'user': 'anon2', count: 0, password: true, pin: false, passwordLength: 12, pinLength: 6, color: null, icon: null }
    ]
  }
]
