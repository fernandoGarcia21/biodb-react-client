import * as React from 'react';
import { HabitatCodeFilter } from './habitat-code-filter';
import { filterSamplingAreasByHabitat, hasActiveHabitatFilters, reconcileHabitatSamplingAreas } from '@/lib/habitat-codes/filter';
import type { HabitatDescriptor, HabitatFilterState, HabitatSamplingArea } from '@/lib/habitat-codes/filter';
import {useState, useEffect} from 'react';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';

//Components for the filters
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import FormLabel from '@mui/material/FormLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormHelperText from '@mui/material/FormHelperText';
import ListItemText from '@mui/material/ListItemText';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import ListSubheader from '@mui/material/ListSubheader';

//Components for the date picker
import dayjs, { Dayjs } from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

//Components for the list of chosen filters
import Chip from '@mui/material/Chip';

//Components for the autocomplete of the properties to show
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon, CheckBox as CheckBoxIcon } from '@mui/icons-material';

//Icons
import { Funnel as FilterIcon } from '@phosphor-icons/react/dist/ssr/Funnel';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { Plus as AddIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { Button, Typography } from '@mui/material';

import { LIST_QUERY_OPERATIONS, 
         LIST_RELATION_DATA_TYPE_OPERATION, 
         LIST_CONDITIONS_QUERY, 
         LIST_DATA_TYPES_VALIDATIONS,
         LIST_DATA_TYPES_COMPONENTS,
         DATE_FORMAT_TEMPLATE } from '@/constants';


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
    }>;
  };

type Species = {
  id: string;
  name: string;
  internal_code: string;
};

interface OrganismsFiltersProps {
  listLocations: string [];
  listHabitatCodes: HabitatDescriptor[];
  listSamplingAreas: HabitatSamplingArea[];
  listSpecies: Species[];
  listProjects: any[];
  listTraitProperties: GroupedTraitProperty [];
  listPropertiesNoGroupped: TraitProperty [];
  listTraitTypes: string [];
  initialSpeciesId?: string;
  initialSamplingAreaId?: string;
  initialLocationId?: string;
  handleFilterClick: (pFilterName : string, 
                      pInputSelectSpecies: string [],
                      pInputSelectSamplingArea: string [],
                      pInputSelectProject: string [],
                      pInputSelectPropertyValues: any [],
                      pInputSelectCondition: string,
                      pInputSelectedOutputProperties: number []) => void;
}

