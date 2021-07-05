import httpClient from '@/api/apiHelper';
import { createAccount } from '@/modules/web3Func';

const CryptoJS = require('crypto-js');

const REGISTER_END_POINT = '/auth/register';
const LOGIN_END_POINT = '/auth/login';
const LOGOUT_END_POINT = '/auth/logout';
const SAVE_ADDRESS_END_POINT = '/auth/saveaddress';

const login = async (username, password) => {
  const token = await httpClient.post(LOGIN_END_POINT, { username, password });

  if (token.access_token) {
    sessionStorage.setItem('token', token.access_token);

    // stores password in session storage
    sessionStorage.setItem('passwdKey', password);
    return true;
  }
  return false;
};

const logout = () => httpClient.get(LOGOUT_END_POINT);

const register = async (username, password) => {
  const token = httpClient.post(
    REGISTER_END_POINT,
    { username, password },
  );

  if (token.access_token) {
    sessionStorage.setItem('token', token.access_token);

    const acc = await createAccount();

    // fetch save account address in server
    httpClient.post(SAVE_ADDRESS_END_POINT, { address: acc.address, public: acc.publicKey });

    // stores encripterd private key in local storage
    localStorage.setItem('privateKey', (CryptoJS.AES.encrypt(acc.privateKey, password)));
    localStorage.setItem('publicKey', acc.publicKey);
    sessionStorage.setItem('passwdKey', password);

    return true;
  }
  return false;
};

export {
  login,
  register,
  logout,
};
