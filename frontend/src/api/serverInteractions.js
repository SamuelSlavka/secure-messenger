import axios from 'axios';

const CONTRACT_INFO_END_POINT = '/contract';
const CONTACTS_END_POINT = '/contacts';
const MESSAGES_END_POINT = '/messages';
const SET_MESSAGE_END_POINT = '/savemessage';
const FOUNDS_END_POINT = '/poor';

const getContractInfo = () => axios.get(CONTRACT_INFO_END_POINT);

const askForMoney = (address) => axios.post(FOUNDS_END_POINT, { address });

const getContacts = (...args) => axios.post(CONTACTS_END_POINT, { ...args });

const getMessages = (...args) => axios.post(MESSAGES_END_POINT, { ...args });

const setMessage = (...args) => axios.post(SET_MESSAGE_END_POINT, { ...args });

export {
  getContractInfo,
  getContacts,
  getMessages,
  setMessage,
  askForMoney,
};
