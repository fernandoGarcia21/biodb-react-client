import axios from './axios';

//Add a new property value for a location
export const addLocationPropertyRequest = (propertyValues) => axios.post('/location_property', propertyValues);

//Get the information associated to one location property by its id
export const getLocationProperty = (locationPropertyId) => axios.get(`/location_property/${locationPropertyId}`);

//Get the properties for all traits and the value of the properties for a given location from the database
export const getAllPropertiesByLocation = (locationId) => axios.get(`/location_property/location/${locationId}`);

//Get the properties for all traits that are not associated to location but to individuals
export const getAllTraitPropertiesNoLocation = () => axios.get(`/location_property/individual/`);

//Get the properties for of a trait that are not assigned to a given location
export const getMissingPropertiesByTraitLocation = (traitId, locationId) => axios.get(`/location_property/trait/${traitId}/location/${locationId}`);

//Get the properties for all traits and the value of the properties for a given location from the database
export const deletePropertyFromLocation = (locationPropertyId) => axios.delete(`/location_property/${locationPropertyId}`);

//Add a new property value for a location
export const updateLocationPropertyRequest = (locationPropertyId, propertyValues) => axios.put(`/location_property/${locationPropertyId}`, propertyValues);