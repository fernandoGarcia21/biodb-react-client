'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'next/navigation'
import {useEffect, useState, useRef} from 'react';
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
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { config } from '@/config';
import { AxiosError } from 'axios';

import { createSamplingAreaRequest } from '@/api/samplingAreas';
import { getAllHabitatsRequest } from '@/api/habitats';
import { getLocationsByCountryRequest } from '@/api/locations';
import { getCountriesWithLocationsRequest } from '@/api/countries';

const schema = zod.object({
  name: zod.string().min(1, { message: 'Name is required' }).max(255, { message: 'Name is too long' }),
  description: zod.string().min(1, { message: 'Description of the coordinates is required' }).max(1000, { message: 'Description is too long' }),
  latitude: zod
    .string()
    .trim()
    .min(1, { message: 'Latitude is required' })
    .refine((value) => /^-?\d+(\.\d+)?$/.test(value), {
      message: 'Latitude must be a decimal number (e.g. 58.84128)',
    })
    .refine((value) => Number(value) >= -90 && Number(value) <= 90, {
      message: 'Latitude must be between -90 and 90',
    }),
  longitude: zod
    .string()
    .trim()
    .min(1, { message: 'Longitude is required' })
    .refine((value) => /^-?\d+(\.\d+)?$/.test(value), {
      message: 'Longitude must be a decimal number (e.g. 11.05111)',
    })
    .refine((value) => Number(value) >= -180 && Number(value) <= 180, {
      message: 'Longitude must be between -180 and 180',
    }),
  country_id: zod.string().min(2, { message: 'Country is required' }).max(2),
  location_id: zod.number().min(1, { message: 'Location is required' }),
  habitat_id: zod.number().optional(),
});


type Values = zod.infer<typeof schema>;


export function CreateSamplingAreaForm(): React.JSX.Element {
  const router = useRouter();

  const {
    control,
    reset,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState,
    formState: { errors, isSubmitSuccessful },
  } = useForm<Values>({ resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      habitat_id: 0,
      country_id: '0',
      location_id: 0,
      longitude: '',
      latitude: '',
    },
   });


  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [listCountries, setListCountries] = useState<{ id: number; name: string }[]>([]);
  const [listLocations, setListLocations] = useState<{ id: number; name: string }[]>([]);
  const [listHabitats, setListHabitats] = useState<{ id: number; name: string; description: string }[]>([]);

  // Watch the habitat_id field to get the selected habitat
  const selectedHabitatId = watch('habitat_id');
  
  // Find the selected habitat from the list
  const selectedHabitat = React.useMemo(() => {
    return listHabitats.find(habitat => habitat.id === selectedHabitatId);
  }, [selectedHabitatId, listHabitats]);

  const isMounted = useRef(false);
  
  useEffect(() => {
      const fetchLocations = async () => {
        try {
          if (!isMounted.current) {
            isMounted.current = true;
            //Fetch countries info
            const responseCountries = await getCountriesWithLocationsRequest();
            if (responseCountries.data && responseCountries.data.length > 0) {
              setListCountries(responseCountries.data);
            }

            //Fetch habitats info
            const responseHabitats = await getAllHabitatsRequest();
            if (responseHabitats.data && responseHabitats.data.length > 0) {
              setListHabitats(responseHabitats.data);
            }

          }
        } catch (error) {
          console.error('Error fetching location info:', error);
        }
      };
  
      fetchLocations();
  
    }, []);

//When the create button is pressed, the form is submitted and the sampling area is created
  const onSubmit = React.useCallback(
      async (values: Values): Promise<void> => {
        setIsPending(true);
        setSuccessMessage(null);
        try{
          // Convert habitat_id to null if it's 0
          const submitData = {
            ...values,
            habitat_id: values.habitat_id === 0 ? null : values.habitat_id
          };
          await createSamplingAreaRequest(submitData);
          setSuccessMessage(`Sampling area ${values.name} created successfully!`);
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

 // Handle country change to fetch locations
  const handleCountryChange = async (event: SelectChangeEvent<number>) => { if (event.target.value) {
    const selectedCountryId = event.target.value as string; 
    console.log('Selected country ID:', selectedCountryId);
    setListLocations([]); // Reset locations before fetching new ones
    setValue('country_id', selectedCountryId); // Update the form value
    setValue('location_id', 0); // Reset location_id when country changes
    try {
      const responseLocations = await getLocationsByCountryRequest(selectedCountryId);
      if (responseLocations.data && responseLocations.data.length > 0) {
        setListLocations(responseLocations.data);
      } else {
        setListLocations([]); // Clear locations if none found
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      setListLocations([]); // Clear locations on error
    }
  }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader title={`Create sampling area`} />
        <Divider />
        <CardContent>
          <Stack spacing={3} sx={{ maxWidth: 'sm' }}>
            <Controller
                control={control}
                name="country_id"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.country_id)}>
                  <InputLabel>Country</InputLabel>
                    <Select {...field} value={field.value ?? 0} label="Country" variant="outlined"  onChange={handleCountryChange}>
                    <MenuItem value={0}>Select Country</MenuItem>
                      {listCountries.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.name}
                        </MenuItem>
                      ))}
                    </Select>
                  {errors.country_id ? <FormHelperText>{errors.country_id.message}</FormHelperText> : null}
                </FormControl>
                )}
            />
            <Controller
                control={control}
                name="location_id"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.location_id)}>
                  <InputLabel>Location</InputLabel>
                    <Select {...field} value={field.value ?? 0}
                    onChange={e => field.onChange(Number(e.target.value))} label="Location" variant="outlined">
                    <MenuItem value={0}>Select Location</MenuItem>
                      {listLocations.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.name}
                        </MenuItem>
                      ))}
                    </Select>
                  {errors.location_id ? <FormHelperText>{errors.location_id.message}</FormHelperText> : null}
                </FormControl>
                )}
            />
            <Controller
                control={control}
                name="habitat_id"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.habitat_id)}>
                  <InputLabel>Habitat</InputLabel>
                    <Select {...field} value={field.value ?? 0}
                    onChange={e => field.onChange(Number(e.target.value))} label="Habitat" variant="outlined">
                    <MenuItem value={0}>Select Habitat</MenuItem>
                      {listHabitats.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.name}
                        </MenuItem>
                      ))}
                    </Select>
                  {errors.habitat_id ? <FormHelperText>{errors.habitat_id.message}</FormHelperText> : null}
                  {selectedHabitat && selectedHabitat.description && (
                    <Box sx={{ mt: 1, p: 1.5, bgcolor: 'background.level1', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {selectedHabitat.description}
                      </Typography>
                    </Box>
                  )}
                </FormControl>
                )}
            />
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
            <Controller
                control={control}
                name="latitude"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.latitude)}>
                  <InputLabel>Latitude</InputLabel>
                  <OutlinedInput {...field} label="Latitude" type="text"/>
                  {errors.latitude ? (
                    <FormHelperText>{errors.latitude.message}</FormHelperText>
                  ) : (
                    <FormHelperText>WGS84 (EPSG:4326), decimal degrees. Example: 58.84128</FormHelperText>
                  )}
                </FormControl>
                )}
            />
            <Controller
                control={control}
                name="longitude"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.longitude)}>
                  <InputLabel>Longitude</InputLabel>
                  <OutlinedInput {...field} label="Longitude" type="text"/>
                  {errors.longitude ? (
                    <FormHelperText>{errors.longitude.message}</FormHelperText>
                  ) : (
                    <FormHelperText>WGS84 (EPSG:4326), decimal degrees. Example: 11.05111</FormHelperText>
                  )}
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
