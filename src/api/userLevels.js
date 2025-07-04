import axios from './axios';


//Get all user levels from the database
export const getUserLevelsRequest = () => axios.get('/user_level');