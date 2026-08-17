import axios from './axios';

export const createTypeDatasetRequest = (typeDatasetValues) => axios.post('/type_dataset', typeDatasetValues);
export const updateTypeDatasetRequest = (typeDatasetId, typeDatasetValues) => axios.put(`/type_dataset/${typeDatasetId}`, typeDatasetValues);
export const getTypeDatasetsRequest = () => axios.get('/type_dataset');
export const getTypeDatasetRequest = (typeDatasetId) => axios.get(`/type_dataset/${typeDatasetId}`);
export const deleteTypeDatasetRequest = (typeDatasetId) => axios.delete(`/type_dataset/${typeDatasetId}`);