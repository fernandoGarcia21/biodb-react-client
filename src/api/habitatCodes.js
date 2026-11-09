import axios from './axios';

export const getHabitatCodesRequest = () => axios.get('/habitat_codes');
export const getHabitatStructuresRequest = () => axios.get('/habitat_structures');