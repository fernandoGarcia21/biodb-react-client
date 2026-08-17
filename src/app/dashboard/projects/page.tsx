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
import { ProjectsFilters } from '@/components/dashboard/projects/projects-filters';
import { ProjectsTable } from '@/components/dashboard/projects/projects-table';
import type { Project } from '@/components/dashboard/projects/projects-table';
import { paths } from '@/paths';
import { USER_LEVEL_ADMIN, USER_LEVEL_LEADER } from '@/constants';
import { useUser } from '@/hooks/use-user';
import { AxiosError } from 'axios';
import { useBrandTitle } from '@/hooks/use-brand-title';

import { getProjectsRequest, deleteProjectRequest } from '@/api/projects';

export default function Page(): React.JSX.Element {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const isMounted = useRef(false);
  const { user } = useUser();
  const brandTitle = useBrandTitle();

  const fetchProjects = async () => {
    try {
      if (!isMounted.current) {
        isMounted.current = true;
        const response = await getProjectsRequest(); 
        setProjects(response.data);
        console.log('Projects:', response.data);
      }
    } catch (error) {
      console.error('Error fetching Projects:', error);
    }
  };

  useEffect(() => {
    void fetchProjects();

  }, []);

  //Add title to the page
  useEffect(() => {
    document.title = `Projects | ${brandTitle}`;
  }, [brandTitle]);


  //State for the operation result messages
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  //Code for the delete dialog
  const [open, setOpen] = React.useState(false);
  const [deleteName, setDeleteName] = React.useState("");
  const [deleteId, setDeleteId] = React.useState<number | null>(null);
  const errorRef = React.useRef<HTMLDivElement>(null);

  //Handle the opening and closing of the dialog to delete
  const handleClickOpen = (idProject: number, nameProject: string) => {
    setDeleteId(idProject);
    setDeleteName(nameProject);
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
        await deleteProjectRequest(deleteId);
        setSuccessMessage(`Project ${deleteName} eliminated successfully!`);
         // Refresh the projects table
        isMounted.current = false;
        fetchProjects();
      } else {
        throw new Error('Project ID is null or undefined when trying to delete');
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

  const handleUpdateClick = (idProject: number) => {
    router.push(paths.dashboard.projectUpdate(idProject));
  };


  //Initialize the pagination of the table
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  //Paginate the list of projects
  const paginatedProjects = applyPagination(projects, page, rowsPerPage);

  //Define the event handlers for the pagination
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Rows per page :', event.target.value);
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    console.log('The new page number :', newPage);
    setPage(newPage);
  };

  const handleAddClick = () => {
    router.push(paths.dashboard.projectCreate);
  };


  //Code for the must read dialog
    const [openMustRead, setOpenMustRead] = React.useState(false);
    const [mustReadTitle, setMustReadTitle] = React.useState("");
    const [mustReadContent, setMustReadContent] = React.useState("");
  
    const handleMustReadClickOpen = async(pMstReadTitle: string, pMustReadContent: string) => {
      try {
        if(!openMustRead && pMustReadContent && pMustReadContent.length > 0){

          setMustReadTitle(pMstReadTitle);
          setMustReadContent(pMustReadContent);
          
          setOpenMustRead(true);
        }
        
        } catch (error) {
            console.error('Error fetching must read content:', error);
        }
    };
  
    const handleCloseMustRead = () => {
      setMustReadTitle('');
      setMustReadContent('');
      setOpenMustRead(false);
    };
  


  return (
      <Stack spacing={3}>
        <Stack direction="row" spacing={3}>
          <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
            <Typography variant="h4">Projects list</Typography>
          </Stack>
          { (user?.levelId === USER_LEVEL_ADMIN || user?.levelId === USER_LEVEL_LEADER) && (
            <div>
              <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={handleAddClick}>
                Add
              </Button>
            </div>
          )}
        </Stack>
        {/**<ProjectsFilters /> */}
        <ProjectsTable
          count={projects.length}
          page={page}
          rows={paginatedProjects}
          rowsPerPage={rowsPerPage}
          myRowsPerPageChangeEvent={handleChangeRowsPerPage}
          myPageChangeEvent={handleChangePage}
          handleClickOpen={handleClickOpen}
          handleUpdateClick={handleUpdateClick}
          handleMustReadClickOpen={handleMustReadClickOpen}
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
      <Dialog
          open={openMustRead}
          onClose={handleCloseMustRead}
          aria-labelledby="alert-must-read-dialog-title"
          aria-describedby="alert-must-read-dialog-content"
          >
          <DialogTitle id="alert-must-read-dialog-title">
            {`Must Read: ${mustReadTitle}`}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-must-read-dialog-content" sx={{ whiteSpace: 'pre-wrap', color: 'text.primary' }}>
              {mustReadContent}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseMustRead}>Close</Button>
          </DialogActions>
        </Dialog>
        <Stack ref={errorRef} spacing={3} sx={{ mt: 1, mb: 3 }}>
          {errorMessage ? <Alert color="error">{errorMessage}</Alert> : null}
          {successMessage ? <Alert color="success">{successMessage}</Alert> : null}
        </Stack>
      </Stack>
  );
}

function applyPagination(rows: Project[], page: number, rowsPerPage: number): Project[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
