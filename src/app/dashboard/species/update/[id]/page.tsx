import * as React from 'react';
import Stack from '@mui/material/Stack';
import type { Metadata } from 'next';
import Typography from '@mui/material/Typography';
import { config } from '@/config';
import { UpdateSpeciesForm } from '@/components/dashboard/species/update-species-form';

export const metadata = { title: `Update | Species | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
    
    return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Species information</Typography>
      </div>
      <UpdateSpeciesForm />
    </Stack>
    
  );
}