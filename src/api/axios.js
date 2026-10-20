import axios from 'axios';
import { API } from '../constants';

const instance = axios.create({
  baseURL: API,
  withCredentials: true
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined') {
      const status = error.response?.status;
      const code = error.response?.data?.code;

      // Preserve existing rate-limit handling
      if (status === 429) {
        window.location.replace('/errors/too-many-requests');
      }

      // Redirect only when the JWT has expired
      if (status === 401 && code === 'TOKEN_EXPIRED') {
        const loginPath = '/auth/sign-in';

        if (window.location.pathname !== loginPath) {
          window.location.replace(`${loginPath}?expired=true`);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
