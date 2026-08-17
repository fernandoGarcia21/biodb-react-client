'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
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
import { AxiosError } from 'axios';
import { useUser } from '@/hooks/use-user';

import { createProjectRequest } from '@/api/projects';
import { getPersonsRequest, getPersonRequest } from '@/api/persons';
import { USER_LEVEL_ADMIN } from '@/constants';

const schema = zod.object({
  name: zod.string().min(1, { message: 'Name is required' }),
  description: zod.string().min(1, { message: 'Description is required' }),
  owner_person_id: zod.number().min(1, { message: 'The person who is responsible for the project is required.' }),
  must_read_title: zod.string().max(255, { message: 'Must read title is too long (max 255 characters)' }).optional(),
  must_read_content: zod.string().max(2500, { message: 'Must read content is too long (max 2500 characters)' }).optional(),
});

type Values = zod.infer<typeof schema>;

export function CreateProjectForm(): React.JSX.Element {
  const router = useRouter();
  const { user } = useUser();
  const [listPersons, setListPersons] = useState<{ id: number; first_name: string; family_name: string; email: string }[]>([]);
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

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
        name: '',
        description: '',
        owner_person_id: 0,
        must_read_title: '',
        must_read_content: '',
      },
     });

  const isMounted = useRef(false);
         
      useEffect(() => {
          const fetchPersons = async () => {
            try {
              if (!isMounted.current) {
                isMounted.current = true;
                if(user?.levelId === USER_LEVEL_ADMIN) { //admin user  
                  //Fetch persons info
                    const responsePersons = await getPersonsRequest();
                    if (responsePersons.data && responsePersons.data.length > 0) {
                      setListPersons(responsePersons.data);
                  }
                }else{
                      //Fetch the person info for the group leader
                      console.log('Fetching person info for group leader with personId:', user?.personId);
                      const responsePerson = await getPersonRequest(user.personId);
                      if (responsePerson.data) {
                        setListPersons(responsePerson.data);
                        setValue('owner_person_id', responsePerson.data[0].id);
                      } else {
                        console.error('No person data found for the group leader');
                      }
                  }
                
              }
            } catch (error) {
              console.error('Error fetching persons list:', error);
            }
          };
      
          fetchPersons();
      
        }, []);

  const onSubmit = React.useCallback(
      async (values: Values): Promise<void> => {
        setIsPending(true);
        setSuccessMessage(null);
        try{
          await createProjectRequest(values);
          reset({ name: "", description: "", owner_person_id: 0 });
          setSuccessMessage(`Project ${values.name} created successfully!`);
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
        <CardHeader title="New project" />
        <Divider />
        <CardContent>
          <Stack spacing={3} sx={{ maxWidth: 'sm' }}>
          <Controller
                control={control}
                name="owner_person_id"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.owner_person_id)}>
                  <InputLabel>Responsible person</InputLabel>
                    <Select {...field} value={field.value ?? 0}
                    onChange={e => field.onChange(Number(e.target.value))} label="Responsible person" variant="outlined">
                    <MenuItem value={0}>Select one person</MenuItem>
                      {listPersons.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {`${option.first_name} ${option.family_name}: ${option.email}`}
                        </MenuItem>
                      ))}
                    </Select>
                  {errors.owner_person_id ? <FormHelperText>{errors.owner_person_id.message}</FormHelperText> : null}
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
                name="must_read_title"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.must_read_title)}>
                  <InputLabel>Must read title</InputLabel>
                  <OutlinedInput {...field} label="Must read title" type="text"/>
                  {errors.must_read_title ? <FormHelperText>{errors.must_read_title.message}</FormHelperText> : null}
                  {!errors.must_read_title ? <FormHelperText>If the title is left blank, the must read content will not be shown</FormHelperText> : null}
                </FormControl>
                )}
            />
            <Controller
                control={control}
                name="must_read_content"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.must_read_content)}>
                  <InputLabel>Must read content</InputLabel>
                  <OutlinedInput {...field} label="Must read content" type="text" multiline={true} minRows={4}/>
                  {errors.must_read_content ? <FormHelperText>{errors.must_read_content.message}</FormHelperText> : null}
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
