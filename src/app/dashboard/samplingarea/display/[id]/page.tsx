import * as React from 'react';
import Stack from '@mui/material/Stack';
import type { Metadata } from 'next';
import Typography from '@mui/material/Typography';
import { config } from '@/config';
import { DisplaySamplingAreaForm } from '@/components/dashboard/sampling_areas/display-samplingarea-form';

export const metadata = { title: `Display | Sampling Area | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
    
    return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Sampling area</Typography>
      </div>
      <DisplaySamplingAreaForm />  
    </Stack>
    
  );
}