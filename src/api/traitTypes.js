import axios from './axios';


//Get all trait types from the database
export const getTraitTypesRequest = () => axios.get('/trait_type');