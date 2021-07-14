import axios from 'axios';

const CONTRACT_INFO_END_POINT = '/contract';
const CONTACTS_END_POINT = '/contacts';
const MESSAGES_END_POINT = '/messages';
const SET_MESSAGE_END_POINT = '/savemessage';
const FOUNDS_END_POINT = '/poor';

const getContractInfo = () => axios.get(CONTRACT_INFO_END_POINT);

const askForMoney = (address) => axios.post(FOUNDS_END_POINT, { address });

const getContacts = (address, contactnum) => axios.post(
  CONTACTS_END_POINT,
  { address, contactnum },
);

const getMessages = (recvAddress, sendAddress, offset, count) => axios.post(
  MESSAGES_END_POINT,
  {
    recvAddress,
    sendAddress,
    offset,
    count,
  },
);

const setMessage = (
  recvAddress,
  sendAddress,
  recvName,
  sendName,
  timestamp,
  recvContents,
  sendContents,
) => axios.post(
  SET_MESSAGE_END_POINT,
  {
    recvAddress,
    sendAddress,
    recvName,
    sendName,
    timestamp,
    recvContents,
    sendContents,
  },
);

export {
  getContractInfo,
  getContacts,
  getMessages,
  setMessage,
  askForMoney,
};
