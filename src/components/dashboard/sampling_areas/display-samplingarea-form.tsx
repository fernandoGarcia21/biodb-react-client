'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'next/navigation'
import {useEffect, useState, useRef} from 'react';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { API } from '@/constants';
import { contactZoneGuidance } from './sampling-area-guidelines';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { config } from '@/config';
import { Typography } from '@mui/material';
import { useBrandTitle } from '@/hooks/use-brand-title';
import { FormHelperText } from '@mui/material';

import { getSamplingAreaRequest } from '@/api/samplingAreas';

const schema = zod.object({
  name: zod.string().min(1, { message: 'Name is required' }).max(255, { message: 'Name is too long' }),
  description: zod.string().min(1, { message: 'Description of the coordinates is required' }).max(255, { message: 'Description is too long' }),
  latitude: zod.string().min(3).max(10).or(zod.string().max(0)),
  longitude: zod.string().min(3).max(10).or(zod.string().max(0)),
  country_id: zod.string().min(2, { message: 'Country is required' }).max(2),
  country_name: zod.string(),
  habitat_code: zod.string(),
  habitat_structure_name: zod.string(),
  habitat_structure_description: zod.string(),
  habitat_photo_file_name: zod.string(),
  is_contact_zone: zod.boolean().nullable(),
  location_id: zod.number().min(1, { message: 'Location is required' }),
  location_name: zod.string(),
});

type Values = zod.infer<typeof schema>;


export function DisplaySamplingAreaForm(): React.JSX.Element {
  const router = useRouter();

  const {
    control,
    reset,
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
      country_name: '',
      location_name: '',
      habitat_code: '',
      habitat_structure_name: '',
      habitat_structure_description: '',
      habitat_photo_file_name: '',
      is_contact_zone: null,
    },
   });


  const params = useParams<{ id: string }>();
  const [samplingAreaId, setSamplingAreaId] = useState(params.id);
  const brandTitle = useBrandTitle();

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
                      latitude: responseSamplingArea.data[0].latitude,
                      country_name: responseSamplingArea.data[0].country_name,
                      location_name: responseSamplingArea.data[0].location_name,
                      habitat_code: responseSamplingArea.data[0].habitat_code ?? '',
                      habitat_structure_name: responseSamplingArea.data[0].habitat_structure_name ?? '',
                      habitat_structure_description: responseSamplingArea.data[0].habitat_structure_description ?? '',
                      habitat_photo_file_name: responseSamplingArea.data[0].habitat_photo_file_name ?? '',
                      is_contact_zone: responseSamplingArea.data[0].is_contact_zone === true || responseSamplingArea.data[0].is_contact_zone === 'true'
                        ? true
                        : responseSamplingArea.data[0].is_contact_zone === false || responseSamplingArea.data[0].is_contact_zone === 'false' ? false : null,
              });

              document.title = `Display Sampling Area: ${responseSamplingArea.data[0].name} | ${brandTitle}`;
            }

          }
        } catch (error) {
          console.error('Error fetching sampling area info:', error);
        }
      };
  
      fetchSamplingArea();
  
    }, []);



  return (
      <Card>
        <Divider />
        <CardContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            <AlertTitle>Habitat classification guidelines</AlertTitle>
            Habitat codes describe environmental characteristics, while habitat structure describes their spatial arrangement.
            {' '}Contact-zone status refers independently to the potential contact between divergent ecotypes.
            {' '}Sampling area description provides additional information to clarify classifications.
            {' '}If information is insufficient, consult the responsible person as listed in the Projects page whenever possible.
          </Alert>
          <Stack spacing={1} sx={{ maxWidth: 'sm' }}>

            <Typography variant="subtitle1" sx={{ mt: 1 }}>
            Id
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line', bgcolor: 'grey.100', p: 1 }}>
            {samplingAreaId}
          </Typography>
          <FormHelperText>
              The <strong>Id</strong> is the consecutive number assigned automatically 
              by the system when a sampling area is created. Use this
            number to associate an organism with a sampling area during organism batch processing.
            In the CSV template column <strong>SAMPLING AREA</strong>, only one sampling area
            identifier can be associated with an individual and this is <strong>required </strong>
            at the time of organism creation.
            </FormHelperText>

            <Typography variant="subtitle1" sx={{ mt: 1 }}>Name</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', bgcolor: 'grey.100', p: 1 }}>{watch('name')}</Typography>

            <Typography variant="subtitle1" sx={{ mt: 1 }}>Description</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', bgcolor: 'grey.100', p: 1 }}>{watch('description')}</Typography>

            <Typography variant="subtitle1" sx={{ mt: 1 }}>Habitat code</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', bgcolor: 'grey.100', p: 1 }}>{watch('habitat_code') || 'Not available'}</Typography>

            <Typography variant="subtitle1" sx={{ mt: 1 }}>Habitat structure</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', bgcolor: 'grey.100', p: 1 }}>{watch('habitat_structure_name') || 'Not available'}</Typography>
            {watch('habitat_structure_description') ? <FormHelperText>{watch('habitat_structure_description')}</FormHelperText> : null}

            <Typography variant="subtitle1" sx={{ mt: 1 }}>Contact zone in the SA</Typography>
            <Typography variant="body1" sx={{ bgcolor: 'grey.100', p: 1 }}>{watch('is_contact_zone') === null ? 'Unknown' : watch('is_contact_zone') ? 'Yes' : 'No'}</Typography>
            <FormHelperText>{contactZoneGuidance}</FormHelperText>

            <Typography variant="subtitle1" sx={{ mt: 1 }}>Photograph</Typography>
            {watch('habitat_photo_file_name') ? (
              <Link href={`${API}/sampling_area_images/${encodeURIComponent(watch('habitat_photo_file_name'))}`} target="_blank" rel="noopener noreferrer">
                <Box
                  component="img"
                  src={`${API}/sampling_area_images/${encodeURIComponent(watch('habitat_photo_file_name'))}`}
                  alt={`Sampling area ${watch('name')}`}
                  sx={{ display: 'block', width: '100%', height: { xs: 300, sm: 420 }, objectFit: 'contain', borderRadius: 1 }}
                />
                View photograph in a new tab
              </Link>
            ) : <Typography variant="body1" sx={{ bgcolor: 'grey.100', p: 1 }}>Not available</Typography>}

            <Typography variant="subtitle1" sx={{ mt: 1 }}>Country</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', bgcolor: 'grey.100', p: 1 }}>{watch('country_name')}</Typography>
            
            <Typography variant="subtitle1" sx={{ mt: 1 }}>Location</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', bgcolor: 'grey.100', p: 1 }}>{watch('location_name')}</Typography>

            <Typography variant="subtitle1" sx={{ mt: 1 }}>Coordinates</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', bgcolor: 'grey.100', p: 1 }}>{watch('latitude')}, {watch('longitude')}</Typography>

          </Stack>
        </CardContent>
        <Divider />
      </Card>
  );
}
