import axios from './axios';

export const createBatchRequest = (batchValues) => axios.post('/batch_upload', batchValues, {
    headers: {
      'Content-Type': 'multipart/form-data', 
    },
  });

export const getBatchProcessesRequest = () => axios.get('/batch_upload');
export const getBatchProcessByIdRequest = (id) => axios.get(`/batch_upload/${id}`);
export const updateBatchRequest = (id, batchValues) => axios.put(`/batch_upload/update/${id}`, batchValues);
export const refreshMaterializedViewsRequest = () => axios.post('/batch_upload/refresh');
