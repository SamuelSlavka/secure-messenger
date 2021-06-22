import { serverAddr } from '../constants';

const CryptoJS = require('crypto-js');

// fetch from server
export async function fetchServer(url, body, method = 'post') {
  let response = '';
  const token = sessionStorage.getItem('token');
  if (method === 'get') {
    response = await fetch(serverAddr + url, {
      method,
      headers: { Authorization: `Bearer ${token}` },
    });
  } else if (token !== null) {
    response = await fetch(serverAddr + url, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
  } else {
    response = await fetch(serverAddr + url, {
      method,
      body: JSON.stringify(body),
    });
  }

  const json = await response.json();
  return json;
}

// fetch contract address and abi
export async function getContractInfo() {
  return fetchServer('/api/info', {});
}

// decrypts PK
export function getPK() {
  try {
    const passwdKey = sessionStorage.getItem('passwdKey');

    const pk = localStorage.getItem('privateKey');

    const bytes = CryptoJS.AES.decrypt((pk.toString()), passwdKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (exceptionVar) {
    return 'No pk found';
  }
}

// returns list of usesr, that addres has communicated with
export async function getContacts(address, contactnum) {
  try {
    return await fetchServer('/api/contacts', { address, number: contactnum });
  } catch (exceptionVar) {
    return { result: 'No contacts found' };
  }
}

// reqestes founds
export async function askForMoney(address) {
  try {
    await fetchServer('/api/poor', { address });
    return 'Founds transfered';
  } catch (exceptionVar) {
    return 'No founds left';
  }
}

// return public key of adress
export async function getPublicKey(username, address) {
  try {
    return await fetchServer('/api/public', { username, address });
  } catch (exceptionVar) {
    return '';
  }
}

// return address for username
export async function getAddressFromName(username) {
  try {
    const ret = await fetchServer('/api/getuseraddress', { username });
    return ret.result;
  } catch (exceptionVar) {
    return '';
  }
}

// return public key of adress
export async function isUserRegistred(username, address) {
  try {
    const ret = await fetchServer('/api/isvalid', { username, address });

    if (ret.result === 1) {
      return true;
    }

    return false;
  } catch (exceptionVar) {
    return false;
  }
}
