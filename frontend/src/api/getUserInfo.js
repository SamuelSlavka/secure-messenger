import axios from 'axios';

const PUBLIC_END_POINT = '/public';
const GET_ADDRESS_END_POINT = '/address';
const GET_REGISTERES_END_POINT = '/registered';

const getAddressFromName = (username) => axios.post(GET_ADDRESS_END_POINT, { username });
const getPublicKey = (username, address) => axios.post(
  PUBLIC_END_POINT,
  { username, address },
);
const getIsUserRegistred = (username, address) => axios.post(
  GET_REGISTERES_END_POINT,
  { username, address },
);

export {
  getPublicKey,
  getAddressFromName,
  getIsUserRegistred,
};
