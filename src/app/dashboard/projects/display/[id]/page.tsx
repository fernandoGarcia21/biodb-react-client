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

//Components for the dialog to add external dataset
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';


import { Link as ExternalDatasetIcon } from '@phosphor-icons/react/dist/ssr/Link';
import { config } from '@/config';
import { DisplayProjectForm } from '@/components/dashboard/projects/display-project-form';

import { ExternalDatasetsTable } from '@/components/dashboard/externaldatasets/project-externaldatasets-table';
import type { ExternalDataset } from '@/components/dashboard/externaldatasets/project-externaldatasets-table';

import { getProjectExternalDatasetsRequest, getAvailableProjectExternalDatasetsRequest, createProjectExternalDatasetRequest, deleteProjectExternalDatasetRequest } from  '@/api/projects';
import { useBrandTitle } from '@/hooks/use-brand-title';

  const brandTitle = useBrandTitle();
export default function Page(): React.JSX.Element {

  const router = useRouter();
  const [projectExternalDatasets, setProjectExternalDatasets] = useState([]);
  const params = useParams<{ id: string }>();
  const pProjectId = params.id; //Obtain the project id from the URL
  const isMounted = useRef(false);

  const [ errorsExternalDataset, setErrorsExternalDataset ] = React.useState({  external_dataset_id: false});
  const [ errorMessageExternalDataset, setErrorMessageExternalDataset ] = React.useState({  external_dataset_id: '' });
  const [externalDatasetId, setExternalDatasetId] = React.useState(0);
  const [listAvailableExternalDatasets, setListAvailableExternalDatasets] = React.useState<ExternalDataset[]>([]);


  const fetchProjectExternalDatasets = async () => {
        try {
          if (!isMounted.current) {
            isMounted.current = true;
            console.log('Fetching project external datasets...');
            console.log('Project ID:', pProjectId);
            const response = await getProjectExternalDatasetsRequest(pProjectId); 
            setProjectExternalDatasets(response.data);
            console.log('External datasets of the project:', response.data);

            //Get available external datasets
            const responseAvailableExternalDatasets = await getAvailableProjectExternalDatasetsRequest(pProjectId);
            setListAvailableExternalDatasets(responseAvailableExternalDatasets.data);
          }
        } catch (error) {
          console.error('Error fetching project external datasets:', error);
        }
      };
    
      useEffect(() => {
        void fetchProjectExternalDatasets();
    
      }, []);
  
      //Add title to the page
        useEffect(() => {
          document.title = `Update | Project | ${brandTitle}`;
        }, [brandTitle]);
      
  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Project</Typography>
      </div>
      <DisplayProjectForm />

      <Stack direction="row" spacing={3}>
          <div>
            <Typography variant="h6">Associated external datasets</Typography>
          </div>
        </Stack>
      <ExternalDatasetsTable
                count={projectExternalDatasets.length}
                page={0}
                rows={projectExternalDatasets}
                handleClickOpen={() => {}}
              />
    </Stack>
  );
}
