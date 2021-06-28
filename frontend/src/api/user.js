import httpClient from './apiHelper';

const END_POINT = '/user';

const getPublicKey = (username, address) => httpClient.post(END_POINT, { username, address });
const getAddressFromName = (username) => httpClient.post(END_POINT, { username });
const isUserRegistred = (username, address) => httpClient.post(END_POINT, { username, address });

export {
  getPublicKey,
  getAddressFromName,
  isUserRegistred,
};
