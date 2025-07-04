import * as React from 'react';
import Stack from '@mui/material/Stack';
import type { Metadata } from 'next';
import Typography from '@mui/material/Typography';
import { config } from '@/config';
import { UpdateSamplingAreaForm } from '@/components/dashboard/sampling_areas/update-samplingarea-form';

export const metadata = { title: `Update | Sampling Area | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
    
    return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Sampling area information</Typography>
      </div>
      <UpdateSamplingAreaForm />  
    </Stack>
    
  );
}