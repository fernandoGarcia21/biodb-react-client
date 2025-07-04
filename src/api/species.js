import axios from './axios';

export const createSpeciesRequest = speciesValues => axios.post('/species', speciesValues);

export const getSpeciesRequest = () => axios.get('/species');