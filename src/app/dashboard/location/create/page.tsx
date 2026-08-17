import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import { CreateLocationForm } from '@/components/dashboard/locations/create-location-form';

export const metadata = { title: `Create | Location | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Locations</Typography>
      </div>
      <CreateLocationForm />
    </Stack>
  );
}
