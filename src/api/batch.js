import axios from './axios';

export const createBatchRequest = (batchValues) => axios.post('/batch_upload', batchValues, {
    headers: {
      'Content-Type': 'multipart/form-data', 
    },
  });

export const getBatchProcessesRequest = () => axios.get('/batch_upload');
export const refreshMaterializedViewsRequest = () => axios.post('/batch_upload/refresh');
