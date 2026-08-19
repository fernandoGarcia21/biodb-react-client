import axios from './axios';

export const getAllHabitatsRequest = () => axios.get('/habitat');
export const getHabitatRequest = (habitatId) => axios.get(`/habitat/${habitatId}`);
export const createHabitatRequest = (habitatData) => axios.post('/habitat', habitatData);
export const updateHabitatRequest = (habitatId, habitatData) => axios.put(`/habitat/${habitatId}`, habitatData);   
export const deleteHabitatRequest = (habitatId) => axios.delete(`/habitat/${habitatId}`);