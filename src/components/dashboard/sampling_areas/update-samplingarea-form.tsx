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
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import { Controller, set, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { config } from '@/config';

import { getSamplingAreaRequest, updateSamplingAreaRequest } from '@/api/samplingAreas';
import { getLocationsByCountryRequest } from '@/api/locations';
import { getCountriesWithLocationsRequest } from '@/api/countries';

const schema = zod.object({
  name: zod.string().min(1, { message: 'Name is required' }).max(255, { message: 'Name is too long' }),
  description: zod.string().min(1, { message: 'Description of the coordinates is required' }).max(255, { message: 'Description is too long' }),
  latitude: zod.string().min(3).max(10).or(zod.string().max(0)),
  longitude: zod.string().min(3).max(10).or(zod.string().max(0)),
  country_id: zod.string().min(2, { message: 'Country is required' }).max(2),
  location_id: zod.number().min(1, { message: 'Location is required' }),
});

type Values = zod.infer<typeof schema>;


export function UpdateSamplingAreaForm(): React.JSX.Element {
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
      country_id: '0',
      location_id: 0,
      longitude: '',
      latitude: '',
    },
   });


  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [successMessage, setSuccessMessage] = React.useState(null);
  const [listCountries, setListCountries] = useState([]);
  const [listLocations, setListLocations] = useState([]);
  const params = useParams<{ id: int }>();
  const [samplingAreaId, setSamplingAreaId] = useState(params.id);
  const [samplingAreaName, setSamplingAreaName] = useState<string>('');

  const isMounted = useRef(false);
  
  useEffect(() => {
      const fetchSamplingArea = async () => {
        try {
          if (!isMounted.current) {
            isMounted.current = true;
            //fetch sampling area info
            const responseSamplingArea = await getSamplingAreaRequest(samplingAreaId);
            if (responseSamplingArea.data && responseSamplingArea.data.length > 0) {
              reset({ name: responseSamplingArea.data[0].name, 
                      description: responseSamplingArea.data[0].description, 
                      country_id: responseSamplingArea.data[0].country_id,
                      location_id: responseSamplingArea.data[0].location_id,
                      longitude: responseSamplingArea.data[0].longitude,
                      latitude: responseSamplingArea.data[0].latitude });

              setSamplingAreaName(responseSamplingArea.data[0].name);
              document.title = `Update Sampling Area: ${responseSamplingArea.data[0].name} | Dashboard | ${config.site.name}`;
            }

            //Fetch countries info
            const responseCountries = await getCountriesWithLocationsRequest();
            if (responseCountries.data && responseCountries.data.length > 0) {
              setListCountries(responseCountries.data);
            }

            if(responseSamplingArea.data[0].country_id && responseSamplingArea.data[0].country_id !== '0') {
              console.log('Fetching locations for country:', responseSamplingArea.data[0].country_id);
              setListLocations([]); // Reset locations before fetching new ones
              //Fetch locations info by country
              const responseLocations = await getLocationsByCountryRequest(responseSamplingArea.data[0].country_id);
              if (responseLocations.data && responseLocations.data.length > 0) {
                setListLocations(responseLocations.data);
              }
            }

          }
        } catch (error) {
          console.error('Error fetching sampling area info:', error);
        }
      };
  
      fetchSamplingArea();
  
    }, []);

//When the Update button is pressed, the form is submitted and the sampling area is updated
  const onSubmit = React.useCallback(
      async (values: Values): Promise<void> => {
        setIsPending(true);
        setSuccessMessage(null);
        try{
          await updateSamplingAreaRequest(samplingAreaId, values);
          setSuccessMessage(`Sampling area ${values.name} updated successfully!`);
          setIsPending(false);

        }catch(error){
          if (error instanceof Error && error.request && error.request.response) {
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
  const handleCountryChange = async (event: React.ChangeEvent<{ value: unknown }>) => { if (event.target.value) {
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
        <CardHeader title={`Update sampling area ${samplingAreaName}`} />
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
                  <OutlinedInput {...field} label="Description" type="text" multiline="true" minRows={4}/>
                  {errors.description ? <FormHelperText>{errors.description.message}</FormHelperText> : null}
                </FormControl>
                )}
            />
            <Controller
                control={control}
                name="country_id"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.country_id)}>
                  <InputLabel>Country</InputLabel>
                    <Select {...field} defaultValue="0" label="Country" variant="outlined" onChange={handleCountryChange}>
                    <MenuItem value={0} >Select Country</MenuItem>
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
                    <Select {...field} defaultValue="0" label="Location" variant="outlined">
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
                name="latitude"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.latitude)}>
                  <InputLabel>Latitude</InputLabel>
                  <OutlinedInput {...field} label="Latitude" type="text"/>
                  {errors.latitude ? <FormHelperText>{errors.latitude.message}</FormHelperText> : null}
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
                  {errors.longitude ? <FormHelperText>{errors.longitude.message}</FormHelperText> : null}
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
          <Button type="submit" variant="contained" disabled={isPending}>Update</Button>
        </CardActions>
      </Card>
    </form>
  );
}
