import axios from './axios';


//Get the counts of organisms by species from the database
export const getSpeciesCountsRequest = () => axios.get('/home_report/species_counts');
//Get the counts of traits with data from the database
export const getTraitsDataCountsRequest = () => axios.get('/home_report/traits_data_counts');
//Get the counts of organisms by location from the database
export const getLocationOrganismsCountsRequest = () => axios.get('/home_report/location_organisms_counts');
//Get the latest datasets from the database
export const getLatestDatasetsRequest = () => axios.get('/home_report/latest_datasets');
//Get the counts of organisms by sampling area from the database
export const getSamplingAreaCountsRequest = () => axios.get('/home_report/sampling_area_counts');
//Get the dashboard stats from the database
export const getDashboardStatsRequest = () => axios.get('/home_report/dashboard_stats');