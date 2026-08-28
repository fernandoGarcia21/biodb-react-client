'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'next/navigation'
import {useEffect, useState, useRef} from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import Typography from '@mui/material/Typography';
import { useBrandTitle } from '@/hooks/use-brand-title';
import FormHelperText from '@mui/material/FormHelperText';

import { getProjectRequest,  } from '@/api/projects';

const schema = zod.object({
  internal_id: zod.string().min(2, { message: 'Internal ID is required and must be at least 2 characters long' }).max(20, { message: 'Internal ID is too long (max 20 characters)' }),
  name: zod.string().min(1, { message: 'Name is required' }),
  description: zod.string().min(1, { message: 'Description is required' }),
  owner_person_id: zod.number().min(1, { message: 'The person responsible for the project is required.' }),
  owner_person_name: zod.string().optional(),
  owner_person_email: zod.string().optional(),
  must_read_title: zod.string().optional(),
  must_read_content: zod.string().optional(),
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
      internal_id: '',
      name: '',
      description: '',
      owner_person_id: 0,
      owner_person_name: '',
      owner_person_email: '',
      must_read_title: '',
      must_read_content: '',
    },
   });


  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [listPersons, setListPersons] = useState([]);
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
              reset({ internal_id: responseProject.data[0].internal_id,
                      name: responseProject.data[0].name, 
                      description: responseProject.data[0].description,
                      owner_person_id: responseProject.data[0].owner_person_id,
                    owner_person_name: responseProject.data[0].owner_person_name,
                  owner_person_email: responseProject.data[0].owner_person_email, 
                      must_read_title: responseProject.data[0].must_read_title || '',
                      must_read_content: responseProject.data[0].must_read_content || '',
                    });
              document.title = `Display Projet: ${responseProject.data[0].name} | ${brandTitle}`;
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
              Id
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', bgcolor: 'grey.100', p: 1 }}>
              {projectId}
            </Typography>
            <FormHelperText>
                The <strong>Id</strong> is the consecutive number assigned automatically 
                by the system when a project is created. Use this number to associate 
                organisms with projects during organism batch processing.
                In the CSV template column <strong>PROJECTS</strong>, one or more numeric
                project identifiers can be associated with an individual. If more than one
                project is specified, the identifiers must be separated by a semicolon (;).
              </FormHelperText>

            <Typography variant="subtitle1" sx={{ mt: 1 }}>
              Internal ID
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', bgcolor: 'grey.100', p: 1 }}>
              {watch('internal_id')}
            </Typography>
            <FormHelperText>
                The <strong>Internal ID</strong> is an alphanumeric identifier assigned by
                researchers to distinguish a specific project within the research community
                (e.g. <strong>NERCSWtran</strong>). This identifier must be used as a prefix
                for the standardized organism identifier (<strong>ORGANISM ID</strong> column
                in the CSV template), following the format{' '}
                <strong>ProjectInternalIDSnailID_otherRelevantInfoIfNeeded</strong>.
              </FormHelperText>

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

          <Typography variant="subtitle1" sx={{ mt: 1 }}>
              Must read title
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', bgcolor: 'grey.100', p: 1 }}>
              {watch('must_read_title')}
            </Typography>

          <Typography variant="subtitle1" sx={{ mt: 1 }}>
              Must read content
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', bgcolor: 'grey.100', p: 1 }}>
              {watch('must_read_content')}
            </Typography>
 
        </CardContent>
        <Divider />

      </Card>
  );
}
