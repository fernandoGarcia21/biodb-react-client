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
import { TraitsFilters } from '@/components/dashboard/traits/traits-filters';
import { TraitsTable } from '@/components/dashboard/traits/traits-table';
import type { Trait } from '@/components/dashboard/traits/traits-table';
import { paths } from '@/paths';

import { getTraitsRequest } from '../../../api/traits';
import { deleteTraitRequest } from '../../../api/traits';
import { USER_LEVEL_ADMIN, USER_LEVEL_LEADER } from '@/constants';
import { useUser } from '@/hooks/use-user';

export default function Page(): React.JSX.Element {
  const router = useRouter();
  const [traits, setTraits] = useState([]);
  const isMounted = useRef(false);
  const { user } = useUser();

  const fetchTraits = async () => {
    try {
      if (!isMounted.current) {
        isMounted.current = true;
        const response = await getTraitsRequest(); 
        setTraits(response.data);
        console.log('Traits:', response.data);
      }
    } catch (error) {
      console.error('Error fetching Traits:', error);
    }
  };

  useEffect(() => {
    void fetchTraits();

  }, []);

  //Add title to the page
  useEffect(() => {
    document.title = `Traits | Dashboard | ${config.site.name}`;
  }, []);


  //State for the operation result messages
  const [successMessage, setSuccessMessage] = React.useState(null);
  const [errorMessage, setErrorMessage] = React.useState(null);

  //Code for the delete dialog
  const [open, setOpen] = React.useState(false);
  const [deleteName, setDeleteName] = React.useState("");
  const [deleteId, setDeleteId] = React.useState(null);
  const errorRef = React.useRef<HTMLDivElement>(null);

  const handleClickOpen = (idTrait: number, nameTrait: string) => {
    setDeleteId(idTrait);
    setDeleteName(nameTrait);
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
        await deleteTraitRequest(deleteId);
        setSuccessMessage(`Trait ${deleteName} eliminated successfully!`);
         // Refresh the traits table
        isMounted.current = false;
        fetchTraits();
      } else {
        throw new Error('Trait ID is null or undefined when trying to delete');
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

  const handleUpdateClick = (idTrait: number) => {
    router.push(paths.dashboard.traitUpdate(idTrait));
  };


  //Initialize the pagination of the table
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  //Paginate the list of traits
  const paginatedTraits = applyPagination(traits, page, rowsPerPage);

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
    router.push(paths.dashboard.traitCreate);
  };

  return (
      <Stack spacing={3}>
        <Stack direction="row" spacing={3}>
          <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
            <Typography variant="h4">Traits list</Typography>
          </Stack>
          {(user?.levelId === USER_LEVEL_ADMIN || user?.levelId === USER_LEVEL_LEADER) && (
            <div>
              <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={handleAddClick}>
                Add
              </Button>
            </div>
          )}
        </Stack>
        {/**<TraitsFilters /> */}
        <TraitsTable
          count={traits.length}
          page={page}
          rows={paginatedTraits}
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

function applyPagination(rows: Trait[], page: number, rowsPerPage: number): Trait[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
