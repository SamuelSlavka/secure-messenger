import httpClient from '@/api/apiHelper';

const CONTRACT_INFO_END_POINT = '/info/contract';
const CONTACTS_END_POINT = '/info/contacts';
const MESSAGES_END_POINT = '/info/messages';
const SET_MESSAGE_END_POINT = '/info/savemessage';
const FOUNDS_END_POINT = '/info/founds';

const getContractInfo = () => httpClient.get(CONTRACT_INFO_END_POINT);

const askForMoney = (address) => httpClient.post(FOUNDS_END_POINT, { address });

const getContacts = (address, contactnum) => httpClient.post(
  CONTACTS_END_POINT,
  { address, contactnum },
);

const getMessages = (recvAddress, sendAddress, offset, count) => httpClient.post(
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
) => httpClient.post(
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
