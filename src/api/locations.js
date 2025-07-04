import axios from './axios';

export const createLocationRequest = locationValues => axios.post('/location', locationValues);
export const updateLocationRequest = (locationId, locationValues) => axios.put(`/location/${locationId}`, locationValues);
export const getLocationsRequest = () => axios.get('/location');
export const getLocationRequest = (locationId) => axios.get(`/location/${locationId}`);
export const deleteLocationRequest = (locationId) => axios.delete(`/location/${locationId}`);   
export const getLocationsByCountryRequest = (countryId) => axios.get(`/location/country/${countryId}`);