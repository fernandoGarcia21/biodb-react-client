"use client";
import { useRouter } from 'next/navigation';
import * as React from 'react';
import {useEffect, useState, useRef} from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';

import { config } from '@/config';
import { ExternalDatasetsFilters } from '@/components/dashboard/externaldatasets/externaldatasets-filters';
import { ExternalDatasetsTable } from '@/components/dashboard/externaldatasets/externaldatasets-table';
import type { ExternalDataset } from '@/components/dashboard/externaldatasets/externaldatasets-table';
import { paths } from '@/paths';

import { getExternalDatasetsRequest, deleteExternalDatasetRequest } from '@/api/externalDatasets';

export default function Page(): React.JSX.Element {
  const router = useRouter();
  const [externalDatasets, setExternalDatasets] = useState([]);
  const isMounted = useRef(false);

  const fetchExternalDatasets = async () => {
    try {
      if (!isMounted.current) {
        isMounted.current = true;
        const response = await getExternalDatasetsRequest(); 
        setExternalDatasets(response.data);
        console.log('ExternalDatasets:', response.data);
      }
    } catch (error) {
      console.error('Error fetching External Datasets:', error);
    }
  };

  useEffect(() => {
    void fetchExternalDatasets();

  }, []);

  //Add title to the page
  useEffect(() => {
    document.title = `External Datasets | Dashboard | ${config.site.name}`;
  }, []);


  //State for the operation result messages
  const [successMessage, setSuccessMessage] = React.useState(null);
  const [errorMessage, setErrorMessage] = React.useState(null);

  //Code for the delete dialog
  const [open, setOpen] = React.useState(false);
  const [deleteName, setDeleteName] = React.useState("");
  const [deleteId, setDeleteId] = React.useState(null);
  const errorRef = React.useRef<HTMLDivElement>(null);

  //Handle the opening and closing of the dialog to delete
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
        await deleteExternalDatasetRequest(deleteId);
        setSuccessMessage(`External Dataset ${deleteName} eliminated successfully!`);
         // Refresh the external datasets table
        isMounted.current = false;
        fetchExternalDatasets();
      } else {
        throw new Error('External Dataset ID is null or undefined when trying to delete');
      }
    }catch(error){
      if (error instanceof Error && error.request && error.request.response) {
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

  const handleUpdateClick = (idExternalDataset: number) => {
    router.push(paths.dashboard.externalDatasetUpdate(idExternalDataset));
  };


  //Initialize the pagination of the table
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  //Paginate the list of external datasets
  const paginatedExternalDatasets = applyPagination(externalDatasets, page, rowsPerPage);

  //Define the event handlers for the pagination
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Rows per page :', event.target.value);
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    console.log('The new page number :', newPage);
    setPage(newPage);
  };

  const handleAddClick = () => {
    router.push(paths.dashboard.externalDatasetCreate);
  };

  return (
      <Stack spacing={3}>
        <Stack direction="row" spacing={3}>
          <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
            <Typography variant="h4">External datasets list</Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Button color="inherit" startIcon={<UploadIcon fontSize="var(--icon-fontSize-md)" />}>
                Import
              </Button>
              <Button color="inherit" startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />}>
                Export
              </Button>
            </Stack>
          </Stack>
          <div>
            <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={handleAddClick}>
              Add
            </Button>
          </div>
        </Stack>
        <ExternalDatasetsFilters />
        <ExternalDatasetsTable
          count={externalDatasets.length}
          page={page}
          rows={paginatedExternalDatasets}
          rowsPerPage={rowsPerPage}
          myRowsPerPageChangeEvent={handleChangeRowsPerPage}
          myPageChangeEvent={handleChangePage}
          handleClickOpen={handleClickOpen}
          handleUpdateClick={handleUpdateClick}
        />
        <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {`Are you sure you want to delete ${deleteName}?`}
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
        <Stack ref={errorRef} spacing={3} sx={{ mt: 1, mb: 3 }}>
          {errorMessage ? <Alert color="error">{errorMessage}</Alert> : null}
          {successMessage ? <Alert color="success">{successMessage}</Alert> : null}
        </Stack>
      </Stack>
  );
}

function applyPagination(rows: ExternalDataset[], page: number, rowsPerPage: number): ExternalDataset[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
