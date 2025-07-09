'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'next/navigation'
import {useEffect, useState, useRef} from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { config } from '@/config';
import Typography from '@mui/material/Typography';

import {BACKEND_ENDPOINT_URL_IMAGES, DATA_TYPE_TEXT} from '@/constants';

import { getPropertyRequest } from '@/api/properties';

const schema = zod.object({
  name: zod.string(),
  description: zod.string(),
  data_type_id: zod.number(),
  data_type_name: zod.string(),
  trait_id: zod.number(),
  trait_name: zod.string(),
  is_column_required: zod.boolean(),
  template_column_name: zod.string(),
  pre_defined_values: zod.string(),
  protocol: zod.string()
});

type Values = zod.infer<typeof schema>;


export function DisplayPropertyForm(): React.JSX.Element {
  const router = useRouter();

  const {
    control,
    reset,
    watch,
    handleSubmit,
    setError,
    clearErrors,
    setValue,
    formState,
    formState: { errors, isSubmitSuccessful },
  } = useForm<Values>({ resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      data_type_id: 0,
      data_type_name: '',
      trait_id: 0,
      trait_name: '',
      pre_defined_values: '',
      template_column_name: '',
      is_column_required: false,
      protocol: '',
    },
   });

  const params = useParams<{ id: int }>();
  const [propertyId, setPropertyId] = useState(params.id);
  const isMounted = useRef(false);
  
  useEffect(() => {
      const fetchProperty = async () => {
        try {
          if (!isMounted.current) {
            isMounted.current = true;
            //fetch property info
            const responseProperty = await getPropertyRequest(propertyId);
            if (responseProperty.data && responseProperty.data.length > 0) {

              reset({ name: responseProperty.data[0].name, 
                      description: responseProperty.data[0].description,
                      data_type_id: responseProperty.data[0].data_type_id,
                      data_type_name: responseProperty.data[0].data_type_name,
                      trait_id: responseProperty.data[0].trait_id,
                      trait_name: responseProperty.data[0].trait_name,
                      template_column_name: responseProperty.data[0].template_column_name == null ? '' : responseProperty.data[0].template_column_name,
                      pre_defined_values: responseProperty.data[0].pre_defined_values == null ? '' : responseProperty.data[0].pre_defined_values,
                      protocol: responseProperty.data[0].protocol == null ? '' : preprocessHtml(responseProperty.data[0].protocol),});

              document.title = `Display Property: ${responseProperty.data[0].name} | Dashboard | ${config.site.name}`;

            }

          }
        } catch (error) {
          console.error('Error fetching property info:', error);
        }
      };
  
      fetchProperty();
  
    }, []);


      // Function to preprocess HTML and update image paths
      const preprocessHtml = (html: string): string => {
        const backendImageBaseUrl = BACKEND_ENDPOINT_URL_IMAGES; // Replace with your backend URL
      
        // Use a DOM parser to manipulate the HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
      
        // Update all <img> tags
        const images = doc.querySelectorAll('img');
        images.forEach((img) => {
          const src = img.getAttribute('src');
          if (src && !src.startsWith('http')) {
            // Update the src to point to the backend API
            img.setAttribute('src', `${backendImageBaseUrl}${src}`);
          }
        });
      
        // Serialize the updated HTML back to a string
        return doc.body.innerHTML;
      };

  return (
      <Card>
        <Divider />
        <CardContent>
          <Stack spacing={1} sx={{ maxWidth: 'sm' }}>

            <Typography variant="subtitle1" sx={{ mt: 1 }}>Name</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', bgcolor: 'grey.100', p: 1 }}>{watch('name')}</Typography>

            <Typography variant="subtitle1" sx={{ mt: 1 }}>Description</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', bgcolor: 'grey.100', p: 1 }}>{watch('description')}</Typography>

            <Typography variant="subtitle1" sx={{ mt: 1 }}>Trait</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', bgcolor: 'grey.100', p: 1 }}>{watch('trait_name')}</Typography>

            <Typography variant="subtitle1" sx={{ mt: 1 }}>Data type</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', bgcolor: 'grey.100', p: 1 }}>{watch('data_type_name')}</Typography>

            {/*
              // Pre defined values are only available if the data type is text */}
              {watch('data_type_id') === DATA_TYPE_TEXT && (
                <>
                  <Typography variant="subtitle1" sx={{ mt: 1 }}>Pre-defined values</Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line', bgcolor: 'grey.100', p: 1 }}>
                    {watch('pre_defined_values')}
                  </Typography>
                </>
              )}

          </Stack>
          <Stack spacing={0} >
            <Typography variant="subtitle1" sx={{ mt: 1 }}>Protocol</Typography>
            <div dangerouslySetInnerHTML={{ __html: watch('protocol') }} />
          </Stack>
        </CardContent>
        <Divider />
      </Card>
  );
}
