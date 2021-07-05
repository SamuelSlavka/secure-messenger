import httpClient from '@/api/apiHelper';

const PUBLIC_END_POINT = '/user/public';
const GET_ADDRESS_END_POINT = '/user/address';
const GET_REGISTERES_END_POINT = '/user/registered';

const getAddressFromName = (username) => httpClient.post(GET_ADDRESS_END_POINT, { username });
const getPublicKey = (username, address) => httpClient.post(
  PUBLIC_END_POINT,
  { username, address },
);
const getIsUserRegistred = (username, address) => httpClient.post(
  GET_REGISTERES_END_POINT,
  { username, address },
);

export {
  getPublicKey,
  getAddressFromName,
  getIsUserRegistred,
};
