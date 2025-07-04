import axios from './axios';

export const createTraitRequest = (traitValues) => axios.post('/trait', traitValues);
export const updateTraitRequest = (traitId, traitValues) => axios.put(`/trait/${traitId}`, traitValues);
export const getTraitsRequest = () => axios.get('/trait');
export const getTraitsByAssociationRequest = (isLocationAssociated) => axios.get(`/trait/association/${isLocationAssociated}`);
export const getTraitRequest = (traitId) => axios.get(`/trait/${traitId}`);
export const deleteTraitRequest = (traitId) => axios.delete(`/trait/${traitId}`);