export function OrganismsFilters({
  listHabitatCodes,
  listSamplingAreas,
  listSpecies,
  listProjects,
  listTraitProperties,
  listPropertiesNoGroupped,
  listTraitTypes,
  initialSpeciesId,
  initialSamplingAreaId,
  initialLocationId,
  handleFilterClick,
}:OrganismsFiltersProps): React.JSX.Element {

  const [inputOrganismNameFilter, setInputOrganismNameFilter] = useState<string>('');
  const [inputSelectSpecies, setInputSelectSpecies] = React.useState<string[]>(initialSpeciesId ? [initialSpeciesId] : []);
  const [structureIds, setStructureIds] = React.useState<string[]>([]);
  const [contactZone, setContactZone] = React.useState<'' | 'true' | 'false'>('');
  const [habitatFilters, setHabitatFilters] = React.useState<HabitatFilterState>({});
  const [inputSelectLocation, setInputSelectLocation] = React.useState<string[]>(initialLocationId ? [initialLocationId] : []);
  const [inputSelectSamplingArea, setInputSelectSamplingArea] = React.useState<string[]>(initialSamplingAreaId ? [initialSamplingAreaId] : []);
  const [inputSelectProject, setInputSelectProject] = React.useState<string[]>([]);
  const [selectedPropertyValues, setSelectedPropertyValues] = React.useState<any>([]);
  const [inputSelectProperty, setInputSelectProperty] = React.useState<number>(0); 
  const [inputSelectTrait, setInputSelectTrait] = React.useState<number>(0);
  const [inputPropertyValueFilter, setInputPropertyValueFilter] = useState<string>('');
  const [inputSelectOperation, setInputSelectOperation] = React.useState<string>('');
  const [inputSelectCondition, setInputSelectCondition] = React.useState<string>('');
  const [listOperationsProperty, setListOperationsProperty] = React.useState<any>([]);
  const [errorPropertyValue, setErrorPropertyValue] = useState('');
  const [inputDataType, setInputDataType] = useState<number>(0);
  const [inputDate, setInputDate] = useState<Dayjs | null>(dayjs());
  const [selectedOutputProperties, setSelectedOutputProperties] = React.useState<number[]>([]);
  const [filtersApplied, setFiltersApplied] = useState<boolean>(true);

  // Re-seed initial selections once the lists have loaded so types match the actual item ids.
  useEffect(() => {
    if (initialSpeciesId && listSpecies.length > 0) {
      const match = listSpecies.find((s) => String(s.id) === String(initialSpeciesId));
      if (match) setInputSelectSpecies([match.id]);
    }
  }, [listSpecies]);

  useEffect(() => {
    if (initialSamplingAreaId && listSamplingAreas.length > 0) {
      const match = listSamplingAreas.find(
        (sa) => String(sa.sampling_area_id) === String(initialSamplingAreaId)
      );
      if (match) setInputSelectSamplingArea([String(match.sampling_area_id)]);
    }
  }, [listSamplingAreas]);

  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputOrganismNameFilter(event.target.value);
    setFiltersApplied(false);
  };

  const handleInputPropertyValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputPropertyValueFilter(value);
    setErrorPropertyValue('');

    if(value && value.length > 0 && inputSelectProperty > 0){
      // Perform validation based on inputType
      const dataValidation = LIST_DATA_TYPES_VALIDATIONS.filter(dataType => dataType.id === inputDataType)[0];

      const isValidData = new RegExp(dataValidation.regex).test(value);
      if (!isValidData) {
        setErrorPropertyValue(dataValidation.message);
      } 
    }
  };

  const handleInputPropertyDateChange = (value: Dayjs | null) => {
  
      setInputDate(value);
      console.log(value);
      setErrorPropertyValue('');
  
      if(value && inputSelectProperty > 0){
        // Perform validation based on inputType
        const dataValidation = LIST_DATA_TYPES_VALIDATIONS.filter(dataType => dataType.id === inputDataType)[0];
      
        const isValidData = new RegExp(dataValidation.regex).test(value.format(DATE_FORMAT_TEMPLATE).toString());
        if (isValidData) {
          setInputPropertyValueFilter(value.format(DATE_FORMAT_TEMPLATE).toString());
        }else{
          setErrorPropertyValue(dataValidation.message);
        }
      }
    };

  //Properties for the select menu filters
  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  const handleChangeSpecies = (event: SelectChangeEvent<typeof inputSelectSpecies>) => {
    const {
      target: { value },
    } = event;
    setInputSelectSpecies(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
    setFiltersApplied(false);
  };

  const availableSamplingAreas = React.useMemo(
    () => filterSamplingAreasByHabitat(listSamplingAreas, listHabitatCodes, habitatFilters, structureIds, contactZone),
    [listSamplingAreas, listHabitatCodes, habitatFilters, structureIds, contactZone]
  );
  const samplingAreasByCountry = React.useMemo(() => {
    const countries = new Map<string, Map<string, HabitatSamplingArea[]>>();
    for (const area of availableSamplingAreas) {
      const country = area.country_name || 'Unknown country';
      let locations = countries.get(country);
      if (!locations) {
        locations = new Map<string, HabitatSamplingArea[]>();
        countries.set(country, locations);
      }
      const areas = locations.get(area.location_name) ?? [];
      areas.push(area);
      locations.set(area.location_name, areas);
    }
    return [...countries.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([country, locations]) => ({
      country,
      locations: [...locations.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([location, areas]) => ({
        location,
        areas: [...areas].sort((a, b) => a.sampling_area_name.localeCompare(b.sampling_area_name)),
      })),
    }));
  }, [availableSamplingAreas]);
  const habitatStructures = React.useMemo(() => {
    const structures = new Map<string, string>();
    for (const area of listSamplingAreas) {
      if (area.habitat_structure_id != null) {
        structures.set(String(area.habitat_structure_id), area.habitat_structure_name || `Structure ${area.habitat_structure_id}`);
      }
    }
    return [...structures].sort(([, a], [, b]) => a.localeCompare(b));
  }, [listSamplingAreas]);
  const habitatFiltersActive = hasActiveHabitatFilters(habitatFilters) || structureIds.length > 0 || contactZone !== '';
  const matchingSelectedSamplingAreas = React.useMemo(
    () => inputSelectSamplingArea.filter((id) => availableSamplingAreas.some((area) => String(area.sampling_area_id) === id)),
    [inputSelectSamplingArea, availableSamplingAreas]
  );
  const habitatSelectionRequired = habitatFiltersActive && matchingSelectedSamplingAreas.length === 0;

  // Select all matches, including when data/configuration arrives asynchronously.
  useEffect(() => {
    if (!habitatFiltersActive) return;
    setInputSelectSamplingArea((selected) => reconcileHabitatSamplingAreas(selected, availableSamplingAreas, true));
    setFiltersApplied(false);
  }, [availableSamplingAreas, habitatFiltersActive]);

  const handleHabitatFiltersChange = (next: HabitatFilterState): void => {
    setHabitatFilters(next);
    setFiltersApplied(false);
  };

  const handleChangeSamplingArea = (event: SelectChangeEvent<typeof inputSelectSamplingArea>) => {
    const {
      target: { value },
    } = event;
    setInputSelectSamplingArea(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
    setFiltersApplied(false);
  };

  const handleChangeProject = (event: SelectChangeEvent<typeof inputSelectProject>) => {
    const {
      target: { value },
    } = event;
    setInputSelectProject(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
    setFiltersApplied(false);
  };

  const handleChangeTrait = (event: SelectChangeEvent<typeof inputSelectTrait>) => {
    const {
      target: { value },
    } = event;

    setInputSelectTrait(typeof value === 'string' ? Number.parseInt(value) : value,);
    setInputSelectProperty(0);
    setInputPropertyValueFilter('');
    setInputSelectOperation('');
    setListOperationsProperty([]);
  };

  const handleChangeProperty = (event: SelectChangeEvent<typeof inputSelectProperty>) => {
    const {
      target: { value },
    } = event;

    setInputSelectProperty(typeof value === 'string' ? Number.parseInt(value) : value);
    setInputPropertyValueFilter('');
    setInputSelectOperation('');
    setInputDate(dayjs());

    //Identify the type of data of the property to set the list of operations
    //Get the properties of the selected trait
    const tmpTraitsProperties = listTraitProperties.filter(traitProp => traitProp.trait_id == inputSelectTrait)[0].properties;
    //Get the selected property
    const tmpProperty = tmpTraitsProperties.filter(property => property.property_id == value)[0];

    setInputDataType(tmpProperty.data_type_id);

    //Get the data type of the property and the operations associated
    const listAssociatedOperations = LIST_RELATION_DATA_TYPE_OPERATION.filter(dataType => dataType.id == tmpProperty.data_type_id)[0].operations;

    console.log(tmpProperty.data_type_id);
    setListOperationsProperty(LIST_QUERY_OPERATIONS.filter(operation => listAssociatedOperations.includes(operation.name)));

    //If the datatype is a date, set the current date as the default value
    if(LIST_DATA_TYPES_VALIDATIONS.filter(dataType => dataType.id === tmpProperty.data_type_id)[0].name === "Date"){
      setInputPropertyValueFilter(dayjs().format(DATE_FORMAT_TEMPLATE));
    }

  };

  const handleChangeOperation = (event: SelectChangeEvent<typeof inputSelectOperation>) => {
    const {
      target: { value },
    } = event;
    setInputSelectOperation(value);
    //If operation is IS NULL or IS NOT NULL, set the value to default
    if(value === LIST_QUERY_OPERATIONS.filter(operation => operation.name === 'IS NULL')[0].value || value === LIST_QUERY_OPERATIONS.filter(operation => operation.name === 'IS NOT NULL')[0].value){
      setInputPropertyValueFilter(' ');
    }

  };

  const handleChangeCondition = (event: SelectChangeEvent<typeof inputSelectCondition>) => {
    const {
      target: { value },
    } = event;
    setInputSelectCondition(value);
  };


  const handleClickAddProperty = () => {
    if (inputSelectProperty > 0 && 
      inputPropertyValueFilter && 
      inputPropertyValueFilter.length > 0 && 
      inputSelectOperation && 
      inputSelectOperation.length > 0 && 
      !errorPropertyValue) {
      //Get the properties of the selected trait
      const tmpTraitsProperties = listTraitProperties.filter(traitProp => traitProp.trait_id == inputSelectTrait)[0].properties;
      //Get the selected property
      const tmpProperty = tmpTraitsProperties.filter(property => property.property_id == inputSelectProperty)[0];
      //Copy the current list of selected properties and add the new one
      setSelectedPropertyValues([...selectedPropertyValues, 
        { key: selectedPropertyValues.length, //This is a key to identify the property in the list
          property_id: inputSelectProperty, 
          property_name: tmpProperty.property_name, 
          data_type_id: tmpProperty.data_type_id, 
          value: inputPropertyValueFilter,
          operation: inputSelectOperation,
          operation_symbol: listOperationsProperty.filter(operation => operation.value == inputSelectOperation)[0].name}
      ]);

      //Add the new property to the list of output properties by default
      setSelectedOutputProperties([...selectedOutputProperties, inputSelectProperty]);
      setFiltersApplied(false);

      //Reset the property filter
      setInputSelectProperty(0);
      setInputDataType(0);
      setInputPropertyValueFilter('');
      setInputSelectOperation('');
      setInputDate(dayjs());
      setListOperationsProperty([]);

      //If there are two properties selected, set the condition to INTERSECT
      if(selectedPropertyValues.length > 0){
        setInputSelectCondition('INTERSECT');
      }

    }
  };

  const handleDeleteChosenProperty = (key_delete: number) => () => {
    setSelectedPropertyValues(selectedPropertyValues.filter(property => property.key !== key_delete));

    //If there are only two properties left in the selection, reset the condition
    if(selectedPropertyValues.length <= 2){
      setInputSelectCondition('');
    }
    setFiltersApplied(false);
  };

  //Process the selected properties to show in the output table
  const handleIncludePropertiesChange = (_, value) => {
    console.log(value.map((v) => v.property_id));
    setSelectedOutputProperties(value.map((v) => v.property_id));
    setFiltersApplied(false);
  };

  const optionsOutputProperties = listPropertiesNoGroupped.map((option) => {
    const trait = option.trait_name;
    return {
      groupProperty: trait,
      ...option,
    };
  });

  return (
    <Card sx={{ p: 2 }}>
      <CardHeader
        title="Construct your organism filters"
        titleTypographyProps={{ component: 'h2', variant: 'h6', sx: { fontWeight: 700, color: 'text.primary' } }}
        sx={{ px: 1, pt: 0, pb: 2 }}
      />
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap' }}>
        <FormControl sx={{ m: 1, width: 300 }}>
          <OutlinedInput
            value={inputOrganismNameFilter}
            fullWidth
            placeholder="Search by internal ID"
            startAdornment={
              <InputAdornment position="start">
                <MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" />
              </InputAdornment>
            }
            onChange={handleInputChange}
          />
        </FormControl>
        <FormControl sx={{ m: 1, width: 300 }}>
          <InputLabel id="species-multiple-checkbox-label">Species</InputLabel>
          <Select
            labelId="species-multiple-checkbox-label"
            id="species-multiple-checkbox"
            multiple
            value={inputSelectSpecies}
            onChange={handleChangeSpecies}
            input={<OutlinedInput label="Species" />}
            renderValue={(selected) => listSpecies.filter(species => selected.includes(species.id)).map(species => species.internal_code).join(', ')}
            MenuProps={MenuProps}
            >
              {listSpecies.map((species) => (
                <MenuItem key={species.id} value={species.id}>
                  <Checkbox checked={inputSelectSpecies.includes(species.id)} />
                  <ListItemText primary={species.name} />
                </MenuItem>
              ))}
            </Select>
        </FormControl>
        <FormControl sx={{ m: 1, width: 300 }}>
          <InputLabel id="project-multiple-checkbox-label">Project</InputLabel>
          <Select
            labelId="project-multiple-checkbox-label"
            id="project-multiple-checkbox"
            multiple
            value={inputSelectProject}
            onChange={handleChangeProject}
            input={<OutlinedInput label="Project" />}
            renderValue={(selected) => listProjects.filter(project => selected.includes(project.id)).map(project => project.name).join(', ')}
            MenuProps={MenuProps}
            >
              {listProjects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  <Checkbox checked={inputSelectProject.includes(project.id)} />
                  <ListItemText primary={project.name} />
                </MenuItem>
              ))}
            </Select>
        </FormControl>
      </Stack>
      <Box component="fieldset" aria-labelledby="geography-filters-title" sx={{ m: 1, minWidth: 0, p: { xs: 2, md: 3 }, pt: { xs: 1, md: 2 }, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Typography id="geography-filters-title" component="legend" variant="subtitle2" sx={{ px: 1, fontWeight: 400 }}>
          Filters by geography
        </Typography>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ alignItems: 'flex-start' }}>
            <Stack spacing={2} sx={{ width: { xs: '100%', md: 'auto' }, flex: { md: 2 }, minWidth: 0 }}>
              <FormControl fullWidth>
                <InputLabel id="sampling-area-multiple-checkbox-label">Sampling area</InputLabel>
                <Select
                  labelId="sampling-area-multiple-checkbox-label"
                  id="sampling-area-multiple-checkbox"
                  multiple
                  value={habitatFiltersActive ? matchingSelectedSamplingAreas : inputSelectSamplingArea}
                  onChange={handleChangeSamplingArea}
                  input={<OutlinedInput label="Sampling area" />}
                  renderValue={(selected) => listSamplingAreas.filter(samplingArea => selected.includes(String(samplingArea.sampling_area_id))).map(samplingArea => samplingArea.sampling_area_name).join(', ')}
                  MenuProps={{
                    ...MenuProps,
                    PaperProps: {
                      ...MenuProps.PaperProps,
                      style: { ...MenuProps.PaperProps.style, width: 480, maxWidth: 'calc(100vw - 32px)' },
                    },
                  }}
                  >
                  {samplingAreasByCountry.flatMap(({ country, locations }) => [
                    <ListSubheader key={`country-${country}`} disableSticky sx={{ fontWeight: 700, color: 'text.primary' }}>{country}</ListSubheader>,
                    ...locations.flatMap(({ location, areas }) => [
                      <ListSubheader key={`location-${country}-${location}`} disableSticky sx={{ pl: 4, fontWeight: 500 }}>{location}</ListSubheader>,
                      ...areas.map((samplingArea) => (
                        <MenuItem
                          key={samplingArea.sampling_area_id}
                          value={String(samplingArea.sampling_area_id)}
                          sx={{ pl: 6 }}
                        >
                          <Checkbox checked={inputSelectSamplingArea.includes(String(samplingArea.sampling_area_id))} />
                          <ListItemText primary={samplingArea.sampling_area_name} sx={{ whiteSpace: 'normal' }} />
                        </MenuItem>
                      )),
                    ]),
                  ])}
                </Select>
              </FormControl>
              {habitatSelectionRequired ? (
                <Alert severity="warning">
                  {availableSamplingAreas.length === 0
                    ? 'No sampling areas match the habitat or contact-zone filters. Adjust or clear these filters.'
                    : 'Select at least one matching sampling area to apply these filters.'}
                </Alert>
              ) : null}
            </Stack>
            <FormControl component="fieldset" sx={{ width: { xs: '100%', md: 'auto' }, flex: { md: 1 }, minWidth: 0 }}>
              <FormLabel component="legend" id="contact-zone-filter-label">Contact zone in the sampling area?</FormLabel>
              <RadioGroup
                row
                aria-labelledby="contact-zone-filter-label"
                name="contact-zone-filter"
                value={contactZone}
                onChange={(event) => {
                  setContactZone(event.target.value as '' | 'true' | 'false');
                  setFiltersApplied(false);
                }}
              >
                <FormControlLabel value="" control={<Radio />} label="Any" />
                <FormControlLabel value="true" control={<Radio />} label="Yes" />
                <FormControlLabel value="false" control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
          </Stack>
            <Box sx={{ width: '100%', minWidth: 0 }}>
              <HabitatCodeFilter
                descriptors={listHabitatCodes}
                value={habitatFilters}
                onChange={handleHabitatFiltersChange}
                matchingCount={availableSamplingAreas.length}
                additionalActiveCount={structureIds.length ? 1 : 0}
                onClear={() => { setStructureIds([]); setFiltersApplied(false); }}
              >
                <FormControl component="fieldset" aria-labelledby="habitat-structure-filter-label" sx={{ minWidth: 0 }}>
                  <Stack spacing={1}>
                    <Typography id="habitat-structure-filter-label" variant="subtitle2" sx={{ fontWeight: 600 }}>Habitat structure</Typography>
                    <ToggleButtonGroup exclusive size="small" sx={{ '& .MuiToggleButton-root': { fontSize: '0.6875rem' } }} value="ANY" aria-label="Matching mode for habitat structure">
                      <ToggleButton value="ANY">ANY selected</ToggleButton>
                    </ToggleButtonGroup>
                    <FormGroup aria-labelledby="habitat-structure-filter-label">
                      {habitatStructures.map(([id, name]) => (
                        <FormControlLabel
                          key={id}
                          label={name}
                          sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.8125rem' } }}
                          control={
                            <Checkbox
                              checked={structureIds.includes(id)}
                              onChange={(_, checked) => {
                                setStructureIds((selected) => checked ? [...selected, id] : selected.filter((value) => value !== id));
                                setFiltersApplied(false);
                              }}
                            />
                          }
                        />
                      ))}
                    </FormGroup>
                    <FormHelperText>Matches any selected structure. Leave empty to include all structures.</FormHelperText>
                  </Stack>
                </FormControl>
              </HabitatCodeFilter>
            </Box>
        </Stack>
      </Box>
      <Box component="fieldset" aria-labelledby="traits-properties-filters-title" sx={{ m: 1, minWidth: 0, p: { xs: 2, md: 3 }, pt: { xs: 1, md: 2 }, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Typography id="traits-properties-filters-title" component="legend" variant="subtitle2" sx={{ px: 1, fontWeight: 400 }}>
          Filters by traits and properties
        </Typography>
        <Stack spacing={2}>
          {/** Filters based on traits and properties */}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap' }}>
            <FormControl sx={{ m: 1, width: 300 }}>
              <InputLabel id="trait-select-label">Trait</InputLabel>
                <Select labelId="trait-select-label"
                        id="trait-select" 
                        value={inputSelectTrait}
                        label="Trait"
                        input={<OutlinedInput label="Traits" />}
                        onChange={handleChangeTrait}
                        sx={{ color: inputSelectTrait === 0 ? 'text.secondary' : 'text.primary' }}>

                <MenuItem value={0}>Trait</MenuItem>
                {listTraitTypes.map((type) => [
                    <ListSubheader key={type}>{type}</ListSubheader>,
                        ...listTraitProperties.filter(traitProp => traitProp.trait_type_name == type).map((trait) => (
                          <MenuItem key={trait.trait_id} value={trait.trait_id} sx={{ pl: 4 }}>
                            {trait.trait_name}
                          </MenuItem>
                        ))
                    ])}

                </Select>
            </FormControl>

            <FormControl sx={{ m: 1, width: 300 }}>
              <InputLabel id="trait_properties-label">Property</InputLabel>
                <Select labelId="trait_properties-label"
                        id="trait_properties" 
                        value={inputSelectProperty}
                        label="Property"
                        input={<OutlinedInput label="Properties" />}
                        onChange={handleChangeProperty}
                        sx={{ color: inputSelectProperty === 0 ? 'text.secondary' : 'text.primary' }}>

                  <MenuItem value={0}>Property</MenuItem>
                  {/** Only show the properties of the selected trait that are not already selected 
                   * 
                   * This code is commented because it is an alternative way to show the properties of the selected trait that are not already selected
                   * {inputSelectTrait && inputSelectTrait > 0 && listTraitProperties.filter(traitProp => traitProp.trait_id == inputSelectTrait)[0].properties.filter(property => !selectedPropertyValues.map(pV => pV.property_id).includes(property.property_id)).map((property) => (
                    <MenuItem key={property.property_id} value={property.property_id}>
                      {property.property_name}
                    </MenuItem>
                  ))}
                  */}
                  {inputSelectTrait && inputSelectTrait > 0 && listTraitProperties.filter(traitProp => traitProp.trait_id == inputSelectTrait)[0].properties.map((property) => (
                    <MenuItem key={property.property_id} value={property.property_id}>
                      {property.property_name}
                    </MenuItem>
                  ))}
                </Select>
            </FormControl>

            <FormControl sx={{ m: 1, width: 120 }}>
                <InputLabel>Operation</InputLabel>
                <Select labelId="operation_properties-label"
                        id="operation_properties" 
                        value={inputSelectOperation}
                        label="Operation"
                        input={<OutlinedInput label="Operation" />}
                        onChange={handleChangeOperation}>

                  <MenuItem value={''}>Operation</MenuItem>
                  {/** Show the list of operations from the global constant */}
                  {listOperationsProperty.map((operation) => (
                    <MenuItem key={operation.value} value={operation.value}>
                      {operation.name}
                    </MenuItem>
                  ))}
                </Select>
            </FormControl>
            {/** Show the value component based on the selected operation */}
            {LIST_QUERY_OPERATIONS.filter(operation => operation.value === inputSelectOperation)[0].showValueComponent && (
                <FormControl sx={{ m: 1, width: 200 }} error={Boolean(errorPropertyValue)}>
                  {LIST_DATA_TYPES_COMPONENTS.filter(dataType => dataType.id === inputDataType)[0].component === "input" && (
                              <>
                                <InputLabel id="value-property-filter">Value</InputLabel>
                                <OutlinedInput label="Value" 
                                value={inputPropertyValueFilter}
                                type="text" 
                                onChange={handleInputPropertyValueChange}/>
                              </>
                            )}
                  {LIST_DATA_TYPES_COMPONENTS.filter(dataType => dataType.id === inputDataType)[0].component === "calendar" && (
                              <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DemoContainer components={['DatePicker']}>
                                  <DatePicker
                                    label="Value"
                                    value={inputDate}
                                    format={DATE_FORMAT_TEMPLATE}
                                    onChange={(newValue) => { handleInputPropertyDateChange(newValue); }}
                                    slotProps={{
                                      textField: {
                                        helperText: DATE_FORMAT_TEMPLATE,
                                      },
                                    }}
                                  />
                                </DemoContainer>
                              </LocalizationProvider>
                            )}
                  {errorPropertyValue ? <FormHelperText>{errorPropertyValue}</FormHelperText> : null}
                </FormControl>
             )}
            <Button
              color={inputSelectProperty > 0 && 
                     inputPropertyValueFilter && 
                     inputPropertyValueFilter.length > 0 && 
                     inputSelectOperation && 
                     inputSelectOperation.length > 0 && 
                     !errorPropertyValue ? "primary" : "inherit"}
              variant={inputSelectProperty > 0 && 
                       inputPropertyValueFilter && 
                       inputPropertyValueFilter.length > 0 && 
                       inputSelectOperation && 
                       inputSelectOperation.length > 0 && 
                       !errorPropertyValue ? "contained" : "outlined"}
              startIcon={<AddIcon fontSize="var(--icon-fontSize-md)" />}
              onClick={handleClickAddProperty}
              sx={{
                ...(inputSelectProperty > 0 && 
                    inputPropertyValueFilter && 
                    inputPropertyValueFilter.length > 0 && 
                    inputSelectOperation && 
                    inputSelectOperation.length > 0 && 
                    !errorPropertyValue && {
                  animation: 'pulse 2s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': {
                      transform: 'scale(1)',
                      boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.7)',
                    },
                    '50%': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 0 0 10px rgba(25, 118, 210, 0)',
                    },
                  },
                }),
              }}
            >
              Add
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap' }}>
            {selectedPropertyValues.map((property) => (

                <Chip
                key={property.key}
                label={`${property.property_name} ${property.operation_symbol} ${property.value}`}
                variant="outlined"
                onDelete={handleDeleteChosenProperty(property.key)}
                />

            ))}
            {/** Show the condition to join the properties in the query only if there is more than one property selected */}
            {selectedPropertyValues.length > 1 && 
              <FormControl sx={{ m: 1, width: 100 }}>
                  <InputLabel>Condition</InputLabel>
                  <Select labelId="condition_properties-label"
                          id="condition_properties" 
                          value={inputSelectCondition}
                          label="Condition"
                          input={<OutlinedInput label="Condition" />}
                          onChange={handleChangeCondition}>

                    {/** Show the list of conditions to join the properties in the query */}
                    {LIST_CONDITIONS_QUERY.map((condition) => (
                      <MenuItem key={condition.value} value={condition.value}>
                        {condition.name}
                      </MenuItem>
                    ))}
                  </Select>
              </FormControl>
            }
          </Stack>
        </Stack>
      </Box>

      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', mt: 2 }}>
      {/** Show the list of columns to include in the output */}
        <FormControl fullWidth >
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 400, color: 'primary.main' }}>
            Select the properties you want to include in your output table
          </Typography>
          <Autocomplete 
            multiple
            onChange={handleIncludePropertiesChange}
            options={optionsOutputProperties}
            value={optionsOutputProperties.filter(option => selectedOutputProperties.includes(option.property_id))}
            groupBy={(option) => option.groupProperty}
            disableCloseOnSelect
            getOptionLabel={(option) => option.property_name}
            renderOption={(props, option, { selected }) => {
              const { key, ...optionProps } = props;
              return (
                <li key={key} {...optionProps}>
                  <Checkbox
                    icon={icon}
                    checkedIcon={checkedIcon}
                    style={{ marginRight: 8 }}
                    checked={selected}
                  />
                  {option.property_name}
                </li>
              );
            }}
            renderInput={(params) => (
              <TextField {...params} placeholder="Select one or more" />
            )}
          />
        </FormControl>
        <Button
          color={!filtersApplied ? "primary" : "inherit"}
          variant='contained'
          disabled={habitatSelectionRequired}
          onClick={() => {
            if (habitatSelectionRequired) return;
            setFiltersApplied(true);
            handleFilterClick(inputOrganismNameFilter, 
                             inputSelectSpecies, 
                             habitatFiltersActive ? matchingSelectedSamplingAreas : inputSelectSamplingArea,
                             inputSelectProject,
                             selectedPropertyValues,
                             inputSelectCondition,
                             selectedOutputProperties
                           );
            // Scroll down to make the output table visible
            setTimeout(() => {
              window.scrollBy({ top: 600, behavior: 'smooth' });
            }, 100);
          }}
          startIcon={<FilterIcon fontSize="var(--icon-fontSize-md)" />}
          sx={{
            ...( !filtersApplied && {
              animation: 'pulse 2s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': {
                  transform: 'scale(1)',
                  boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.7)',
                },
                '50%': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 0 0 10px rgba(25, 118, 210, 0)',
                },
              },
            }),
          }}
        >
          Filter
        </Button>
      </Stack>

    </Card>
  );
}
