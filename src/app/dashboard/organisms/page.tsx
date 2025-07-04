"use client";
import * as React from 'react';
import {useEffect, useState, useRef} from 'react';
import FileDownload from 'js-file-download';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { Trash as TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import { config } from '@/config';
import { OrganismsFilters } from '@/components/dashboard/organisms/organisms-filters';
import { OrganismsTable } from '@/components/dashboard/organisms/organisms-table';
import type { Organism } from '@/components/dashboard/organisms/organisms-table';
import { styled } from '@mui/material/styles';
import { paths } from '@/paths';
 
import { getAllOrganismsRequest, getFilteredOrganismsRequest, getExportFilteredOrganismsRequest } from '@/api/organisms';
import { getSpeciesRequest } from '@/api/species';
import { getLocationsRequest } from '@/api/locations';
import { getAllSamplingAreasLocationsRequest } from '@/api/samplingAreas';
import { getProjectsRequest } from '@/api/projects';
import { getAllTraitPropertiesNoLocation } from '@/api/locationProperties';
import { string } from 'zod';


export default function Page(): React.JSX.Element {
  const router = useRouter();
  const [organisms, setOrganisms] = useState([]);
  const [listLocations, setListLocations] = useState([]);
  const [listSamplingAreas, setListSamplingAreas] = useState([]);
  const [listSpecies, setListSpecies] = useState([]);
  const [listProjects, setListProjects] = useState([]);
  const [listTraitProperties, setListTraitProperties] = useState([]);
  const [listPropertiesNoGroupped, setListPropertiesNoGroupped] = useState([]);
  const [listTraitTypes, setListTraitTypes] = useState([]);
  const [headersGroupping, setHeadersGroupping] = useState([]);
  const [filtersQuery, setFiltersQuery] = useState('');
  const isMounted = useRef(false);

  useEffect(() => {
    const fetchOrganisms = async () => {
      try {
        if (!isMounted.current) {
          isMounted.current = true;
          const response = await getAllOrganismsRequest(); 
          setOrganisms(response.data);
          console.log('Organisms list:', response.data);

          //Fetch the data for the filters
          const responseSpecies = await getSpeciesRequest();
          setListSpecies(responseSpecies.data);
          console.log('Species list:', responseSpecies.data);

          const responseSamplingAreas = await getAllSamplingAreasLocationsRequest();
          setListSamplingAreas(responseSamplingAreas.data);
          console.log('Locations list:', responseSamplingAreas.data);

          //Identify and sort the unique values of location from sampling areas
          const tmpLocations = responseSamplingAreas.data.map((samplingArea) => samplingArea.location_name);
          const uniqueLocations = [...new Set(tmpLocations)].sort((a, b) => a.localeCompare(b));
          setListLocations(uniqueLocations);
          console.log('Unique location names:', uniqueLocations);

          const responseProjects = await getProjectsRequest();
          setListProjects(responseProjects.data);
          console.log('Projects list:', responseProjects.data);

          const responseTraitProperties = await getAllTraitPropertiesNoLocation();
          const groupedTraitProperties = groupPropertiesByTrait(responseTraitProperties.data);
          setListTraitProperties(groupedTraitProperties);
          setListPropertiesNoGroupped(responseTraitProperties.data);
          console.log('Trait properties list:', groupedTraitProperties);

          //Identify and sort the unique values of trait type
          const tmpTraitTypes = groupedTraitProperties.map((trait) => trait.trait_type_name);
          const uniqueTraitTypes = [...new Set(tmpTraitTypes)].sort((a, b) => a.localeCompare(b));
          setListTraitTypes(uniqueTraitTypes);
          console.log('Unique trait types:', uniqueTraitTypes);
        }
      } catch (error) {
        console.error('Error fetching organisms:', error);
      }
    };

    void fetchOrganisms();

  }, []);

  //Add title to the page
  useEffect(() => {
    document.title = `Organisms | Dashboard | ${config.site.name}`;
  }, []);


  const groupPropertiesByTrait = (data: []) => {
    //Group the properties data by trait
    const grouped = data.reduce((acc, curr) => {
      const existingGroup = acc.find((group) => group.trait_id === curr.trait_id);

      if (existingGroup) {
        existingGroup.properties.push({ 
                                        property_id: curr.property_id,
                                        property_name: curr.property_name, 
                                        data_type_id: curr.data_type_id,
                                        data_type_name: curr.data_type_name});
      } else {
        acc.push({ 
          trait_id: curr.trait_id, 
          trait_name: curr.trait_name,
          trait_type_id: curr.trait_type_id,
          trait_type_name: curr.trait_type_name,
          properties: [{ 
                        property_id: curr.property_id,
                        property_name: curr.property_name, 
                        data_type_id: curr.data_type_id,
                        data_type_name: curr.data_type_name
           }] 
        });
      }

      return acc;
    }, []);

    return (grouped);
  }


  //Initialize the pagination of the table
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  //Paginate the list of organisms
  const paginatedOrganisms = applyPagination(organisms, page, rowsPerPage);

  const dynamicProperties = getDynamicProperties(organisms);


  //Define the event handlers for the pagination
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Rows per page from organisms page :', event.target.value);
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    console.log('The new page number :', newPage);
    setPage(newPage);
  };

  const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
  });

  const handleImportClick = () => {
      router.push(paths.dashboard.organismsBatchCreate);
    };

    const handleExportClick = async() => {
      try{
        if(filtersQuery && filtersQuery.length) {
          const response = await getExportFilteredOrganismsRequest(filtersQuery);
          if (!response.statusText === 'OK') {
            throw new Error('Network response was not ok');
          }
          if(response.data){
            FileDownload(response.data, 'organisms.tsv');
          }
          
        }
      } catch (error) {
          console.error('Error filtering organisms:', error);
      }
    };

  const handleDeleteClick = () => {
    router.push(paths.dashboard.organismsBatchDelete);
  };


  const handleFilterClick = async (pFilterName : string, 
    pInputSelectSpecies : string [],
    pInputSelectSamplingArea : string [], 
    pInputSelectProject : string [], 
    pInputSelectProperties : any [],
    pInputSelectCondition : string, //AND or OR
    selectedOutputProperties: number []) => {

    setFiltersQuery('');
    const tmpPropertiesIds = pInputSelectProperties.map((property) => property.property_id);
    const tmpPropertiesValues = pInputSelectProperties.map((property) => property.value);
    const tmpPropertiesOperation = pInputSelectProperties.map((property) => property.operation); //Equal, Greater, Less, etc.
    const tmpPropertiesDataTypes = pInputSelectProperties.map((property) => property.data_type_id);
    //Create a query string with the filters to send to the API
    const filtersOject = {filterName: pFilterName, 
                          filterSpecies: pInputSelectSpecies, 
                          filterSamplingArea: pInputSelectSamplingArea, 
                          filterProject: pInputSelectProject, 
                          filterPropertiesIds: tmpPropertiesIds,
                          filterPropertiesValues: tmpPropertiesValues,
                          filterPropertiesOperations: tmpPropertiesOperation,
                          propertyDataTypes: tmpPropertiesDataTypes,
                          filterCondition: pInputSelectCondition,
                          filterPropertiesOutput: selectedOutputProperties};
    const tmpFltersQuery = new URLSearchParams(filtersOject).toString();

    try{
      const responseFilter = await getFilteredOrganismsRequest(tmpFltersQuery);
      setOrganisms(responseFilter.data);
      setFiltersQuery(tmpFltersQuery);

      //Update the headers of the table based on the output properties
      const tmpOutputHeaders = listPropertiesNoGroupped.filter((property) => selectedOutputProperties.includes(property.property_id));
      if(tmpOutputHeaders && tmpOutputHeaders.length > 0){
        //Update the headers for the groupping of the properties by trait
        const tmpOutputHeadersGroupping = groupAndCount(tmpOutputHeaders, 'trait_name');
        setHeadersGroupping(tmpOutputHeadersGroupping);
      }


    } catch (error) {
        console.error('Error filtering organisms:', error);
    }
      
  };

  //Group the properties by trait and count the number of properties for each trait
  const groupAndCount = (array, property) => {
    const grouped = array.reduce((acc, obj) => {
      const key = obj[property];
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(obj);
      return acc;
    }, {});
  
    const result = Object.entries(grouped).map(([key, items]) => ({
      [property]: key,
      count: items.length,
      items: items, // Optional: Include the items in each group
    }));
  
    return result;
  }

  return (
      <Stack spacing={3}>
        <Stack direction="row" spacing={3}>
          <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
            <Typography variant="h4">Organisms list</Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Button
                color="inherit"
                onClick={handleImportClick}
                startIcon={<UploadIcon fontSize="var(--icon-fontSize-md)" />}
              >
                Import
              </Button>
              <Button 
              color="inherit" 
              onClick={handleExportClick}
              startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />}>
                Export
              </Button>
              <Button 
              color="inherit" 
              onClick={handleDeleteClick}
              startIcon={<TrashIcon fontSize="var(--icon-fontSize-md)" />}>
                Delete
              </Button>
            </Stack>
          </Stack>
        </Stack>
        <OrganismsFilters 
          listLocations={listLocations}
          listSamplingAreas={listSamplingAreas}
          listSpecies={listSpecies}
          listProjects={listProjects}
          listTraitProperties={listTraitProperties}
          listPropertiesNoGroupped={listPropertiesNoGroupped}
          listTraitTypes={listTraitTypes}
          handleFilterClick = {handleFilterClick}/>
        <OrganismsTable
          count={organisms.length}
          page={page}
          rows={paginatedOrganisms}
          headersGroupping={headersGroupping}
          rowsPerPage={rowsPerPage}
          myRowsPerPageChangeEvent={handleChangeRowsPerPage}
          myPageChangeEvent={handleChangePage}
        />
      </Stack>
  );
}

function applyPagination(rows: Organism[], page: number, rowsPerPage: number): Organism[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}

// Obtain the different dynamic properties from the organisms.
// This function will be used to render the dynamic properties in the organisms table.
function getDynamicProperties(rows: Organism[]): string[] {
  return [... new Set(rows.map(row => row.properties.map(p => p.f2)).flat())].filter(h => h != null);
}

