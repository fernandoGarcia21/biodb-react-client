"use client";
import * as React from 'react';
import {useEffect} from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { config } from '@/config';
import { BatchCreateOrganismsForm } from '@/components/dashboard/upload/batch-create-organisms-form';

export default function Page(): React.JSX.Element {

  //Add title to the page
  useEffect(() => {
    document.title = `Create organisms | Dashboard | ${config.site.name}`;
  }, []);


  return (
      <Stack spacing={3}>
        <div>
          <Typography variant="h4">Create organisms</Typography>
        </div>
        <BatchCreateOrganismsForm />
      </Stack>
  );
}