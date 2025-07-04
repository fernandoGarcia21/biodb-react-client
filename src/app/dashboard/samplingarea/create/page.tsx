import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import { CreateSamplingAreaForm } from '@/components/dashboard/sampling_areas/create-samplingarea-form';

export const metadata = { title: `Create | Sampling Area | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Sampling Area</Typography>
      </div>
      <CreateSamplingAreaForm />
    </Stack>
  );
}
