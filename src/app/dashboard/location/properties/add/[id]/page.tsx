import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import { AddLocationPropertyForm } from '@/components/dashboard/locations/add-location-property-form';

export const metadata = { title: `Add Property | Properties | Location | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Location add property</Typography>
      </div>
      <AddLocationPropertyForm />
    </Stack>
  );
}
