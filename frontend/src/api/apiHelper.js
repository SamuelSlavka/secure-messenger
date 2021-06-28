import axios from 'axios';

const httpClient = axios.create({
  baseURL: process.env.VUE_APP_BASE_URL,
  timeout: 1000,
});

const getAuthToken = () => localStorage.getItem('token');

const authInterceptor = (config) => {
  // eslint-disable-next-line no-param-reassign
  config.headers.Authorization = getAuthToken();
  return config;
};

httpClient.interceptors.request.use(authInterceptor);

export default httpClient;
