'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {useEffect, useState, useRef} from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import Chip from '@mui/material/Chip';
import { Plus as AddIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { AxiosError } from 'axios';

import { getTraitRequest } from '@/api/traits';
import { createTraitPropertyRequest } from '@/api/properties';
import { getDataTypesRequest } from '@/api/dataTypes';
import { DATA_TYPE_TEXT } from '@/constants';


const schema = zod.object({
  name: zod.string().min(1, { message: 'Name is required' }),
  description: zod.string().min(1, { message: 'Description is required' }),
  data_type_id: zod.number().min(1, { message: 'The type of data is required' }),
  is_column_required: zod.boolean(),
  template_column_name: zod.string().min(0).nullable().optional(),
  pre_defined_values: zod.string().min(0, { message: 'Enter valid pre-defined values' }).nullable().optional(),
  protocol: zod.string().nullable().optional(),
  req_project_must_read: zod.boolean(),
}).refine(data => !data.is_column_required || (data.template_column_name && data.template_column_name.length > 0), {
  message: 'Please provide the column corresponding to the property in the batch template.',
  path: ['template_column_name']
});

type Values = zod.infer<typeof schema>;

export function CreatePropertyForm(): React.JSX.Element {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const pTraitId = params.id; //Obtain the trait id from the URL
  const [traitName, setTraitName] = useState<string>('');
  const [traitLocationAssociated, setTraitLocationAssociated] = useState<boolean>(false);
  const [inputPropertyDefaultValue, setInputPropertyDefaultValue] = useState<string>('');
  const [listDataTypes, setListDataTypes] = useState([]);
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [selectedPropertyDefaultValues, setSelectedPropertyDefaultValues] = React.useState<string[]>([]);
  const [selectedDataType, setSelectedDataType] = React.useState<number>(0);

  const {
      control,
      reset,
      handleSubmit,
      setError,
      clearErrors,
      setValue,
      formState,
      formState: { errors, isSubmitSuccessful },
    } = useForm<Values>({ resolver: zodResolver(schema),
      defaultValues: {
        name: '',
        description: '',
        data_type_id: 0,
        template_column_name: '',
        pre_defined_values: '',
        is_column_required: false,
        protocol: '',
        req_project_must_read: false,
      },
     });

    const isMounted = useRef(false);
       
    useEffect(() => {
        const fetchTrait = async () => {
          try {
            if (!isMounted.current) {
              isMounted.current = true;
              //fetch trait info
              const responseTrait = await getTraitRequest(pTraitId);
              if (responseTrait.data && responseTrait.data.length > 0) {
                const trait = responseTrait.data[0] as { name: string; is_location_associated: boolean };
                setTraitName(trait.name);
                setTraitLocationAssociated(trait.is_location_associated);
                setValue('is_column_required', !trait.is_location_associated);
              }

              //Fetch dataTypes info
              const responseDataTypes = await getDataTypesRequest();
              if (responseDataTypes.data && responseDataTypes.data.length > 0) {
                setListDataTypes(responseDataTypes.data);
              }
            }
          } catch (error) {
            console.error('Error fetching trait info:', error);
          }
        };
    
        fetchTrait();
    
      }, []);

  const onSubmit = React.useCallback(
      async (values: Values): Promise<void> => {
        setIsPending(true);
        setSuccessMessage(null);
        try{
          const requestData = { ...values, 
            trait_id: pTraitId,
            template_column_name: values.template_column_name || null,
            protocol: values.protocol || null,  }; // Add trait_id to the values object
          await createTraitPropertyRequest(requestData);
          reset({ name: '',
            description: '',
            data_type_id: 0,
            template_column_name: '',
            pre_defined_values: '',
            is_column_required: false,
            protocol: '',});
            setSelectedDataType(0);
          setSuccessMessage(`Property ${values.name} created successfully!`);
          setIsPending(false);

        }catch(error){
          if (error instanceof AxiosError && error.request && error.request.response) {
            const errorMessage = JSON.parse(error.request.response).message;
            setError('root', { type: 'server', message: String(errorMessage) });
          } else {
            setError('root', { type: 'server', message: String(error) });
          }
          setIsPending(false);
          return;
        }

        // UserProvider, for this case, will not refresh the router
        // After refresh, GuestGuard will handle the redirect
        router.refresh();
      },
      [router, reset, setError]
    );

  const handleDataTypeChange = (event: SelectChangeEvent<string>) => {
      const value = Number(event.target.value);
      setSelectedDataType(value);
      setValue('data_type_id', value);
      clearErrors('data_type_id'); // Clear the error for the data_type_id field

      // Clear the fields for the pre-defined values
      // Update the selected property default values, it is used to show the selected values
      setSelectedPropertyDefaultValues([]);
      setValue('pre_defined_values', '');
      setInputPropertyDefaultValue('');
  }

  const handleInputPreDefinedValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setInputPropertyDefaultValue(value);

  }

  const handleClickAddPredefinedValue = () => {
      if (inputPropertyDefaultValue && inputPropertyDefaultValue.length > 0) {
        const tmpPropertyDefaultValue = selectedPropertyDefaultValues.find(property => property === inputPropertyDefaultValue);
        // Check if the value is already in the list
        // if the value is already in the list, do not add it again
        if (tmpPropertyDefaultValue) {
          return;
        }
        const tmpArrayPropertyDefaultValues = [...selectedPropertyDefaultValues, inputPropertyDefaultValue];

        // Update the selected property default values, it is used to show the selected values
        setSelectedPropertyDefaultValues(tmpArrayPropertyDefaultValues);

        setValue('pre_defined_values', tmpArrayPropertyDefaultValues.join("/"));
        setInputPropertyDefaultValue('');
      }
  }

  const handleDeleteChosenDefaultValue = (value_delete: string) => () => {
    setSelectedPropertyDefaultValues(selectedPropertyDefaultValues.filter(property => property !== value_delete));

  };
    
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader title={`New property of the trait ${traitName}`} />
        <Divider />
        <CardContent>
          <Stack spacing={3} sx={{ maxWidth: 'sm' }}>
            <Controller
                control={control}
                name="name"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.name)}>
                  <InputLabel>Name</InputLabel>
                  <OutlinedInput {...field} label="Name" type="text"/>
                  {errors.name ? <FormHelperText>{errors.name.message}</FormHelperText> : null}
                </FormControl>
                )}
            />
            <Controller
                control={control}
                name="description"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.description)}>
                  <InputLabel>Description</InputLabel>
                  <OutlinedInput {...field} label="Description" type="text" multiline={true} minRows={4}/>
                  {errors.description ? <FormHelperText>{errors.description.message}</FormHelperText> : null}
                </FormControl>
                )}
            />
            <FormControl fullWidth error={Boolean(errors.data_type_id)}>
              <InputLabel>Data type</InputLabel>
                <Select
                  value={selectedDataType.toString()}
                  label="Data type"
                  variant="outlined"
                  onChange={handleDataTypeChange}
                >
                <MenuItem value="0">Select Data Type</MenuItem>
                  {listDataTypes.map((option) => (
                    <MenuItem key={option.id} value={option.id.toString()}>
                      {option.name}
                    </MenuItem>
                  ))}
                </Select>
              {errors.data_type_id ? <FormHelperText>{errors.data_type_id.message}</FormHelperText> : null}
              {selectedDataType === DATA_TYPE_TEXT ? (
                <FormHelperText>
                  This data type can be used to register URLs to external datasets. In the Organisms table, the recorded value will be shown as a link only when the provided value has a valid URL format.
                </FormHelperText>
              ) : null}
            </FormControl>
            {/* Only properties that not associated with location require a column */}
            {!traitLocationAssociated &&
              <Controller
                  control={control}
                  name="template_column_name"
                  render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.template_column_name)}>
                    <InputLabel>Template column name</InputLabel>
                    <OutlinedInput {...field} label="Column name in the template" type="text"/>
                    {errors.template_column_name ? <FormHelperText>{errors.template_column_name.message}</FormHelperText> : null}
                  </FormControl>
                  )}
              />
            }

            {/*
            // Pre defined values are only available if the data type is text */
            selectedDataType === DATA_TYPE_TEXT && (
            <>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <FormControl fullWidth >
                <InputLabel>Pre-defined values</InputLabel>
                <OutlinedInput value={inputPropertyDefaultValue} 
                onChange={ handleInputPreDefinedValueChange }
                label="Pre-defined values" type="text"/>
              </FormControl>
              <Button
                  color="inherit"
                  variant='outlined'
                  startIcon={<AddIcon fontSize="var(--icon-fontSize-md)" />}
                  onClick={handleClickAddPredefinedValue}
                >
                  Add
                </Button>
              </Stack>
              {selectedPropertyDefaultValues.length > 0 &&
                <Box>
                <Typography variant="subtitle1">Selected default values</Typography>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap' }}>
                  {selectedPropertyDefaultValues.map((property) => (
                    <Chip
                    key={property}
                    label={`${property}`}
                    variant="outlined"
                    onDelete={handleDeleteChosenDefaultValue(property)}
                    />
                    ))}
                  </Stack>
              </Box>
              }
            </>
            )
            }
            <Controller
                control={control}
                name="protocol"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.protocol)}>
                  <InputLabel>Protocol</InputLabel>
                  <OutlinedInput {...field} label="Protocol" type="text" multiline={true} minRows={4}/>
                  {errors.protocol ? <FormHelperText>{errors.protocol.message}</FormHelperText> : null}
                </FormControl>
                )}
            />
            <Controller
                control={control}
                name="req_project_must_read"
                render={({ field }) => (
                <FormControl fullWidth >
                  <InputLabel>Require must read in projects</InputLabel>
                  <Select
                    {...field}
                    onChange={e => field.onChange(e.target.value === 'true')}
                    label="Require must read in projects"
                    variant="outlined"
                  >
                    <MenuItem value={'true'}>Yes</MenuItem>
                    <MenuItem value={'false'}>No</MenuItem> 
                  </Select>
                  <FormHelperText>If 'Yes', when the user downloads organism data for this property, the system displays the 'Must read' information of the projects associated with the organisms before proceeding with the data download.</FormHelperText>
                </FormControl>
                )}
            />
          </Stack>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
            {isSubmitSuccessful ? <Alert color="success">{successMessage}</Alert> : null}
          </Stack>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained" disabled={isPending}>Create</Button>
        </CardActions>
      </Card>
    </form>
  );
}
