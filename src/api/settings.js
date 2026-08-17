import axios from './axios';

export const getAboutUsSettings = () => axios.get('/about_us');
export const getDBNameRequest = () => axios.get('/db_name');
export const getDBWelcomeMessageRequest = () => axios.get('/db_welcome_message');