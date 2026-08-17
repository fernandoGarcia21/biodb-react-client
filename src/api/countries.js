import axios from './axios';

export const getCountriesRequest = () => axios.get('/country');
export const getCountriesWithLocationsRequest = () => axios.get('/country/withlocations');