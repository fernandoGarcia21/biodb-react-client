import axios from 'axios';
import { API } from '../constants';

const instance = axios.create({ baseURL: API,
              withCredentials: true });

// Response interceptor to handle 429 errors
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      // Redirect to 429 error page
      if (typeof window !== 'undefined') {
        window.location.href = '/errors/too-many-requests';
      }
    }
    return Promise.reject(error);
  }
);

export default instance;