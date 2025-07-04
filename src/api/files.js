import axios from './axios';


export const getImageRequest = (image_name) => axios.get(`/images/${image_name}`);