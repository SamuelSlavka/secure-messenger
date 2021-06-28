import httpClient from './apiHelper';

const END_POINT = '/auth';

const login = (username, password) => httpClient.post(END_POINT, { username, password });
const register = (username, password) => httpClient.post(END_POINT, { username, password });
const logout = () => httpClient.get(END_POINT);

export {
  login,
  register,
  logout,
};
