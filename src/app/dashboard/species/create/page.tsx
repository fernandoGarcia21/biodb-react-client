import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import { CreateSpeciesForm } from '@/components/dashboard/species/create-species-form';

export const metadata = { title: `Create | Species | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Species</Typography>
      </div>
      <CreateSpeciesForm />
    </Stack>
  );
}
