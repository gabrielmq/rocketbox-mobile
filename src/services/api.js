import axios from 'axios';

const api = axios.create({
  baseURL: 'https://omnistack-rocketbox-api.herokuapp.com'
});

export default api;
