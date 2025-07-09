'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'next/navigation'
import {useEffect, useState, useRef} from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import { useForm } from 'react-hook-form';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { z as zod } from 'zod';
import { config } from '@/config';
import {Typography} from '@mui/material';

import { getLocationRequest } from '@/api/locations';

const schema = zod.object({
  name: zod.string().min(1, { message: 'Name is required' }).max(255, { message: 'Name is too long' }),
  country_id: zod.string().min(2, { message: 'Country is required' }).max(2),
  extra_info: zod.string().max(500).or(zod.string().max(0)),
  country_name: zod.string().max(500).or(zod.string().max(0)),
});

type Values = zod.infer<typeof schema>;


export function DisplayLocationForm(): React.JSX.Element {
  const router = useRouter();

  const {
    control,
    reset,
    watch,
    handleSubmit,
    setError,
    formState,
    formState: { errors, isSubmitSuccessful },
  } = useForm<Values>({ resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      country_id: '0',
      country_name: '',
      extra_info: '',
    },
   });

  const params = useParams<{ id: int }>();
  const [locationId, setLocationId] = useState(params.id);
  const [locationName, setLocationName] = useState<string>('');

  const isMounted = useRef(false);
  
  useEffect(() => {
      const fetchLocation = async () => {
        try {
          if (!isMounted.current) {
            isMounted.current = true;
            //fetch location info
            const responseLocation = await getLocationRequest(locationId);
            if (responseLocation.data && responseLocation.data.length > 0) {
              reset({ name: responseLocation.data[0].name, 
                      country_id: responseLocation.data[0].country_id,
                      country_name: responseLocation.data[0].country_name,
                      extra_info: responseLocation.data[0].extra_info });

              setLocationName(responseLocation.data[0].name);
              document.title = `Display Location: ${responseLocation.data[0].name} | Dashboard | ${config.site.name}`;
            }

          }
        } catch (error) {
          console.error('Error fetching location info:', error);
        }
      };
  
      fetchLocation();
  
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
              Country
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', bgcolor: 'grey.100', p: 1 }}>
              {watch('country_name')}
            </Typography>

            <Typography variant="subtitle1" sx={{ mt: 1 }}>
              Additional information
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', bgcolor: 'grey.100', p: 1 }}>
              {watch('extra_info')}
            </Typography>

          </Stack>

        </CardContent>
        <Divider />
      </Card>
  );
}
