import { AboutUs } from "./components/dashboard/overview/about-us";

export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
  dashboard: {
    overview: '/dashboard',
    aboutUs: '/dashboard/about',
    account: '/dashboard/account',
    customers: '/dashboard/customers',
    users: '/dashboard/users',
    species: '/dashboard/species',
    speciesCreate: '/dashboard/species/create/',
    speciesUpdate: (speciesId: number | string) => `/dashboard/species/update/${speciesId}`,
    organisms: (params?: { speciesId?: number | string; locationId?: number | string; samplingAreaId?: number | string }) => {
      const query = new URLSearchParams();
      if (params?.speciesId !== undefined) query.set('speciesId', String(params.speciesId));
      if (params?.locationId !== undefined) query.set('locationId', String(params.locationId));
      if (params?.samplingAreaId !== undefined) query.set('samplingAreaId', String(params.samplingAreaId));
      const qs = query.toString();
      return qs ? `/dashboard/organisms?${qs}` : '/dashboard/organisms';
    },
    traits: '/dashboard/traits',
    properties: '/dashboard/properties',
    traitProperties: (traitId: number | string) => `/dashboard/properties/${traitId}`,
    traitPropertiesCreate: (traitId: number | string) => `/dashboard/properties/${traitId}/create`,
    traitPropertiesUpdate: (propertyId: number | string) => `/dashboard/properties/update/${propertyId}`,
    traitUpdate: (traitId: number | string) => `/dashboard/traits/update/${traitId}`,
    traitCreate: '/dashboard/traits/create',
    integrations: '/dashboard/integrations',
    settings: '/dashboard/settings',
    batchProcesses: '/dashboard/batch',
    batchReview: (batchId: number | string) => `/dashboard/batch/review/${batchId}`,
    organismsBatchCreate: '/dashboard/organisms/batch/create',
    organismsBatchDelete: '/dashboard/organisms/batch/delete',
    locations: '/dashboard/location',
    locationUpdate: (locationId: number | string) => `/dashboard/location/update/${locationId}`,
    locationCreate: '/dashboard/location/create/',
    locationPropertiesAdd: (locationId: number | string) =>  `/dashboard/location/properties/add/${locationId}`,
    locationPropertyUpdate: (locationPropertyId: number | string) =>  `/dashboard/location/properties/update/${locationPropertyId}`,
    samplingAreas: '/dashboard/samplingarea',
    samplingAreaUpdate: (samplingAreaId: number | string) => `/dashboard/samplingarea/update/${samplingAreaId}`,
    samplingAreaCreate: '/dashboard/samplingarea/create/',
    projects: '/dashboard/projects',
    projectUpdate: (projectId: number | string) => `/dashboard/projects/update/${projectId}`,
    projectCreate: '/dashboard/projects/create',
    persons: '/dashboard/persons',
    personUpdate: (personId: number | string) => `/dashboard/persons/update/${personId}`,
    personCreate: '/dashboard/persons/create',
    userUpdate: (userId: number | string) => `/dashboard/users/update/${userId}`,
    externalDatasets: '/dashboard/externaldatasets',
    externalDatasetUpdate: (externalDatasetId: number | string) => `/dashboard/externaldatasets/update/${externalDatasetId}`,
    externalDatasetCreate: '/dashboard/externaldatasets/create',
    typeDatasets: '/dashboard/typedatasets',
    typeDatasetUpdate: (typeDatasetId: number | string) => `/dashboard/typedatasets/update/${typeDatasetId}`,
    typeDatasetCreate: '/dashboard/typedatasets/create',

    //Paths to display pages instead of update
    externalDatasetDisplay: (externalDatasetId: number | string) => `/dashboard/externaldatasets/display/${externalDatasetId}`,
    locationDisplay: (locationId: number | string) => `/dashboard/location/display/${locationId}`,
    projectDisplay: (projectId: number | string) => `/dashboard/projects/display/${projectId}`,
    traitPropertiesDisplay: (propertyId: number | string) => `/dashboard/properties/display/${propertyId}`,
    samplingAreaDisplay: (samplingAreaId: number | string) => `/dashboard/samplingarea/display/${samplingAreaId}`,
    traitDisplay: (traitId: number | string) => `/dashboard/traits/display/${traitId}`,
  },
  errors: { notFound: '/errors/not-found', tooManyRequests: '/errors/too-many-requests' },
  legal: { cookiePolicy: '/legal/cookie-policy', privacyPolicy: '/legal/privacy-policy' },
};
