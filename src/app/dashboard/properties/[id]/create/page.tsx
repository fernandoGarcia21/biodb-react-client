import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import { CreatePropertyForm } from '@/components/dashboard/properties/create-property-form';

export const metadata = { title: `Create | Properties | Traits | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Properties</Typography>
      </div>
      <CreatePropertyForm />
    </Stack>
  );
}
