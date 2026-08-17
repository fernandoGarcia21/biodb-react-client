import axios from './axios';

export const createUserRequest = userValues => axios.post('/user', userValues);
export const getUsersRequest = () => axios.get('/user/all');
export const getUserRequest = (id) => axios.get(`/user/all/${id}`);
export const getUserNamesRequest = (id) => axios.get(`/user/${id}`);
export const activateUserRequest = (id) => axios.put(`/user/activate/${id}`);
export const deactivateUserRequest = (id) => axios.put(`/user/deactivate/${id}`);
export const updateUserRequest = (userId, userValues) => axios.put(`/user/${userId}`, userValues);
export const updatePasswordRequest = (userId, userValues) => axios.put(`/user/password/${userId}`, userValues);

