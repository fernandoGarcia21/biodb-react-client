"use client";
import { useRouter } from 'next/navigation';
import * as React from 'react';
import {useEffect, useState, useRef} from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

//Components for the dialog to create users
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Visibility from '@mui/icons-material/Visibility';
import InputAdornment from '@mui/material/InputAdornment';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Controller, set } from 'react-hook-form';

import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';

import { config } from '@/config';
import { PersonsFilters } from '@/components/dashboard/persons/persons-filters';
import { PersonsTable } from '@/components/dashboard/persons/persons-table';
import type { Person } from '@/components/dashboard/persons/persons-table';
import { paths } from '@/paths';

import { getPersonsRequest, deletePersonRequest } from '@/api/persons';
import { getUserLevelsRequest } from '@/api/userLevels';
import { createUserRequest } from '@/api/users';
import { USER_LEVEL_ADMIN, USER_LEVEL_LEADER } from '@/constants';
import { useUser } from '@/hooks/use-user';
import { AxiosError } from 'axios';
import { useBrandTitle } from '@/hooks/use-brand-title';

export default function Page(): React.JSX.Element {
  const router = useRouter();
  const [persons, setPersons] = useState([]);
  const isMounted = useRef(false);
  const [listUserLevels, setListUserLevels] = useState<{ id: number; name: string }[]>([]);
  const [showPassword, setShowPassword] = React.useState(false);
  const [ errorsUser, setErrorsUser ] = React.useState({  user_level_id: false, password: false });
  const [ errorMessageUser, setErrorMessageUser ] = React.useState({  user_level_id: '', password: '' });
  const [userLevel, setUserLevel] = React.useState(0);
  const [userPassword, setUserPassword] = React.useState('');
  const { user } = useUser();
  const brandTitle = useBrandTitle();

  const fetchPersons = async () => {
    try {
      if (!isMounted.current) {
        isMounted.current = true;
        const response = await getPersonsRequest(); 
        setPersons(response.data);
        console.log('Persons:', response.data);

        //Fetch user levels info
        const responseUserLevels = await getUserLevelsRequest();
        if (responseUserLevels.data && responseUserLevels.data.length > 0) {
          setListUserLevels(responseUserLevels.data);
        }
      }
    } catch (error) {
      console.error('Error fetching Persons or user levels:', error);
    }
  };

  useEffect(() => {
    void fetchPersons();

  }, []);

  //Add title to the page
  useEffect(() => {
    document.title = `Persons | ${brandTitle}`;
  }, [brandTitle]);


  //State for the operation result messages
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  //Code for the delete dialog of deleting person
  const [open, setOpen] = React.useState(false);
  const [deleteName, setDeleteName] = React.useState("");
  const [deleteId, setDeleteId] = React.useState<number | null>(null);
  const errorRef = React.useRef<HTMLDivElement>(null);

  //Handle the opening and closing of the dialog to delete
  const handleClickOpen = (idPerson: number, namePerson: string) => {
    setDeleteId(idPerson);
    setDeleteName(namePerson);
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
        await deletePersonRequest(deleteId);
        setSuccessMessage(`Person ${deleteName} eliminated successfully!`);
         // Refresh the persons table
        isMounted.current = false;
        fetchPersons();
      } else {
        throw new Error('Person ID is null or undefined when trying to delete');
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

  //Code for the add user dialog
  const [openAddUser, setOpenAddUser] = React.useState(false);
  const [addUserName, setAddUserName] = React.useState("");
  const [addUserIdPerson, setAddUserIdPerson] = React.useState<number | null>(null);

  //Handle the opening and closing of the dialog to delete
  const handleClickOpenAddUser = (idPerson: number, namePerson: string) => {
    setAddUserIdPerson(idPerson);
    setAddUserName(namePerson);
    setSuccessMessage(null);
    setErrorMessage(null);
    setOpenAddUser(true);
  };

  const handleCloseAddUser = () => {
    setAddUserIdPerson(null);
    setAddUserName('');
    setOpenAddUser(false);
    setErrorMessageUser({ ...errorMessageUser, user_level_id: '', password: '' });
    setErrorsUser({ ...errorsUser, user_level_id: false, password: false });
    setUserLevel(0);
    setUserPassword('');
  };

  const handleConfirmAddUser = async () => {
    // Perform delete operation here
    setSuccessMessage(null);
    setErrorMessage(null);
    try{
      if (userLevel && userLevel >0 && userPassword && userPassword.length > 0) {

          const dataNewUser = { 
            person_id: addUserIdPerson,
            user_level_id: userLevel, 
            password: userPassword
          };

          await createUserRequest(dataNewUser);
          setSuccessMessage(`User for ${deleteName} was created successfully!`);
          // Refresh the persons table
          isMounted.current = false;
          fetchPersons();

          //Reset the fields
          setUserLevel(0);
          setUserPassword('');
          setErrorMessageUser({ ...errorMessageUser, user_level_id: '', password: '' });
          setErrorsUser({ ...errorsUser, user_level_id: false, password: false });

          //Close the dialog
          handleCloseAddUser();

      } else {
      
        if (!userLevel || userLevel <= 0) {
          setErrorsUser((prevErrors) => ({ ...prevErrors, user_level_id: true }));
          setErrorMessageUser((prevErrorMessages) => ({ ...prevErrorMessages, user_level_id: 'Please select a user level' }));
        }

        if (!userPassword || userPassword.length <= 0) {
          setErrorsUser((prevErrors) => ({ ...prevErrors, password: true }));
          setErrorMessageUser((prevErrorMessages) => ({ ...prevErrorMessages, password: 'Please enter a password' }));
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


  const handleUpdateClick = (idPerson: number) => {
    router.push(paths.dashboard.personUpdate(idPerson));
  };


  //Initialize the pagination of the table
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  //Paginate the list of persons
  const paginatedPersons = applyPagination(persons, page, rowsPerPage);

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
    router.push(paths.dashboard.personCreate);
  };

  //To manage the field of password
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };


  //Reset the error messages of the add user dialog
    const onChangeUserLevel = (event: SelectChangeEvent<number>) => {
      const newUserLevel = Number(event.target.value);
      setUserLevel(newUserLevel);
      setErrorMessageUser({ ...errorMessageUser, user_level_id: '' });
      setErrorsUser({ ...errorsUser, user_level_id: false });
    };

  
    //Reset the error messages of the add user dialog for the password
    const handleInputPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setUserPassword(value);
      
  
      if(value && value.length > 5 && value.length < 11){
        setErrorMessageUser({ ...errorMessageUser, password: '' });
        setErrorsUser({ ...errorsUser, password: false });
      }else{
        setErrorMessageUser({ ...errorMessageUser, password: 'The password must have at least 6 characters and maximum 10 characters' });
        setErrorsUser({ ...errorsUser, password: true });
      }
    };

  return (
      <Stack spacing={3}>
        <Stack direction="row" spacing={3}>
          <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
            <Typography variant="h4">Persons list</Typography>
          </Stack>
          { (user?.levelId === USER_LEVEL_ADMIN || user?.levelId === USER_LEVEL_LEADER) && (
            <div>
              <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={handleAddClick}>
                Add
              </Button>
            </div>
          )}
        </Stack>
        {/**<PersonsFilters />  */}
        <PersonsTable
          count={persons.length}
          page={page}
          rows={paginatedPersons}
          rowsPerPage={rowsPerPage}
          myRowsPerPageChangeEvent={handleChangeRowsPerPage}
          myPageChangeEvent={handleChangePage}
          handleClickOpen={handleClickOpen}
          handleClickOpenAddUser={handleClickOpenAddUser}
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

      <Dialog
        open={openAddUser}
        onClose={handleCloseAddUser}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {`Are you sure you want to create a user for ${addUserName}?`}
        </DialogTitle>
        <DialogContent dividers>
                <FormControl fullWidth error={Boolean(errorsUser.user_level_id)}>
                  <InputLabel>User level</InputLabel>
                    <Select value={userLevel} 
                    label="User level" 
                    variant="outlined"
                    onChange={onChangeUserLevel}>
                    <MenuItem value={0}>Select user level</MenuItem>
                      {listUserLevels.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.name}
                        </MenuItem>
                         ))}
                    </Select>
                    {errorsUser.user_level_id ? <FormHelperText>{errorMessageUser.user_level_id}</FormHelperText> : null}
                </FormControl>
                <FormControl fullWidth error={Boolean(errorsUser.password)} sx={{ mt: 2 }}>
                  <InputLabel>Password</InputLabel>
                  <OutlinedInput 
                  label="Password" 
                  value={userPassword}
                  type={showPassword ? 'text' : 'password'}
                  onChange={handleInputPasswordChange}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={
                            showPassword ? 'hide the password' : 'display the password'
                          }
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          onMouseUp={handleMouseUpPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    } />
                    {errorsUser.password ? <FormHelperText>{errorMessageUser.password}</FormHelperText> : null}
                </FormControl>
        </DialogContent>
         <DialogActions>
          <Button onClick={handleCloseAddUser}>Cancel</Button>
          <Button onClick={handleConfirmAddUser} autoFocus>
            Create user
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

function applyPagination(rows: Person[], page: number, rowsPerPage: number): Person[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
