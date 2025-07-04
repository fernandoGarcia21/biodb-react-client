import axios from './axios';

//Get one property from the database
export const getPropertyRequest = (propertyId) => axios.get(`/property/${propertyId}`);

//Get all properties with the name of their trait from the database
export const getPropertiesTraitRequest = () => axios.get(`/property_trait`);

//Create a new property for a trait
export const createTraitPropertyRequest = (propertyValues) => axios.post('/property', propertyValues);

//Update data of a property
export const updatePropertyRequest = (propertyId, propertyValues) => axios.put(`/property/${propertyId}`, propertyValues);

//Get all properties from the database
export const getPropertiesRequest = () => axios.get('/property');

//Get the properties for a specific trait Id from the database
export const getTraitPropertiesRequest = (traitId) => axios.get(`/property/trait/${traitId}`);

//Deletes one property from the database
export const deletePropertyRequest = (propertyId) => axios.delete(`/property/${propertyId}`);
