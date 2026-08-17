"use client";
import * as React from 'react';
import {useEffect, useState, useRef} from 'react';
import { useParams, useRouter } from 'next/navigation';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { config } from '@/config';
import { DisplayLocationForm } from '@/components/dashboard/locations/display-location-form';
import { useBrandTitle } from '@/hooks/use-brand-title';

export default function Page(): React.JSX.Element {
  const brandTitle = useBrandTitle();
    //Add title to the page
      useEffect(() => {
        document.title = `Update | Location | ${brandTitle}`;
      }, [brandTitle]);
    

    return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Location information</Typography>
      </div>
      <DisplayLocationForm />
    </Stack>
    
  );
}
