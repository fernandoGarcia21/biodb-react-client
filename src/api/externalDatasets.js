import axios from './axios';

export const createExternalDatasetRequest = (externalDatasetValues) => axios.post('external_dataset', externalDatasetValues);
export const updateExternalDatasetRequest = (externalDatasetId, externalDatasetValues) => axios.put(`external_dataset/${externalDatasetId}`, externalDatasetValues);
export const getExternalDatasetsRequest = () => axios.get('external_dataset');
export const getExternalDatasetRequest = (externalDatasetId) => axios.get(`external_dataset/${externalDatasetId}`);
export const deleteExternalDatasetRequest = (externalDatasetId) => axios.delete(`external_dataset/${externalDatasetId}`);