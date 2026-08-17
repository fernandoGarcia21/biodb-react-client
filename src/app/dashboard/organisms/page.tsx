"use client";
import * as React from 'react';
import {useEffect, useState, useRef} from 'react';
import FileDownload from 'js-file-download';
import { useRouter, useSearchParams } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { Trash as TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import { OrganismsFilters } from '@/components/dashboard/organisms/organisms-filters';
import { OrganismsTable } from '@/components/dashboard/organisms/organisms-table';
import type { Organism } from '@/components/dashboard/organisms/organisms-table';
import { styled } from '@mui/material/styles';
import { paths } from '@/paths';
import { useBrandTitle } from '@/hooks/use-brand-title';
 
import { getAllOrganismsRequest, getFilteredOrganismsRequest, getExportFilteredOrganismsRequest } from '@/api/organisms';
import { getSpeciesRequest } from '@/api/species';
import { getAllSamplingAreasLocationsRequest } from '@/api/samplingAreas';
import { getProjectsRequest, getProjectsMustReadRequest } from '@/api/projects';
import { getAllTraitPropertiesNoLocation } from '@/api/locationProperties';
import { getAllHabitatsRequest } from '@/api/habitats';

export default function Page(): React.JSX.Element {
  const brandTitle = useBrandTitle();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSpeciesId = searchParams.get('speciesId') ?? '';
  const initialLocationId = searchParams.get('locationId') ?? '';
  const initialSamplingAreaId = searchParams.get('samplingAreaId') ?? '';
  const [organisms, setOrganisms] = useState([]);
  const [listLocations, setListLocations] = useState<string[]>([]);
  const [listHabitats, setListHabitats] = useState([]);
  const [listSamplingAreas, setListSamplingAreas] = useState([]);
  const [listSpecies, setListSpecies] = useState([]);
  const [listProjects, setListProjects] = useState([]);
  const [listTraitProperties, setListTraitProperties] = useState<GroupedTraitProperty[]>([]);
  const [listPropertiesNoGroupped, setListPropertiesNoGroupped] = useState<TraitProperty[]>([]);
  const [listTraitTypes, setListTraitTypes] = useState<string[]>([]);
  const [headersGroupping, setHeadersGroupping] = useState<any[]>([]);
  const [filtersQuery, setFiltersQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [totalAllowed, setTotalAllowed] = useState(0);
  const [openMustReadDialog, setOpenMustReadDialog] = useState(false);
  const [mustReadProjects, setMustReadProjects] = useState<Array<{ id: number; name: string; must_read_title: string; must_read_content: string }>>([]);
  const isMounted = useRef(false);

  useEffect(() => {
    const fetchOrganisms = async () => {
      try {
        if (!isMounted.current) {
          isMounted.current = true;
          const response = await getAllOrganismsRequest(); 
          
          // Extract organisms and totalCount from the new response format
          const initialOrganisms = response.data.organisms || response.data;
          const initialTotalCount = response.data.totalCount || initialOrganisms.length;

          const totalAllowed = response.data.totalAllowed || initialTotalCount;
          
          setOrganisms(initialOrganisms);
          setTotalCount(initialTotalCount);
          setTotalAllowed(totalAllowed);

          // Apply URL pre-filter if any param was provided
          if (initialSpeciesId || initialSamplingAreaId || initialLocationId) {
            const preFilterQuery = new URLSearchParams();
            if (initialSpeciesId) preFilterQuery.set('filterSpecies', initialSpeciesId);
            if (initialSamplingAreaId) preFilterQuery.set('filterSamplingArea', initialSamplingAreaId);
            if (initialLocationId) preFilterQuery.set('filterLocationId', initialLocationId);
            const preFilterStr = preFilterQuery.toString();
            const preFilterResponse = await getFilteredOrganismsRequest(preFilterStr);
            const preFilteredOrganisms = preFilterResponse.data.organisms || preFilterResponse.data;
            setOrganisms(preFilteredOrganisms);
            setTotalCount(preFilterResponse.data.totalCount || preFilteredOrganisms.length);
            setTotalAllowed(preFilterResponse.data.totalAllowed || 0);
            setFiltersQuery(preFilterStr);
          }

          //Fetch the data for the filters
          const responseSpecies = await getSpeciesRequest();
          setListSpecies(responseSpecies.data);
          console.log('Species list:', responseSpecies.data);

          const responseHabitats = await getAllHabitatsRequest();
          setListHabitats(responseHabitats.data);
          console.log('Habitats list:', responseHabitats.data);

          const responseSamplingAreas = await getAllSamplingAreasLocationsRequest();
          setListSamplingAreas(responseSamplingAreas.data);
          console.log('Locations list:', responseSamplingAreas.data);

          //Identify and sort the unique values of location from sampling areas
          const tmpLocations: string[] = responseSamplingAreas.data.map((samplingArea: { location_name: string }) => samplingArea.location_name);
          const uniqueLocations: string[] = Array.from(new Set<string>(tmpLocations)).sort((a, b) => a.localeCompare(b));
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
          const uniqueTraitTypes = Array.from(new Set(tmpTraitTypes)).sort((a, b) => a.localeCompare(b));
          setListTraitTypes(uniqueTraitTypes);
          console.log('Unique trait types:', uniqueTraitTypes);
        }
      } catch (error) {
        console.error('Error fetching organisms:', error);
      }
    };

    void fetchOrganisms();

  }, []);

  // Add title to the page
  useEffect(() => {
    document.title = `Organisms | ${brandTitle}`;
  }, [brandTitle]);


  // Define types for trait property and grouped trait property
  type TraitProperty = {
    trait_id: number;
    trait_name: string;
    trait_type_id: number;
    trait_type_name: string;
    property_id: number;
    property_name: string;
    data_type_id: number;
    data_type_name: string;
    req_project_must_read: boolean;
  };

  type GroupedTraitProperty = {
    trait_id: number;
    trait_name: string;
    trait_type_id: number;
    trait_type_name: string;
    properties: Array<{
      property_id: number;
      property_name: string;
      data_type_id: number;
      data_type_name: string;
      req_project_must_read: boolean;
    }>;
  };

  const groupPropertiesByTrait = (data: TraitProperty[]): GroupedTraitProperty[] => {
    //Group the properties data by trait
    const grouped = data.reduce<GroupedTraitProperty[]>((acc, curr) => {
      const existingGroup = acc.find((group) => group.trait_id === curr.trait_id);

      if (existingGroup) {
        existingGroup.properties.push({ 
                                        property_id: curr.property_id,
                                        property_name: curr.property_name, 
                                        data_type_id: curr.data_type_id,
                                        data_type_name: curr.data_type_name,
                                        req_project_must_read: curr.req_project_must_read});
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
                        data_type_name: curr.data_type_name,
                        req_project_must_read: curr.req_project_must_read
           }] 
        });
      }

      return acc;
    }, []);

    return grouped;
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

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
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
          if (response.statusText !== 'OK') {
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


  const handleFilterClick = async (
    pFilterName : string, 
    pInputSelectSpecies : string [],
    pInputSelectSamplingArea : string [], 
    pInputSelectProject : string [], 
    pInputSelectProperties : any [],
    pInputSelectCondition : string, //AND or OR
    selectedOutputProperties: number[]) => {

    setFiltersQuery('');
    const tmpPropertiesIds = pInputSelectProperties.map((property) => property.property_id);
    const tmpPropertiesValues = pInputSelectProperties.map((property) => property.value);
    const tmpPropertiesOperation = pInputSelectProperties.map((property) => property.operation); //Equal, Greater, Less, etc.
    const tmpPropertiesDataTypes = pInputSelectProperties.map((property) => property.data_type_id);
    //Create a query string with the filters to send to the API
    const filtersOject = {
          filterName: pFilterName,
          filterSpecies: pInputSelectSpecies.join(','), // join array to string
          filterSamplingArea: pInputSelectSamplingArea.join(','),
          filterProject: pInputSelectProject.join(','),
          filterPropertiesIds: tmpPropertiesIds.join(','),
          filterPropertiesValues: tmpPropertiesValues.join(','),
          filterPropertiesOperations: tmpPropertiesOperation.join(','),
          propertyDataTypes: tmpPropertiesDataTypes.join(','),
          filterCondition: pInputSelectCondition,
          filterPropertiesOutput: selectedOutputProperties.join(','),
        };
    const tmpFltersQuery = new URLSearchParams(filtersOject).toString();
    console.log('Filters query string:', tmpFltersQuery);



    try{
      const responseFilter = await getFilteredOrganismsRequest(tmpFltersQuery);

      console.log('Organisms filtered response:', responseFilter.data);

      // Extract organisms and totalCount from the new response format
      const filteredOrganisms = responseFilter.data.organisms || responseFilter.data;
      const totalFilteredCount = responseFilter.data.totalCount || filteredOrganisms.length;
      
      setTotalCount(totalFilteredCount);
      setTotalAllowed(responseFilter.data.totalAllowed || 0);

      let propertiesMustRead = listPropertiesNoGroupped.filter((property) => {
        //Check if the property is in the selected output properties
        return selectedOutputProperties.includes(property.property_id) && property.req_project_must_read;
      });

      console.log('Properties that require must read:', propertiesMustRead);

      if(propertiesMustRead && propertiesMustRead.length > 0){
        //Get the list of unique project Ids from the organisms
        let projectIdsSet = new Set<string>();
        filteredOrganisms.forEach((organism: Organism) => {
          if(organism.project_ids){
            projectIdsSet.add(organism.project_ids);
          }
        });
        const projectIdsArray = Array.from(projectIdsSet);
        console.log('Project Ids from filtered organisms:', projectIdsArray.join(','));

        //Fetch the must read info for the projects
        const responseProjectsMustRead = await getProjectsMustReadRequest(projectIdsArray.join(','));
        console.log('Projects must read response:', responseProjectsMustRead.data);
        const projectsMustReadMap = new Map<number, { name: string; must_read_title: string; must_read_content: string }>();
        responseProjectsMustRead.data.forEach((project: { id: number; name: string; must_read_title: string; must_read_content: string }) => {
          projectsMustReadMap.set(project.id, { name: project.name, must_read_title: project.must_read_title, must_read_content: project.must_read_content });
        });
        
        // If there are projects with must-read info, open the dialog
        if (projectsMustReadMap.size > 0) {
          setMustReadProjects(Array.from(projectsMustReadMap.values()).map((value, index) => ({
            id: Array.from(projectsMustReadMap.keys())[index],
            ...value
          })));
          setOpenMustReadDialog(true);
        }
      }

      setOrganisms(filteredOrganisms);
      setFiltersQuery(tmpFltersQuery);

      //Update the headers of the table based on the output properties
      const tmpOutputHeaders = listPropertiesNoGroupped.filter((property) => selectedOutputProperties.includes(property.property_id));
      console.log('Output headers based on selected properties:', tmpOutputHeaders);
      if(tmpOutputHeaders && tmpOutputHeaders.length > 0){
        //Update the headers for the groupping of the properties by trait
        const tmpOutputHeadersGroupping = groupAndCount(tmpOutputHeaders, 'trait_name');
        setHeadersGroupping(tmpOutputHeadersGroupping);
      }else{
        setHeadersGroupping([]);
      }

      console.log('Organisms filtered:', responseFilter.data);

    } catch (error) {
        console.error('Error filtering organisms:', error);
    }
      
  };

  //Group the properties by trait and count the number of properties for each trait
  const groupAndCount = (
    array: Array<{ [key: string]: any }>,
    property: string
  ): Array<{ [key: string]: any; count: number; items: Array<{ [key: string]: any }> }> => {
    const grouped: { [key: string]: Array<{ [key: string]: any }> } = array.reduce((acc, obj) => {
      const key = obj[property];
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(obj);
      return acc;
    }, {});
  
    const result = Object.entries(grouped).map(([key, items]) => ({
      [property]: key,
      count: (items as Array<{ [key: string]: any }>).length,
      items: items as Array<{ [key: string]: any }>,
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
          listHabitats={listHabitats}
          listSamplingAreas={listSamplingAreas}
          listSpecies={listSpecies}
          listProjects={listProjects}
          listTraitProperties={listTraitProperties}
          listPropertiesNoGroupped={listPropertiesNoGroupped}
          listTraitTypes={listTraitTypes}
          initialSpeciesId={initialSpeciesId || undefined}
          initialSamplingAreaId={initialSamplingAreaId || undefined}
          initialLocationId={initialLocationId || undefined}
          handleFilterClick = {handleFilterClick}/>
        <Alert severity="info" sx={{ mb: 2 }}>
          Showing {organisms.length} individual{organisms.length !== 1 ? 's' : ''} in the table
          {totalCount > organisms.length && ` (${totalCount} total individuals found, limited to first ${organisms.length})`}. 
          Use the filters above to refine your query and display additional individuals. If you need to access more than {totalAllowed} individuals, consider exporting the full dataset.
        </Alert>
        <OrganismsTable
          count={organisms.length}
          page={page}
          rows={paginatedOrganisms}
          headersGroupping={headersGroupping}
          rowsPerPage={rowsPerPage}
          myRowsPerPageChangeEvent={handleChangeRowsPerPage}
          myPageChangeEvent={handleChangePage}
        />
        <Dialog
          open={openMustReadDialog}
          onClose={(event, reason) => {
            // Prevent closing by clicking outside or pressing escape
            if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
              return;
            }
          }}
          maxWidth="md"
          fullWidth
          aria-labelledby="must-read-dialog-title"
        >
          <DialogTitle id="must-read-dialog-title">
            Important Information - Please Read
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              The following projects have important information that you must read before downloading data:
            </DialogContentText>
            {mustReadProjects.map((project, index) => (
              <Box 
                key={project.id}
                sx={{
                  p: 2,
                  mb: index < mustReadProjects.length - 1 ? 2 : 0,
                  borderRadius: 1,
                  bgcolor: index % 2 === 0 ? 'rgba(25, 118, 210, 0.08)' : 'rgba(156, 39, 176, 0.08)',
                  border: '1px solid',
                  borderColor: index % 2 === 0 ? 'rgba(25, 118, 210, 0.2)' : 'rgba(156, 39, 176, 0.2)',
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'text.secondary', fontWeight: 600 }}>
                  Project: {project.name}
                </Typography>
                <Typography variant="h6" sx={{ mb: 1, color: 'text.primary' }}>
                  {project.must_read_title}
                </Typography>
                <DialogContentText sx={{ whiteSpace: 'pre-wrap', color: 'text.primary' }}>
                  {project.must_read_content}
                </DialogContentText>
              </Box>
            ))}
            <DialogContentText sx={{ mt: 3, fontSize: '0.875rem', fontStyle: 'italic', color: 'text.secondary' }}>
              This notification appears because your output contains properties that require specific acknowledgment. One or more properties have been flagged by the administrator to ensure the user understands the implications of using data generated under the criteria of different projects.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setOpenMustReadDialog(false)} 
              variant="contained" 
              color="primary"
            >
              I Acknowledge
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
  );
}

function applyPagination(rows: Organism[], page: number, rowsPerPage: number): Organism[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}

// Obtain the different dynamic properties from the organisms.
// This function will be used to render the dynamic properties in the organisms table.
function getDynamicProperties(rows: Organism[]): string[] {
  return Array.from(
    new Set(
      rows
        .flatMap(row =>
          Array.isArray(row.properties)
            ? row.properties.map(p => p.f2)
            : []
        )
    )
  ).filter(h => h != null);
}

