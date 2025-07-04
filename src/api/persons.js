import axios from './axios';


//Get all trait types from the database
export const getPersonsRequest = () => axios.get('/person');

export const createPersonRequest = (personValues) => axios.post('/person', personValues);
export const updatePersonRequest = (personId, personValues) => axios.put(`/person/${personId}`, personValues);
export const getPersonRequest = (personId) => axios.get(`/person/${personId}`);
export const deletePersonRequest = (personId) => axios.delete(`/person/${personId}`);