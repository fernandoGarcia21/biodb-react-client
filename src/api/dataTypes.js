import axios from './axios';


//Get all data types from the database
export const getDataTypesRequest = () => axios.get('/data_type');