import axios from './axios';

export const createOrganismRequest = speciesValues => axios.post('/organism', speciesValues);

export const getAllOrganismsRequest = () => axios.get('/organism_all');

export const getFilteredOrganismsRequest = (filters) => axios.get(`/organism_filter/${filters}`);

export const getExportFilteredOrganismsRequest = (filters) => axios.get(`/organism_export/${filters}`,{responseType: 'blob'});