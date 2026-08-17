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
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { config } from '@/config';
import { AxiosError } from 'axios';

import { createLocationRequest } from '@/api/locations';
import { getCountriesRequest } from '@/api/countries';

const schema = zod.object({
  name: zod.string().min(1, { message: 'Name is required' }).max(255, { message: 'Name is too long' }),
  country_id: zod.string().min(2, { message: 'Country is required' }).max(2),
  extra_info: zod.string().max(1000).or(zod.string().max(0)),
});


type Values = zod.infer<typeof schema>;


export function CreateLocationForm(): React.JSX.Element {
  const router = useRouter();

  const {
    control,
    reset,
    handleSubmit,
    setError,
    formState,
    formState: { errors, isSubmitSuccessful },
  } = useForm<Values>({ resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      country_id: '0',
      extra_info: '',
    },
   });


  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [listCountries, setListCountries] = useState<{ id: number; name: string }[]>([]);

  const isMounted = useRef(false);
  
  useEffect(() => {
      const fetchCountries = async () => {
        try {
          if (!isMounted.current) {
            isMounted.current = true;
            //Fetch countries info
            const responseCountries = await getCountriesRequest();
            if (responseCountries.data && responseCountries.data.length > 0) {
              setListCountries(responseCountries.data);
            }

          }
        } catch (error) {
          console.error('Error fetching location info:', error);
        }
      };
  
      fetchCountries();
  
    }, []);

//When the create button is pressed, the form is submitted and the location is created
  const onSubmit = React.useCallback(
      async (values: Values): Promise<void> => {
        setIsPending(true);
        setSuccessMessage(null);
        try{
          await createLocationRequest(values);
          setSuccessMessage(`Location ${values.name} created successfully!`);
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

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader title={`Create location`} />
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
                name="country_id"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.country_id)}>
                  <InputLabel>Country</InputLabel>
                    <Select {...field} value={field.value ?? '0'}
                     label="Country" variant="outlined">
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
                name="extra_info"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.extra_info)}>
                  <InputLabel>Additional information</InputLabel>
                  <OutlinedInput {...field} label="Additional information" type="text" multiline={true} minRows={4}/>
                  {errors.extra_info ? <FormHelperText>{errors.extra_info.message}</FormHelperText> : null}
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
