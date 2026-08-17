import axios from './axios';


export const getImageRequest = (image_name) => axios.get(`/images/${image_name}`);
export const getImageBlobRequest = (image_name) => axios.get(`/images/${image_name}`, { responseType: 'blob' });
export const getFileRequest = (file_name) => axios.get(`/files/${file_name}`);
export const getBatchFileRequest = (batchId) => axios.get(`/batch_file/${batchId}`);
//The blob response type is used to handle binary data, such as images or files, in the response.
export const getDBLogoImageRequest = () => axios.get(`/db_logo`, { responseType: 'blob' });