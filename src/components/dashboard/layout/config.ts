import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'overview', title: 'Home', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'organisms', title: 'Organisms', href: paths.dashboard.organisms(), icon: 'organism' },
  //{ key: 'customers', title: 'Customers', href: paths.dashboard.customers, icon: 'user' },
  { key: 'persons', title: 'Persons', href: paths.dashboard.persons, icon: 'user' },
  { key: 'users', title: 'Users', href: paths.dashboard.users, icon: 'users' },
  { key: 'type-dataset', title: 'Types external dataset', href: paths.dashboard.typeDatasets, icon: 'dataset-logo' },
  { key: 'projects', title: 'Projects', href: paths.dashboard.projects, icon: 'project-calendar' },
  { key: 'species', title: 'Species', href: paths.dashboard.species, icon: 'fediverse-logo' },
  { key: 'locations', title: 'Locations', href: paths.dashboard.locations, icon: 'push-pin' },
  { key: 'sampling-areas', title: 'Sampling areas', href: paths.dashboard.samplingAreas, icon: 'map-pin-area' },
  { key: 'traits', title: 'All traits', href: paths.dashboard.traits, icon: 'trait' },
  { key: 'properties', title: 'Trait properties', href: paths.dashboard.properties, icon: 'property' },
  { key: 'external-datasets', title: 'External datasets', href: paths.dashboard.externalDatasets, icon: 'link' },
  { key: 'batch-processes', title: 'Batch processes', href: paths.dashboard.batchProcesses, icon: 'batch-robot' },
  //{ key: 'integrations', title: 'Integrations', href: paths.dashboard.integrations, icon: 'plugs-connected' },
  //{ key: 'settings', title: 'Settings', href: paths.dashboard.settings, icon: 'gear-six' },
  { key: 'about-us', title: 'About Us', href: paths.dashboard.aboutUs, icon: 'info' },
  { key: 'account', title: 'Log in', href: paths.auth.signIn, icon: 'user' },
  //{ key: 'error', title: 'Error', href: paths.errors.notFound, icon: 'x-square' },
] satisfies NavItemConfig[];
