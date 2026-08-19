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
import { getHabitatRequest } from '@/api/habitats';
import { useBrandTitle } from '@/hooks/use-brand-title';

const schema = zod.object({
  name: zod.string().min(1, { message: 'Name is required' }),
  description: zod.string().min(1, { message: 'Description is required' }),
});

type Values = zod.infer<typeof schema>;

export function DisplayHabitatForm(): React.JSX.Element {
  const {
    reset,
    watch,
    formState: { errors }
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const params = useParams<{ id: string }>();
  const habitatId = params.id;
  const isMounted = useRef(false);
  const brandTitle = useBrandTitle();

  useEffect(() => {
    const fetchHabitat = async () => {
      try {
        if (!isMounted.current) {
          isMounted.current = true;
          const response = await getHabitatRequest(habitatId);
          if (response.data && response.data.length > 0) {
            reset({
              name: response.data[0].name,
              description: response.data[0].description,
            });
            document.title = `Display Habitat: ${response.data[0].name} | ${brandTitle}`;
          }
        }
      } catch (error) {
        console.error('Error fetching habitat info:', error);
      }
    };

    fetchHabitat();
  }, [habitatId, reset]);

  return (
    <Card>
      <CardHeader title="Habitat Details" />
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