"use client";
import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import dayjs from 'dayjs';

import { config } from '@/config';
import { Species } from '@/components/dashboard/overview/species';
import { AboutUs } from '@/components/dashboard/overview/about-us';
import { LatestDatasets } from '@/components/dashboard/overview/latest-datasets';
import { Locations } from '@/components/dashboard/overview/locations';
import { Traits } from '@/components/dashboard/overview/traits';

import { getSpeciesCountsRequest, getLocationOrganismsCountsRequest, getTraitsDataCountsRequest, getLatestDatasetsRequest } from '@/api/homeReports'; // Importing this to ensure the API is initialized, if needed


export default function Page(): React.JSX.Element {

  const isMounted = useRef(false);
  const [speciesCounts, setSpeciesCounts] = useState([]);
  const [traitsCounts, setTraitsCounts] = useState([]);
  const [latestDatasets, setLatestDatasets] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [locationOrganismsObjects, setLocationOrganismsObjects] = useState([]);
    
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
            const chartSeries = [];
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
            console.log('Location organisms objects:', chartSeries);


          }
        } catch (error) {
          console.error('Error fetching species coutns:', error);
        }
      };
  
      fetchHomeReports();
  
    }, []);

  //Add title to the page
    useEffect(() => {
      document.title = `Overview | Dashboard | ${config.site.name}`;
    }, []);

  return (
    <Grid container spacing={3} sx={{ width: '100%' }}>
      {speciesCounts.map((speciesCount, index) => (
          <Grid item key={index} lg={4} md={6} xs={12}>
            <Species
              name={speciesCount.species_name}
              sx={{ height: '100%' }}
              value={`${speciesCount.number_individuals} samples`}
            />
          </Grid>
        ))
      }
      <Grid item xs={12} md={12} lg={6}>
      <Locations
          chartSeries={locationOrganismsObjects}
          customCategories={customCategories}
          sx={{ height: '100%', minWidth: customCategories.length*80 + 'px' }} // Adjust width based on number of species
        />

        
      </Grid>
      <Grid item xs={12} md={12} lg={6}>
        <Traits chartSeries={traitsCounts.map((traitsCount) => parseInt(traitsCount.number_entries))} 
        labels={traitsCounts.map((traitsCount) => (traitsCount.trait_name))} sx={{ height: '100%' }} />
      </Grid>
      <Grid item xs={12} md={6}>
        <LatestDatasets
          datasets={latestDatasets.map((dataset) => ({
            id: dataset.id + '-' + dataset.type,
            name: dataset.name,
            updatedAt: dayjs(dataset.date_dataset).toDate(),
            type: dataset.type,
            link_path: dataset.link_path,
          }))}
          sx={{ height: '100%' }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <AboutUs
          info={[]}
          sx={{ height: '100%' }}
        />
      </Grid>
    </Grid>
  );
}
