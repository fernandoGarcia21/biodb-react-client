"use client";
import * as React from 'react';
import {useEffect, useState, useRef} from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Metadata } from 'next';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Leaf as PropertyIcon } from '@phosphor-icons/react/dist/ssr/Leaf';
import { config } from '@/config';
import { UpdateLocationForm } from '@/components/dashboard/locations/update-location-form';
import { TraitsTable } from '@/components/dashboard/traits/traits-location-table-collapsible';
import type { Trait } from '@/components/dashboard/traits/traits-location-table-collapsible';
import { paths } from '@/paths';


export default function Page(): React.JSX.Element {
  const router = useRouter();
  const params = useParams<{ id: int }>();
  const pLocationtId = params.id; //Obtain the trait id from the URL
  const isMounted = useRef(false);

    //Add title to the page
      useEffect(() => {
        document.title = `Update | Location | Dashboard | ${config.site.name}`;
      }, []);
    

    return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Location information</Typography>
      </div>
      <UpdateLocationForm />
    </Stack>
    
  );
}
