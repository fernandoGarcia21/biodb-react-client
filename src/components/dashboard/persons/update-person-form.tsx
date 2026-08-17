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
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { config } from '@/config';
import { AxiosError } from 'axios';
import { useBrandTitle } from '@/hooks/use-brand-title';

import { getPersonRequest, updatePersonRequest } from '@/api/persons';

const schema = zod.object({
  first_name: zod.string().min(1, { message: 'First name is required' }),
  family_name: zod.string().min(1, { message: 'Family name is required' }),
  abbreviation: zod.string().min(0, { message: 'Invalid description' }).optional(),
  email: zod.string().email({ message: 'Invalid email address' }).optional(),
  additional_info: zod.string().min(0, { message: 'Invalid additional information' }).optional(),
});

type Values = zod.infer<typeof schema>;


export function UpdatePersonForm(): React.JSX.Element {
  const router = useRouter();

  const {
    control,
    reset,
    handleSubmit,
    setError,
    watch,
    setValue,
    clearErrors,
    formState,
    formState: { errors, isSubmitSuccessful },
  } = useForm<Values>({ resolver: zodResolver(schema),
    defaultValues: {
      first_name: '',
        family_name: '',
        abbreviation: '',
        email: '',
        additional_info: '',
    },
   });


  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const params = useParams<{ id: string }>();
  const [personId, setPersonId] = useState(params.id);
  const brandTitle = useBrandTitle();
  const isMounted = useRef(false);
  
  useEffect(() => {
      const fetchPerson = async () => {
        try {
          if (!isMounted.current) {
            isMounted.current = true;
            //fetch person info
            const responsePerson = await getPersonRequest(personId);
            if (responsePerson.data && responsePerson.data.length > 0) {
              reset({ first_name: responsePerson.data[0].first_name, 
                      family_name: responsePerson.data[0].family_name ? responsePerson.data[0].family_name : '',
                      abbreviation: responsePerson.data[0].abbreviation ? responsePerson.data[0].abbreviation : '',
                      email: responsePerson.data[0].email ? responsePerson.data[0].email : '',
                      additional_info: responsePerson.data[0].additional_info ? responsePerson.data[0].additional_info : ''
                      , });
              document.title = `Update Person: ${responsePerson.data[0].first_name} ${responsePerson.data[0].family_name} | ${brandTitle}`;
            }
          }
        } catch (error) {
          console.error('Error fetching person info:', error);
        }
      };
  
      fetchPerson();
  
    }, []);

//When the Update button is pressed, the form is submitted and the person is updated
  const onSubmit = React.useCallback(
      async (values: Values): Promise<void> => {
        setIsPending(true);
        setSuccessMessage(null);
        try{
          await updatePersonRequest(personId, values);
          setSuccessMessage(`Person ${values.first_name} ${values.family_name} updated successfully!`);
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
        <CardHeader title='Update person' />
        <Divider />
        <CardContent>
          <Stack spacing={3} sx={{ maxWidth: 'sm' }}>
          <Controller
                control={control}
                name="first_name"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.first_name)}>
                  <InputLabel>First name</InputLabel>
                  <OutlinedInput {...field} label="First name" type="text"/>
                  {errors.first_name ? <FormHelperText>{errors.first_name.message}</FormHelperText> : null}
                </FormControl>
                )}
            />
            <Controller
                control={control}
                name="family_name"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.family_name)}>
                  <InputLabel>Family name</InputLabel>
                  <OutlinedInput {...field} label="Family name" type="text"/>
                  {errors.family_name ? <FormHelperText>{errors.family_name.message}</FormHelperText> : null}
                </FormControl>
                )}
            />
            <Controller
                control={control}
                name="abbreviation"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.abbreviation)}>
                  <InputLabel>Abbreviation</InputLabel>
                  <OutlinedInput {...field} label="Abbreviation" type="text"/>
                  {errors.abbreviation ? <FormHelperText>{errors.abbreviation.message}</FormHelperText> : null}
                </FormControl>
                )}
            />
            <Controller
                control={control}
                name="email"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.email)}>
                  <InputLabel>Email</InputLabel>
                  <OutlinedInput {...field} label="Email" type="text" />
                  {errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
                </FormControl>
                )}
            />
            <Controller
                control={control}
                name="additional_info"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.additional_info)}>
                  <InputLabel>Additional information</InputLabel>
                  <OutlinedInput {...field} label="Additional information" type="text" multiline={true} minRows={4}/>
                  {errors.additional_info ? <FormHelperText>{errors.additional_info.message}</FormHelperText> : null}
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
