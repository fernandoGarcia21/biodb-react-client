import axios from './axios';

export const getAllHabitatsRequest = () => axios.get('/habitat');
export const getHabitatRequest = (habitatId) => axios.get(`/habitat/${habitatId}`);