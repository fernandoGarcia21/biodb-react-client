"use client";
import * as React from 'react';
import {useEffect} from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { config } from '@/config';
import { BatchDeleteOrganismsForm } from '@/components/dashboard/upload/batch-delete-organisms-form';

export default function Page(): React.JSX.Element {

  //Add title to the page
  useEffect(() => {
    document.title = `Delete organisms | Dashboard | ${config.site.name}`;
  }, []);


  return (
      <Stack spacing={3}>
        <div>
          <Typography variant="h4">Delete organisms</Typography>
        </div>
        <BatchDeleteOrganismsForm />
      </Stack>
  );
}