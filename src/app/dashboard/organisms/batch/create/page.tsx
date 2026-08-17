"use client";
import * as React from 'react';
import {useEffect} from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { config } from '@/config';
import { BatchCreateOrganismsForm } from '@/components/dashboard/upload/batch-create-organisms-form';
import { useBrandTitle } from '@/hooks/use-brand-title';

export default function Page(): React.JSX.Element {
  const brandTitle = useBrandTitle();

  //Add title to the page
  useEffect(() => {
    document.title = `Create organisms | ${brandTitle}`;
  }, [brandTitle]);


  return (
      <Stack spacing={3}>
        <div>
          <Typography variant="h4">Create organisms</Typography>
        </div>
        <BatchCreateOrganismsForm />
      </Stack>
  );
}