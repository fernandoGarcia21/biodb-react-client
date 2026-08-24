"use client";
import * as React from 'react';
import {useEffect, useState, useRef} from 'react';
import { useParams, useRouter } from 'next/navigation';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { DisplayProjectForm } from '@/components/dashboard/projects/display-project-form';
import { ExternalDatasetsTable } from '@/components/dashboard/externaldatasets/project-externaldatasets-table';
import { getProjectExternalDatasetsRequest } from  '@/api/projects';
import { useBrandTitle } from '@/hooks/use-brand-title';

export default function Page(): React.JSX.Element {
  const brandTitle = useBrandTitle();
  const router = useRouter();
  const [projectExternalDatasets, setProjectExternalDatasets] = useState([]);
  const params = useParams<{ id: string }>();
  const pProjectId = params.id; //Obtain the project id from the URL
  const isMounted = useRef(false);
  const fetchProjectExternalDatasets = async () => {
        try {
          if (!isMounted.current) {
            isMounted.current = true;
            console.log('Fetching project external datasets...');
            console.log('Project ID:', pProjectId);
            const response = await getProjectExternalDatasetsRequest(pProjectId); 
            setProjectExternalDatasets(response.data);
            console.log('External datasets of the project:', response.data);
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

