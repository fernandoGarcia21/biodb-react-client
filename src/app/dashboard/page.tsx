"use client";
import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import Grid from '@mui/material/Grid';
import dayjs from 'dayjs';

import { Species } from '@/components/dashboard/overview/species';
import { AboutUs } from '@/components/dashboard/overview/about-us';
import { LatestDatasets } from '@/components/dashboard/overview/latest-datasets';
import { Locations } from '@/components/dashboard/overview/locations';
import { Traits } from '@/components/dashboard/overview/traits';
import { MapOverview } from '@/components/dashboard/overview/map-overview';
import { useBrandTitle } from '@/hooks/use-brand-title';

import { getSpeciesCountsRequest, getLocationOrganismsCountsRequest, getTraitsDataCountsRequest, getLatestDatasetsRequest, getSamplingAreaCountsRequest, getDashboardStatsRequest } from '@/api/homeReports'; // Importing this to ensure the API is initialized, if needed

export default function Page(): React.JSX.Element {
  const brandTitle = useBrandTitle();

  const isMounted = useRef(false);
  const [speciesCounts, setSpeciesCounts] = useState<any[]>([]);
  const [traitsCounts, setTraitsCounts] = useState<any[]>([]);
  const [latestDatasets, setLatestDatasets] = useState<any[]>([]);
  const [customCategories, setCustomCategories] = useState<any[]>([]);
  const [locationOrganismsObjects, setLocationOrganismsObjects] = useState<any[]>([]);
  const [samplingAreasCoordinates, setSamplingAreasCoordinates] = useState<
    { id: number; name: string; latitude: number; longitude: number; number_individuals: number, habitat_name: string }[]
  >([]);
  const [totalSamples, setTotalSamples] = useState<number>(0);
  const [speciesCount, setSpeciesCount] = useState<number>(0);
  const [activeProjects, setActiveProjects] = useState<number>(0);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // Function to parse and validate latitude and longitude values
  // This function takes a raw value and an axis ('latitude' or 'longitude') 
  // and returns a valid number or null if invalid.
  const parseCoordinate = React.useCallback((rawValue: unknown, axis: 'latitude' | 'longitude'): number | null => {
    if (typeof rawValue === 'number' && Number.isFinite(rawValue)) {
      const isValidRange = axis === 'latitude'
        ? rawValue >= -90 && rawValue <= 90
        : rawValue >= -180 && rawValue <= 180;
      return isValidRange ? rawValue : null;
    }

    if (typeof rawValue !== 'string') {
      return null;
    }

    const trimmedValue = rawValue.trim();
    const match = trimmedValue.match(/^([+-]?\d+(?:\.\d+)?)\s*([NSEW])?$/i);
    if (!match) {
      return null;
    }

    let numericValue = Number(match[1]);
    const suffix = match[2]?.toUpperCase();

    if (suffix) {
      if (axis === 'latitude' && !['N', 'S'].includes(suffix)) {
        return null;
      }

      if (axis === 'longitude' && !['E', 'W'].includes(suffix)) {
        return null;
      }

      if (suffix === 'S' || suffix === 'W') {
        numericValue = -Math.abs(numericValue);
      }
    }

    const isValidRange = axis === 'latitude'
      ? numericValue >= -90 && numericValue <= 90
      : numericValue >= -180 && numericValue <= 180;

    return isValidRange ? numericValue : null;
  }, []);

      useEffect(() => {
      const fetchHomeReports = async () => {
        try {
          if (!isMounted.current) {
            isMounted.current = true;
            const speciesCountsResponse = await getSpeciesCountsRequest(); 
            setSpeciesCounts(speciesCountsResponse.data);
            console.log('Species counts:', speciesCountsResponse.data);

            const traitsCountsResponse = await getTraitsDataCountsRequest(); 
            setTraitsCounts(traitsCountsResponse.data);
            console.log('Triats counts:', traitsCountsResponse.data);

            // fetch other data like location organisms counts or latest datasets if needed
            const locationOrganismsCountsResponse = await getLocationOrganismsCountsRequest(); 
            console.log('Location organisms counts:', locationOrganismsCountsResponse.data);
            
            // Fetch latest datasets
            const latestDatasetsResponse = await getLatestDatasetsRequest();
            setLatestDatasets(latestDatasetsResponse.data);

            //Get the dashboard stats next to the map
            const dashboardStatsResponse = await getDashboardStatsRequest();
            if (Array.isArray(dashboardStatsResponse.data)) {
              const dashboardStats = dashboardStatsResponse.data.reduce(
                (acc: Record<string, unknown>, row: { field_name?: string; field_value?: unknown }) => {
                  if (row?.field_name) {
                    acc[row.field_name] = row.field_value;
                  }

                  return acc;
                },
                {}
              );

              setTotalSamples(Number(dashboardStats.total_samples ?? 0));
              setSpeciesCount(Number(dashboardStats.total_species ?? 0));
              setActiveProjects(Number(dashboardStats.total_projects ?? 0));
              setLastUpdate(String(dashboardStats.last_update ?? ''));
            }

            // 1. Get unique location names for your categories (x-axis labels)
            const tmpCustomCategories = Array.from(new Set(locationOrganismsCountsResponse.data.map(item => item.location_name)));
            setCustomCategories(tmpCustomCategories);

            // 2. Prepare a structure to hold the aggregated counts per species per location
            const speciesDataMap = new Map(); // Map to store { species_name: { location_name: total_count } }

            locationOrganismsCountsResponse.data.forEach(item => {
              const speciesName = item.species_name;
              const locationName = item.location_name;
              const individuals = parseInt(item.number_individuals, 10); // Ensure it's an integer

              if (!speciesDataMap.has(speciesName)) {
                speciesDataMap.set(speciesName, new Map()); // Inner map for location counts
              }
              const locationCounts = speciesDataMap.get(speciesName);
              locationCounts.set(locationName, (locationCounts.get(locationName) || 0) + individuals);
            });

            // 3. Convert the aggregated map into the desired array format for chart series
            const chartSeries: { name: string; data: number[] }[] = [];
            for (const [speciesName, locationCountsMap] of speciesDataMap.entries()) {
              const dataForSpecies = tmpCustomCategories.map(locationName => {
                // Get the count for this location and species, or 0 if not present
                return locationCountsMap.get(locationName) || 0;
              });

              chartSeries.push({
                name: speciesName,
                data: dataForSpecies
              });
            }

            setLocationOrganismsObjects(chartSeries);

            //Fetch sampling areas coordinates
            const samplingAreasResponse = await getSamplingAreaCountsRequest();

            const sanitizedSamplingAreas = samplingAreasResponse.data
              .map((item, index) => {
                const latitude = parseCoordinate(item.latitude, 'latitude');
                const longitude = parseCoordinate(item.longitude, 'longitude');

                if (latitude === null || longitude === null) {
                  return null;
                }

                const numericId = Number(item.id);
                const numberIndividuals = Number(item.number_individuals);

                return {
                  id: Number.isFinite(numericId) ? numericId : index,
                  name: String(item.name ?? `Sampling area ${index + 1}`),
                  latitude,
                  longitude,
                  number_individuals: Number.isFinite(numberIndividuals) ? numberIndividuals : 0,
                  habitat_name: String(item.habitat_name ?? `Habitat ${index + 1}`),
                };
              })
              .filter(
                (item): item is { id: number; 
                  name: string; 
                  latitude: number; 
                  longitude: number; 
                  number_individuals: number; 
                  habitat_name: string } =>
                  item !== null
              );

            setSamplingAreasCoordinates(sanitizedSamplingAreas);

          }
        } catch (error) {
          console.error('Error fetching species counts:', error);
        }
      };
  
      fetchHomeReports();
  
    }, [parseCoordinate]);

  // Add title to the page using the branding loaded in LogoContext.
  useEffect(() => {
    document.title = brandTitle;
  }, [brandTitle]);

  const hasMoreThanThreeSpecies = speciesCounts.length > 3;

  return (
    <Grid container spacing={3} sx={{ width: '100%' }}>
      <Grid item xs={12}>
        <MapOverview
          samplingAreasCoordinates={samplingAreasCoordinates}
          totalSamples={totalSamples}
          speciesCount={speciesCount}
          activeProjects={activeProjects}
          lastUpdate={lastUpdate}
          sx={{ height: '100%' }}
        />
      </Grid>
      <Grid container item lg={hasMoreThanThreeSpecies ? 12 : 4} md={6} xs={12} spacing={3}>
          {speciesCounts.map((speciesCount, index) => (
        <Grid item key={index} lg={hasMoreThanThreeSpecies ? 3 : 12} xs={12}>
            <Species
              id={speciesCount.species_id}
              name={speciesCount.species_name}
              sx={{ height: '100%' }}
              value={`${speciesCount.number_individuals} samples`}
              image_file_name={speciesCount.image_file_name}
            />
            </Grid>
          ))}
      </Grid>
      <Grid item xs={12} md={12} lg={hasMoreThanThreeSpecies ? 12 : 8}>
        <Locations
          chartSeries={locationOrganismsObjects}
          customCategories={customCategories}
          sx={{ height: '100%', minWidth: customCategories.length*80 + 'px' }} // Adjust width based on number of species
        />
      </Grid>
      <Grid item xs={12} md={12} lg={12}>
        <Traits chartSeries={traitsCounts.map((traitsCount) => parseInt(traitsCount.number_entries))} 
        labels={traitsCounts.map((traitsCount) => (traitsCount.trait_name))} sx={{ height: '100%' }} />
      </Grid>
      <Grid item xs={12}>
        <LatestDatasets
          datasets={latestDatasets.map((dataset) => ({
            id: dataset.id + '-' + dataset.type,
            name: dataset.name,
            updatedAt: dayjs(dataset.date_dataset).toDate().toString(),
            type: dataset.type,
            link_path: dataset.link_path,
          }))}
          sx={{ height: '100%' }}
        />
      </Grid>
    </Grid>
  );
}
