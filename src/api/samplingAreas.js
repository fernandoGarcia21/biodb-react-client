import axios from './axios';

export const createSamplingAreaRequest = samplingAreaValues => axios.post('/sampling_area', samplingAreaValues, {
    headers: {
      'Content-Type': 'multipart/form-data', 
    },
  });

export const updateSamplingAreaRequest = (samplingAreaId, samplingAreaValues) => axios.put(`/sampling_area/${samplingAreaId}`, samplingAreaValues, {
    headers: {
      'Content-Type': 'multipart/form-data', 
    },
  });
export const getSamplingAreasRequest = () => axios.get('/sampling_area');
export const getAllSamplingAreasLocationsRequest = () => axios.get('/sampling_area/locations/');
export const getSamplingAreaRequest = (samplingAreaId) => axios.get(`/sampling_area/${samplingAreaId}`);
export const deleteSamplingAreaRequest = (samplingAreaId) => axios.delete(`/sampling_area/${samplingAreaId}`);   