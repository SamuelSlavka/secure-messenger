const CryptoJS = require('crypto-js');

// decrypts PK
export default function getPK() {
  const passwdKey = sessionStorage.getItem('passwdKey');

  const pk = localStorage.getItem('privateKey');

  const bytes = CryptoJS.AES.decrypt((pk.toString()), passwdKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}
