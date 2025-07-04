import axios from './axios';

export const userLogin = (user) => axios.post('/auth', user);
export const userLogout = () => axios.post('/logout');
export const verifyToken = () => axios.get('/verify-token');