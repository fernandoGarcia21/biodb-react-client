import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import { DisplayTraitForm } from '@/components/dashboard/traits/display-trait-form';

export const metadata = { title: `Display | Traits | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Trait</Typography>
      </div>
      <DisplayTraitForm />
    </Stack>
  );
}
