import axios from 'axios';

const httpClient = axios.create({
  baseURL: process.env.VUE_APP_BASE_URL,
  timeout: 1000,
});

const getAuthToken = () => localStorage.getItem('token');

// puts login into reqest if possible
httpClient.interceptors.config.use((config) => {
  // eslint-disable-next-line no-param-reassign
  config.headers.Authorization = getAuthToken();
  return config;
});

export default httpClient;
