import axios from './axios';

export const createSpeciesRequest = speciesValues => axios.post('/species', speciesValues, {
    headers: {
      'Content-Type': 'multipart/form-data', 
    },
  });

export const updateSpeciesRequest = (speciesId, speciesValues) => axios.put(`/species/${speciesId}`, speciesValues, {
    headers: {
      'Content-Type': 'multipart/form-data', 
    },
  });

export const getSpeciesRequest = () => axios.get('/species');
export const getSpeciesByIdRequest = (speciesId) => axios.get(`/species/${speciesId}`);
export const deleteSpeciesRequest = (speciesId) => axios.delete(`/species/${speciesId}`);