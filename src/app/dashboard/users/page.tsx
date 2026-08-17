"use client";
import { useRouter } from 'next/navigation';
import * as React from 'react';
import {useEffect, useState, useRef} from 'react';
import type { Metadata } from 'next';
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
import { UsersFilters } from '@/components/dashboard/users/users-filters';
import { UsersTable } from '@/components/dashboard/users/users-table';
import type { User } from '@/components/dashboard/users/users-table';
import { paths } from '@/paths';
import { AxiosError } from 'axios';
import { useBrandTitle } from '@/hooks/use-brand-title';
 
import { getUsersRequest, activateUserRequest, deactivateUserRequest } from '@/api/users';
import { USER_STATUS_ACTIVE, USER_STATUS_INACTIVE } from '@/constants';
import { useUser } from '@/hooks/use-user';

export default function Page(): React.JSX.Element {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const isMounted = useRef(false);
  const brandTitle = useBrandTitle();

  const fetchUsers = async () => {
    try {
      if (!isMounted.current) {
        isMounted.current = true;
        const response = await getUsersRequest(); 
        setUsers(response.data);
        console.log('Users:', response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  //Add title to the page
  useEffect(() => {
    document.title = `Users | ${brandTitle}`;
  }, [brandTitle]);


  //Initialize the pagination of the table
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  //Paginate the list of users
  const paginatedUsers = applyPagination(users, page, rowsPerPage);

  //Define the event handlers for the pagination
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  //State for the operation result messages
    const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  //Code for the change status dialog
    const [open, setOpen] = React.useState(false);
    const [targetUserName, setTargetUserName] = React.useState("");
    const [targetUserId, setTargetUserId] = React.useState<number | null>(null);
    const [statusOperation, setStatusOperation] = React.useState("");
    const errorRef = React.useRef<HTMLDivElement>(null);
  
    //Handle the opening and closing of the dialog to delete
    const handleClickOpen = (idUser: number, nameUser: string) => {
      setTargetUserId(idUser);
      setTargetUserName(nameUser);
      setStatusOperation("");

      //Dynamically determine the operation to be performed to show in the dialog
      if (idUser) {
        const tmpUser = users.find((user) => Number(user.id) === idUser);
        if (tmpUser) {
          if(tmpUser.status_id === USER_STATUS_ACTIVE){
            setStatusOperation("inactivate");
          }else{
            setStatusOperation("activate");
          }
        }
      }

      setSuccessMessage(null);
      setErrorMessage(null);
      setOpen(true);
    };
  
    const handleClose = () => {
      setTargetUserId(null);
      setTargetUserName('');
      setOpen(false);
    };
  
    const handleChangeStatus = async () => {
      // Perform delete operation here
      setSuccessMessage(null);
      setErrorMessage(null);
      try{
        if (targetUserId) {
          const tmpUser = users.find((user) => Number(user.id) === targetUserId);
          if (tmpUser) {
            if(tmpUser.status_id === USER_STATUS_ACTIVE){
              await deactivateUserRequest(targetUserId);
              setSuccessMessage(`User ${targetUserName} deactivated successfully!`);
            }else{
                await activateUserRequest(targetUserId);
                setSuccessMessage(`User ${targetUserName} activated successfully!`);
            }
          }
          
           // Refresh the projects table
          isMounted.current = false;
          await fetchUsers();
        } else {
          throw new Error('User ID is null or undefined when trying to change status');
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

  const handleUpdateClick = (idUser: number) => {
      router.push(paths.dashboard.userUpdate(idUser));
    };

  return (
      <Stack spacing={3}>
        <Stack direction="row" spacing={3}>
          <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
            <Typography variant="h4">User list</Typography>
          </Stack>
        </Stack>
        {/**<UsersFilters />  */}
        <UsersTable
          count={users.length}
          page={page}
          rows={paginatedUsers}
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
          {`Are you sure you want to ${statusOperation} the user ${targetUserName}?`}
        </DialogTitle>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleChangeStatus} autoFocus>
            Continue
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

function applyPagination(rows: User[], page: number, rowsPerPage: number): User[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
