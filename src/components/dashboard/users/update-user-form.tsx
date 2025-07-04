'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'next/navigation'
import {useEffect, useState, useRef} from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Visibility from '@mui/icons-material/Visibility';
import InputAdornment from '@mui/material/InputAdornment';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { config } from '@/config';

import { getUserNamesRequest, updateUserRequest, updatePasswordRequest } from '@/api/users';
import { getUserLevelsRequest } from '@/api/userLevels';

const schema = zod.object({
  user_level_id: zod.number().min(1, { message: 'User level is requiered' }),
  password: zod.string().min(1, { message: 'Password is required' }),
});

type Values = zod.infer<typeof schema>;


export function UpdateUserForm(): React.JSX.Element {
  const router = useRouter();

  const {
    control,
    reset,
    handleSubmit,
    setError,
    watch,
    setValue,
    clearErrors,
    formState,
    formState: { errors, isSubmitSuccessful },
  } = useForm<Values>({ resolver: zodResolver(schema),
    defaultValues: {
      user_level_id: 0,
       password: '',
    },
   });


  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [successMessage, setSuccessMessage] = React.useState(null);
  const params = useParams<{ id: int }>();
  const [userId, setUserId] = useState(params.id);
  const [personName, setPersonName] = useState('');
  const [email, setEmail] = useState('');
  const [userLevelId, setUserLevelId] = useState(0);
  const [password, setPassword] = useState('');
  const [userStatusId, setUserStatusId] = useState(0);
  const [listUserLevels, setListUserLevels] = useState([]);
  const [showPassword, setShowPassword] = React.useState(false);
  const [ errorsUser, setErrorsUser ] = React.useState({  user_level_id: false, password: false });
  const [ errorMessageUser, setErrorMessageUser ] = React.useState({  user_level_id: '', password: '' });

  const isMounted = useRef(false);
  
  useEffect(() => {
      const fetchUser = async () => {
        try {
          if (!isMounted.current) {
            isMounted.current = true;
            //fetch user info
            const responseUser = await getUserNamesRequest(userId);
            if (responseUser.data && responseUser.data.length > 0) {
              setPersonName(`${responseUser.data[0].first_name} ${responseUser.data[0].family_name}`);
              setEmail(responseUser.data[0].email);
              setUserLevelId(responseUser.data[0].user_level_id);
              setUserStatusId(responseUser.data[0].status_id);
              setPassword('');

              document.title = `Update user: ${responseUser.data[0].first_name} ${responseUser.data[0].family_name} | Dashboard | ${config.site.name}`;
            }

            //Fetch user levels info
            const responseUserLevels = await getUserLevelsRequest();
            if (responseUserLevels.data && responseUserLevels.data.length > 0) {
              setListUserLevels(responseUserLevels.data);
            }
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
        }
      };
  
      fetchUser();
  
    }, []);

//When the Update button is pressed, the form is submitted and the user is updated
  const handleUserLevelUpdate = React.useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
      event.preventDefault(); // Prevent the default form submission behavior
        setIsPending(true);
        setSuccessMessage(null);
        setErrorMessageUser({ ...errorMessageUser, user_level_id: '' });
        setErrorsUser({ ...errorsUser, user_level_id: false });
        try{

          if(userLevelId === 0){
            setErrorMessageUser({ ...errorMessageUser, user_level_id: 'User level is required' });
            setErrorsUser({ ...errorsUser, user_level_id: true });
          }else{
            const values = { user_level_id: userLevelId, status_id: userStatusId };
            await updateUserRequest(userId, values);
            setSuccessMessage(`User updated successfully!`);
          }
          
        }catch(error){
          if (error instanceof Error && error.request && error.request.response) {
            const errorMessage = JSON.parse(error.request.response).message;
            setError('root', { type: 'server', message: String(errorMessage) });
          } else {
            setError('root', { type: 'server', message: String(error) });
          }
          setIsPending(false);
          return;
        }

        // UserProvider, for this case, will not refresh the router
        // After refresh, GuestGuard will handle the redirect
        setIsPending(false);
        router.refresh();
      },
      [router, reset, setError, userLevelId, userStatusId, userId, errorMessageUser, errorsUser]
    );


  //When the Update button is pressed, the form is submitted and the user is updated
  const handleUserPasswordUpdate = React.useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
      event.preventDefault(); // Prevent the default form submission behavior
        setIsPending(true);
        setSuccessMessage(null);
        setErrorMessageUser({ ...errorMessageUser, password: '' });
        setErrorsUser({ ...errorsUser, password: false });
        try{

          if(password === '' || password.length < 6 || password.length > 10){
            setErrorMessageUser({ ...errorMessageUser, password: 'The password must have at least 6 characters and maximum 10 characters' });
            setErrorsUser({ ...errorsUser, password: true });
          }else{
            const values = { password: password };
            await updatePasswordRequest(userId, values);
            setSuccessMessage(`User password updated successfully!`);
          }
          
        }catch(error){
          if (error instanceof Error && error.request && error.request.response) {
            const errorMessage = JSON.parse(error.request.response).message;
            setError('root', { type: 'server', message: String(errorMessage) });
          } else {
            setError('root', { type: 'server', message: String(error) });
          }
          setIsPending(false);
          return;
        }

        // UserProvider, for this case, will not refresh the router
        // After refresh, GuestGuard will handle the redirect
        setIsPending(false);
        router.refresh();
      },
      [router, reset, setError, userLevelId, userStatusId, userId, errorMessageUser, errorsUser]
    );


  //To manage the field of password
    const handleClickShowPassword = () => setShowPassword((show) => !show);
  
    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
    };
  
    const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
    };
  
  
    //Reset the error messages of the add user dialog
      const onChangeUserLevel = (event: React.ChangeEvent<{ value: unknown }>) => {
        const newUserLevel = event.target.value as number;
        setUserLevelId(newUserLevel);
        setErrorMessageUser({ ...errorMessageUser, user_level_id: '' });
        setErrorsUser({ ...errorsUser, user_level_id: false });
      };
  
    
      //Reset the error messages of the add user dialog for the password
      const handleInputPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setPassword(value);
        
    
        if(value && value.length > 5 && value.length < 11){
          setErrorMessageUser({ ...errorMessageUser, password: '' });
          setErrorsUser({ ...errorsUser, password: false });
        }else{
          setErrorMessageUser({ ...errorMessageUser, password: 'The password must have at least 6 characters and maximum 10 characters' });
          setErrorsUser({ ...errorsUser, password: true });
        }
      };

    return (
    <form>
      <Card>
        <CardHeader title={`Update user ${personName}`} />
        <Divider />
        <CardContent>
          <Stack spacing={3} sx={{ maxWidth: 'sm' }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap' }}>
              <FormControl  sx={{ m: 1}} fullWidth error={Boolean(errorsUser.user_level_id)}>
                      <InputLabel>User level</InputLabel>
                        <Select value={userLevelId} 
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
                    <Button type="submit" variant="contained" onClick={handleUserLevelUpdate} disabled={isPending}>Change user level</Button>
              </Stack>
          

              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap' }}>
                <FormControl  sx={{ m: 1}} fullWidth error={Boolean(errorsUser.password)} sx={{ mt: 2 }}>
                    <InputLabel>Password</InputLabel>
                    <OutlinedInput 
                    label="Password" 
                    value={password}
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
                  <Button type="submit" variant="contained" disabled={isPending} onClick={handleUserPasswordUpdate}>Change password</Button>
              </Stack>
          </Stack>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
            {successMessage && successMessage.length > 0 ? <Alert color="success">{successMessage}</Alert> : null}
          </Stack>
        </CardContent>
        <Divider />
      </Card>
    </form>
  );
}
