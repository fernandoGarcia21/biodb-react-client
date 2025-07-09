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
import Typography from '@mui/material/Typography';

import { getProjectRequest,  } from '@/api/projects';

const schema = zod.object({
  name: zod.string().min(1, { message: 'Name is required' }),
  description: zod.string().min(1, { message: 'Description is required' }),
  owner_person_id: zod.number().min(1, { message: 'The person responsible for the project is required.' }),
});

type Values = zod.infer<typeof schema>;


export function DisplayProjectForm(): React.JSX.Element {
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
      owner_person_name: '',
      owner_person_email: '',
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
                      owner_person_id: responseProject.data[0].owner_person_id,
                    owner_person_name: responseProject.data[0].owner_person_name,
                  owner_person_email: responseProject.data[0].owner_person_email, });
              document.title = `Display Projet: ${responseProject.data[0].name} | Dashboard | ${config.site.name}`;
            }
          }
        } catch (error) {
          console.error('Error fetching project info:', error);
        }
      };
  
      fetchProject();
  
    }, []);


    return (
      <Card>
        <Divider />
        <CardContent>
          <Stack spacing={1} sx={{ maxWidth: 'sm' }}>

            <Typography variant="subtitle1" sx={{ mt: 1 }}>
              Name
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', bgcolor: 'grey.100', p: 1 }}>
              {watch('name')}
            </Typography>

            <Typography variant="subtitle1" sx={{ mt: 1 }}>
              Responsible person
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', bgcolor: 'grey.100', p: 1 }}>
              {watch('owner_person_name')}
            </Typography>

          <Typography variant="subtitle1" sx={{ mt: 1 }}>
              Description
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', bgcolor: 'grey.100', p: 1 }}>
              {watch('description')}
            </Typography>
          </Stack>
 
        </CardContent>
        <Divider />

      </Card>
  );
}
