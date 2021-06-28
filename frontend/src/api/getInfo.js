import httpClient from './apiHelper';

const CryptoJS = require('crypto-js');

const END_POINT = '/info';

const getContractInfo = () => httpClient.get(END_POINT);
const getContacts = (address, contactnum) => httpClient.post(END_POINT, { address, contactnum });
const askForMoney = (address) => httpClient.post(END_POINT, { address });

export {
  getContractInfo,
  getContacts,
  askForMoney,
};
