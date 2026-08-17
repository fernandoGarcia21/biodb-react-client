import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import { BatchReviewForm } from '@/components/dashboard/upload/batch-review-form';

export const metadata = { title: `Review | Batch | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Review Batch Process</Typography>
      </div>
      <BatchReviewForm />
    </Stack> 
  );
}
