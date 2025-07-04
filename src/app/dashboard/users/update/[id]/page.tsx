import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import { UpdateUserForm } from '@/components/dashboard/users/update-user-form';

export const metadata = { title: `Update | users | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Users</Typography>
      </div>
      <UpdateUserForm />
    </Stack>
  );
}
