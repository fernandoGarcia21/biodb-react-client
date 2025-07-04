import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import { CreateExternalDatasetForm } from '@/components/dashboard/externaldatasets/create-externaldataset-form';

export const metadata = { title: `Create | External Datasets | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">External datasets</Typography>
      </div>
      <CreateExternalDatasetForm />
    </Stack>
  );
}
