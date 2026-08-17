import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import { UpdateExternalDatasetForm } from '@/components/dashboard/externaldatasets/update-externaldataset-form';

export const metadata = { title: `Update | External Datasets | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">External Datasets</Typography>
      </div>
      <UpdateExternalDatasetForm />
    </Stack>
  );
}
