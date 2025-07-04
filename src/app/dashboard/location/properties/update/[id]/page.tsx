import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import { UpdateLocationPropertyForm } from '@/components/dashboard/locations/update-location-property-form';

export const metadata = { title: `Add Property | Update | Location | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Location update property</Typography>
      </div>
      <UpdateLocationPropertyForm />
    </Stack>
  );
}
