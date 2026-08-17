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
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { AxiosError } from 'axios';


import { Link as ExternalDatasetIcon } from '@phosphor-icons/react/dist/ssr/Link';
import { config } from '@/config';
import { UpdateProjectForm } from '@/components/dashboard/projects/update-project-form';

import { ExternalDatasetsTable } from '@/components/dashboard/externaldatasets/project-externaldatasets-table';
import type { ExternalDataset } from '@/components/dashboard/externaldatasets/project-externaldatasets-table';

import { getProjectExternalDatasetsRequest, getAvailableProjectExternalDatasetsRequest, createProjectExternalDatasetRequest, deleteProjectExternalDatasetRequest } from  '@/api/projects';
import { useBrandTitle } from '@/hooks/use-brand-title';

export default function Page(): React.JSX.Element {

  const router = useRouter();
  const [projectExternalDatasets, setProjectExternalDatasets] = useState([]);
  const params = useParams<{ id: string }>();
  const pProjectId = params.id; //Obtain the project id from the URL
  const isMounted = useRef(false);
  const brandTitle = useBrandTitle();

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
      
  
       //State for the operation result messages
        const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
        const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
      
        //Code for the delete dialog
        const [open, setOpen] = React.useState(false);
        const [deleteName, setDeleteName] = React.useState("");
        const [deleteId, setDeleteId] = React.useState<number | null>(null); //Property ID to delete
        const errorRef = React.useRef<HTMLDivElement>(null);
      
        const handleClickOpen = (idExternalDataset: number, nameExternalDataset: string) => {
          setDeleteId(idExternalDataset);
          setDeleteName(nameExternalDataset);
          setSuccessMessage(null);
          setErrorMessage(null);
          setOpen(true);
        };
      
        const handleClose = () => {
          setDeleteId(null);
          setDeleteName('');
          setOpen(false);
        };
      
        const handleDelete = async () => {
          // Perform delete operation here
          setSuccessMessage(null);
          setErrorMessage(null);
          try{
            if (deleteId) {
              await deleteProjectExternalDatasetRequest(deleteId);
              setSuccessMessage(`The external dataset ${deleteName} was unlinked from the project successfully!`);
               // Refresh the traits table
              isMounted.current = false;
              await fetchProjectExternalDatasets();
            } else {
              throw new Error('ID of the object is null or undefined when trying to delete');
            }
          }catch(error){
            if (error instanceof AxiosError && error.request && error.request.response) {
              const errorMessage = JSON.parse(error.request.response).message;
              setErrorMessage(String(errorMessage));
            } else {
              setErrorMessage(String(error));
            }
          }
          console.log('Item deleted');
          handleClose();
      
          //Scroll to the error message
          if (errorRef.current) {
            errorRef.current.scrollIntoView({ behavior: 'smooth' });
          }
      
        };
  
    

    //Code for the add external dataset dialog
      const [openAddExternalDataset, setOpenAddExternalDataset] = React.useState(false);
    
      //Handle the opening and closing of the dialog to delete
      const handleClickOpenAddExternalDataset = () => {
        setSuccessMessage(null);
        setErrorMessage(null);
        setOpenAddExternalDataset(true);
      };
    
      const handleCloseAddExternalDataset = () => {
        setOpenAddExternalDataset(false);
        setErrorMessageExternalDataset({ ...errorMessageExternalDataset, external_dataset_id: '' });
        setErrorsExternalDataset({ ...errorsExternalDataset, external_dataset_id: false });
        setExternalDatasetId(0);
      };
    
      const handleConfirmAddExternalDataset = async () => {
        // Perform delete operation here
        setSuccessMessage(null);
        setErrorMessage(null);
        try{
          if (externalDatasetId && externalDatasetId > 0 ) {
    
              await createProjectExternalDatasetRequest(pProjectId, externalDatasetId);
              setSuccessMessage(`External dataset and project were associated successfully!`);
              // Refresh the projects external datasets table
              isMounted.current = false;
              await fetchProjectExternalDatasets();
    
              //Reset the fields
              setExternalDatasetId(0);
              setErrorMessageExternalDataset({ ...errorMessageExternalDataset, external_dataset_id: '' });
              setErrorsExternalDataset({ ...errorsExternalDataset, external_dataset_id: false });
    
              //Close the dialog
              handleCloseAddExternalDataset();
    
          } else {
          
            if (!externalDatasetId || externalDatasetId <= 0) {
              setErrorsExternalDataset((prevErrors) => ({ ...prevErrors, external_dataset_id: true }));
              setErrorMessageExternalDataset((prevErrorMessages) => ({ ...prevErrorMessages, external_dataset_id: 'Please select a external dataset' }));
            }
          }
        }catch(error){
          if (error instanceof AxiosError && error.request && error.request.response) {
            const errorMessage = JSON.parse(error.request.response).message;
            setErrorMessage(String(errorMessage));
          } else {
            setErrorMessage(String(error));
          }
        }
        
        //Scroll to the error message
        if (errorRef.current) {
          errorRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    
      };
    
      //Reset the error messages of the add external dataset dialog
      const onChangeExternalDataset = (event: SelectChangeEvent<number>) => {
        const newExternalDatasetId = Number(event.target.value);
        setExternalDatasetId(newExternalDatasetId);
        setErrorMessageExternalDataset({ ...errorMessageExternalDataset, external_dataset_id: '' });
        setErrorsExternalDataset({ ...errorsExternalDataset, external_dataset_id: false });
      };


  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Projects</Typography>
      </div>
      <UpdateProjectForm />

      <Stack direction="row" spacing={3}>
          <div>
            <Button variant="contained" color="inherit" onClick={handleClickOpenAddExternalDataset} startIcon={<ExternalDatasetIcon fontSize="var(--icon-fontSize-md)" />}>
              Associate external dataset
            </Button>
          </div>
        </Stack>
      <ExternalDatasetsTable
                count={projectExternalDatasets.length}
                page={0}
                rows={projectExternalDatasets}
                handleClickOpen={handleClickOpen}
              />
      <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {`Are you sure you want to unlink ${deleteName} from the project?`}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleDelete} autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openAddExternalDataset}
          onClose={handleCloseAddExternalDataset}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            Are you sure you want to associated an external dataset to the project?
          </DialogTitle>
          <DialogContent dividers>
                  <FormControl fullWidth error={Boolean(errorsExternalDataset.external_dataset_id)}>
                    <InputLabel>External dataset</InputLabel>
                      <Select value={externalDatasetId} 
                      label="External dataset" 
                      variant="outlined"
                      onChange={onChangeExternalDataset}>
                      <MenuItem value={0}>External dataset</MenuItem>
                        {listAvailableExternalDatasets.map((option) => (
                          <MenuItem key={option.external_dataset_id} value={option.external_dataset_id}>
                            {`${option.dataset_name} (${option.type_dataset_name})`}
                          </MenuItem>
                            ))}
                      </Select>
                      {errorsExternalDataset.external_dataset_id ? <FormHelperText>{errorMessageExternalDataset.external_dataset_id}</FormHelperText> : null}
                  </FormControl>
          </DialogContent>
            <DialogActions>
            <Button onClick={handleCloseAddExternalDataset}>Cancel</Button>
            <Button onClick={handleConfirmAddExternalDataset} autoFocus>
              Associate external dataset
            </Button>
          </DialogActions>
        </Dialog>



        <Stack ref={errorRef} spacing={3} sx={{ mt: 1, mb: 3 }}>
          {errorMessage ? <Alert color="error">{errorMessage}</Alert> : null}
          {successMessage ? <Alert color="success">{successMessage}</Alert> : null}
        </Stack>
    </Stack>
  );
}
