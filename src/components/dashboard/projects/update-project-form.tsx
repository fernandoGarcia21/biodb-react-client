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
import { useUser } from '@/hooks/use-user';
import { useBrandTitle } from '@/hooks/use-brand-title';

import { getProjectRequest, updateProjectRequest } from '@/api/projects';
import { getPersonsRequest, getPersonRequest } from '@/api/persons';
import { USER_LEVEL_ADMIN } from '@/constants';

const schema = zod.object({
  internal_id: zod.string().min(2, { message: 'Internal ID is required and must be at least 2 characters long' }).max(20, { message: 'Internal ID is too long (max 20 characters)' }),
  name: zod.string().min(1, { message: 'Name is required' }),
  description: zod.string().min(1, { message: 'Description is required' }),
  owner_person_id: zod.number().min(1, { message: 'The person responsible for the project is required.' }),
  must_read_title: zod.string().max(255, { message: 'Must read title is too long (max 255 characters)' }).optional(),
  must_read_content: zod.string().max(2500, { message: 'Must read content is too long (max 2500 characters)' }).optional(),
});

type Values = zod.infer<typeof schema>;


export function UpdateProjectForm(): React.JSX.Element {
  const router = useRouter();
  const { user } = useUser();
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
      internal_id: '',
      name: '',
      description: '',
      owner_person_id: 0,
      must_read_title: '',
      must_read_content: '',
    },
   });


  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [listPersons, setListPersons] = useState<{ id: number; first_name: string; family_name: string; email: string }[]>([]);
  const params = useParams<{ id: string }>();
  const [projectId, setProjectId] = useState(params.id);
  const brandTitle = useBrandTitle();
  const isMounted = useRef(false);
  
  useEffect(() => {
      const fetchProject = async () => {
        try {
          if (!isMounted.current) {
            isMounted.current = true;
            //fetch project info
            const responseProject = await getProjectRequest(projectId);
            if (responseProject.data && responseProject.data.length > 0) {
              reset({ internal_id: responseProject.data[0].internal_id || '',
                      name: responseProject.data[0].name, 
                      description: responseProject.data[0].description,
                      owner_person_id: responseProject.data[0].owner_person_id, 
                      must_read_title: responseProject.data[0].must_read_title || '',
                      must_read_content: responseProject.data[0].must_read_content || '',
                    });
              document.title = `Update Projet: ${responseProject.data[0].name} | ${brandTitle}`;
            }

            //Fetch persons info
            if(user?.levelId === USER_LEVEL_ADMIN) { //admin user  
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
                name="internal_id"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.internal_id)}>
                  <InputLabel>Internal ID</InputLabel>
                  <OutlinedInput {...field} label="Internal ID" type="text"/>
                  {errors.internal_id ? <FormHelperText>{errors.internal_id.message}</FormHelperText> : null}
                   <FormHelperText>
                      The <strong>Internal ID</strong> is an alphanumeric identifier assigned by
                      researchers to distinguish a specific project within the research community
                      (e.g. <strong>NERCSWtran</strong>). This identifier must be used as a prefix
                      for the standardized organism identifier (<strong>ORGANISM ID</strong> column
                      in the CSV template), following the format{' '}
                      <strong>ProjectInternalIDSnailID_otherRelevantInfoIfNeeded</strong>.
                    </FormHelperText>
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
          <Button type="submit" variant="contained" disabled={isPending}>Update</Button>
        </CardActions>
      </Card>
    </form>
  );
}
