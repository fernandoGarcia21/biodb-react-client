import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import { UpdateTypeDatasetForm } from '@/components/dashboard/typedatasets/update-typedataset-form';

export const metadata = { title: `Update | Type Datasets | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Type Datasets</Typography>
      </div>
      <UpdateTypeDatasetForm />
    </Stack>
  );
}
