import * as React from 'react';
import {useState, useEffect} from 'react';
import Card from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';

//Components for the filters
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
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
import { Trash as DeleteIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { Funnel as FilterIcon } from '@phosphor-icons/react/dist/ssr/Funnel';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { Plus as AddIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { Button } from '@mui/material';

import { LIST_QUERY_OPERATIONS, 
         LIST_RELATION_DATA_TYPE_OPERATION, 
         LIST_CONDITIONS_QUERY, 
         LIST_DATA_TYPES_VALIDATIONS,
         LIST_DATA_TYPES_COMPONENTS,
         DATE_FORMAT_TEMPLATE } from '@/constants';


interface OrganismsFiltersProps {
  listLocations: [];
  listSamplingAreas: [];
  listSpecies: [];
  listProjects: [];
  listTraitProperties: [];
  listPropertiesNoGroupped: [];
  listTraitTypes: [];
  handleFilterClick: (pFilterName : string, 
                      pInputSelectSpecies: string [],
                      pInputSelectLocation: string [], 
                      pInputSelectSamplingArea: string [], 
                      pInputSelectProject: string [], 
                      pInputSelectPropertyValues: any [],
                      pInputSelectCondition: string,
                      pInputSelectedOutputProperties: number []) => void;
}

export function OrganismsFilters({
  listLocations,
  listSamplingAreas,
  listSpecies,
  listProjects,
  listTraitProperties,
  listPropertiesNoGroupped,
  listTraitTypes,
  handleFilterClick,
}:OrganismsFiltersProps): React.JSX.Element {

  const [inputOrganismNameFilter, setInputOrganismNameFilter] = useState<string>('');
  const [inputSelectSpecies, setInputSelectSpecies] = React.useState<string[]>([]);
  const [inputSelectLocation, setInputSelectLocation] = React.useState<string[]>([]);
  const [inputSelectSamplingArea, setInputSelectSamplingArea] = React.useState<string[]>([]);
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
  const [selectedOutputProperties, setSelectedOutputProperties] = React.useState([]);

  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputOrganismNameFilter(event.target.value);
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

  const handleInputPropertyDateChange = (value: string | React.SetStateAction<dayjs.Dayjs | null>) => {

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
  };

  const handleChangeLocation = (event: SelectChangeEvent<typeof inputSelectLocation>) => {
    const {
      target: { value },
    } = event;
    setInputSelectLocation(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  const handleChangeSamplingArea = (event: SelectChangeEvent<typeof inputSelectSamplingArea>) => {
    const {
      target: { value },
    } = event;
    setInputSelectSamplingArea(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  const handleChangeProject = (event: SelectChangeEvent<typeof inputSelectProject>) => {
    const {
      target: { value },
    } = event;
    setInputSelectProject(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
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

    setInputDataType(parseInt(tmpProperty.data_type_id));

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
  };

  //Process the selected properties to show in the output table
  const handleIncludePropertiesChange = (_, value) => {
    console.log(value.map((v) => v.property_id));
    setSelectedOutputProperties(value.map((v) => v.property_id));
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
          <InputLabel id="sampling-area-multiple-checkbox-label">Sampling area</InputLabel>
          <Select
            labelId="sampling-area-multiple-checkbox-label"
            id="sampling-area-multiple-checkbox"
            multiple
            value={inputSelectSamplingArea}
            onChange={handleChangeSamplingArea}
            input={<OutlinedInput label="Sampling area" />}
            renderValue={(selected) => listSamplingAreas.filter(samplingArea => selected.includes(samplingArea.sampling_area_id)).map(samplingArea => samplingArea.sampling_area_name).join(', ')}
            MenuProps={MenuProps}
            >

            {listLocations.map((location) => [
                <ListSubheader key={location}>{location}</ListSubheader>,
                    ...listSamplingAreas.filter(samplingArea => samplingArea.location_name == location).map((samplingArea) => (
                      <MenuItem key={samplingArea.sampling_area_id} value={samplingArea.sampling_area_id} sx={{ pl: 4 }}>
                        <Checkbox checked={inputSelectSamplingArea.includes(samplingArea.sampling_area_id)} />
                        <ListItemText primary={samplingArea.sampling_area_name} />
                      </MenuItem>
                    ))
                ])}
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
      {/** Filters based on traits and properties */}
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap' }}>
        <FormControl sx={{ m: 1, width: 300 }}>
          <InputLabel>Trait</InputLabel>
            <Select labelId="trait-select-label"
                    id="trait-select" 
                    value={inputSelectTrait}
                    label="Trait"
                    input={<OutlinedInput label="Traits" />}
                    onChange={handleChangeTrait}>

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
          <InputLabel>Property</InputLabel>
            <Select labelId="trait_properties-label"
                    id="trait_properties" 
                    value={inputSelectProperty}
                    label="Property"
                    input={<OutlinedInput label="Properties" />}
                    onChange={handleChangeProperty}>

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
          color="inherit"
          variant='outlined'
          startIcon={<AddIcon fontSize="var(--icon-fontSize-md)" />}
          onClick={handleClickAddProperty}
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
      
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', mt: 2 }}>
      {/** Show the list of columns to include in the output */}
        <FormControl fullWidth >
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
              <TextField {...params} label="Select the properties you want to include in your output table." placeholder="Select one or more" />
            )}
          />
        </FormControl>
        <Button
          color="inherit"
          variant='contained'
          onClick={() => {handleFilterClick(inputOrganismNameFilter, 
                                            inputSelectSpecies, 
                                            inputSelectSamplingArea,
                                            inputSelectProject,
                                            selectedPropertyValues,
                                            inputSelectCondition,
                                            selectedOutputProperties
                                          )}}
          startIcon={<FilterIcon fontSize="var(--icon-fontSize-md)" />}
        >
          Filter
        </Button>
      </Stack>

    </Card>
  );
}
