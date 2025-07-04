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

import { getProjectRequest, updateProjectRequest } from '@/api/projects';
import { getPersonsRequest } from '@/api/persons';

const schema = zod.object({
  name: zod.string().min(1, { message: 'Name is required' }),
  description: zod.string().min(1, { message: 'Description is required' }),
  owner_person_id: zod.number().min(1, { message: 'The person responsible for the project is required.' }),
});

type Values = zod.infer<typeof schema>;


export function UpdateProjectForm(): React.JSX.Element {
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
      name: '',
      description: '',
      owner_person_id: 0,
    },
   });


  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [successMessage, setSuccessMessage] = React.useState(null);
  const [listPersons, setListPersons] = useState([]);
  const params = useParams<{ id: int }>();
  const [projectId, setProjectId] = useState(params.id);

  const isMounted = useRef(false);
  
  useEffect(() => {
      const fetchProject = async () => {
        try {
          if (!isMounted.current) {
            isMounted.current = true;
            //fetch project info
            const responseProject = await getProjectRequest(projectId);
            if (responseProject.data && responseProject.data.length > 0) {
              reset({ name: responseProject.data[0].name, 
                      description: responseProject.data[0].description,
                      owner_person_id: responseProject.data[0].owner_person_id, });
              document.title = `Update Projet: ${responseProject.data[0].name} | Dashboard | ${config.site.name}`;
            }

            //Fetch persons info
            const responsePersons = await getPersonsRequest();
            if (responsePersons.data && responsePersons.data.length > 0) {
              setListPersons(responsePersons.data);
            }
          }
        } catch (error) {
          console.error('Error fetching project info:', error);
        }
      };
  
      fetchProject();
  
    }, []);

//When the Update button is pressed, the form is submitted and the project is updated
  const onSubmit = React.useCallback(
      async (values: Values): Promise<void> => {
        setIsPending(true);
        setSuccessMessage(null);
        try{
          await updateProjectRequest(projectId, values);
          setSuccessMessage(`Project ${values.name} updated successfully!`);
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

    return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader title='Update project' />
        <Divider />
        <CardContent>
          <Stack spacing={3} sx={{ maxWidth: 'sm' }}>
          <Controller
                control={control}
                name="owner_person_id"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.owner_person_id)}>
                  <InputLabel>Responsible person</InputLabel>
                    <Select {...field} defaultValue="0" label="Responsible person" variant="outlined">
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
                  <OutlinedInput {...field} label="Description" type="text" multiline="true" minRows={4}/>
                  {errors.description ? <FormHelperText>{errors.description.message}</FormHelperText> : null}
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
