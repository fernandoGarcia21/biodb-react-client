'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { config } from '@/config';
import { getExternalDatasetRequest } from '@/api/externalDatasets';
import { useBrandTitle } from '@/hooks/use-brand-title';

const schema = zod.object({
  name: zod.string().min(1, { message: 'Name is required' }),
  description: zod.string().min(1, { message: 'Description is required' }),
  url: zod.string().url({ message: 'Invalid URL format' }),
  type_dataset_id: zod.number().min(1, { message: 'The type of dataset is required.' }),
  type_dataset_name: zod.string().optional(),
});

type Values = zod.infer<typeof schema>;

export function DisplayExternalDatasetForm(): React.JSX.Element {
  const {
    reset,
    watch,
    formState: { errors }
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      url: '',
      type_dataset_id: 0,
      type_dataset_name: '',
    },
  });

  const params = useParams<{ id: string }>();
  const externalDatasetId = params.id;
  const isMounted = useRef(false);
  const brandTitle = useBrandTitle();

  useEffect(() => {
    const fetchExternalDataset = async () => {
      try {
        if (!isMounted.current) {
          isMounted.current = true;
          const response = await getExternalDatasetRequest(externalDatasetId);
          if (response.data && response.data.length > 0) {
            reset({
              name: response.data[0].name,
              description: response.data[0].description,
              url: response.data[0].url,
              type_dataset_id: response.data[0].type_dataset_id,
              type_dataset_name: response.data[0].type_dataset_name,
            });
            document.title = `Display External Dataset: ${response.data[0].name} | ${brandTitle}`;
          }
        }
      } catch (error) {
        console.error('Error fetching external dataset info:', error);
      }
    };

    fetchExternalDataset();
  }, [externalDatasetId, reset]);

  return (
    <Card>
      <CardHeader title="External Dataset Details" />
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
            Type dataset
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line', bgcolor: 'grey.100', p: 1 }}>
            {watch('type_dataset_name')}
          </Typography>

          <Typography variant="subtitle1" sx={{ mt: 1 }}>
            URL
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line', bgcolor: 'grey.100', p: 1 }}>
            <a
              href={watch('url')}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'inherit', textDecoration: 'underline' }}
            >
              {watch('url')}
            </a>
          </Typography>

          <Typography variant="subtitle1" sx={{ mt: 1 }}>
            Description
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line', p: 1, bgcolor: 'grey.100' }}>
            {watch('description')}
          </Typography>
        </Stack>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
        </Stack>
      </CardContent>
      <Divider />
    </Card>
  );
}