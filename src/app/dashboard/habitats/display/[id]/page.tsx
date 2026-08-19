import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import { DisplayHabitatForm } from '@/components/dashboard/habitats/display-habitat-form';

export const metadata = { title: `Display | Habitats | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Display Habitat</Typography>
      </div>
      <DisplayHabitatForm />
    </Stack>
  );
}
