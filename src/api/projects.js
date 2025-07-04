import axios from './axios';

export const createProjectRequest = (projectValues) => axios.post('/project', projectValues);
export const updateProjectRequest = (projectId, projectValues) => axios.put(`/project/${projectId}`, projectValues);
export const getProjectsRequest = () => axios.get('/project');
export const getProjectRequest = (projectId) => axios.get(`/project/${projectId}`);
export const deleteProjectRequest = (projectId) => axios.delete(`/project/${projectId}`);
export const getProjectExternalDatasetsRequest = (projectId) => axios.get(`/project/${projectId}/external_datasets`);
export const getAvailableProjectExternalDatasetsRequest = (projectId) => axios.get(`/project/${projectId}/available_external_datasets`);
export const createProjectExternalDatasetRequest = (projectId, externalDatasetId) => axios.post(`/project/${projectId}/external_datasets`, { external_dataset_id: externalDatasetId });
export const deleteProjectExternalDatasetRequest = (projectExternalDatasetId) => axios.delete(`/project/${projectExternalDatasetId}/external_datasets`);