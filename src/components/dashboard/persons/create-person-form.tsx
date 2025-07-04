'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {useEffect, useState, useRef} from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Visibility from '@mui/icons-material/Visibility';
import InputAdornment from '@mui/material/InputAdornment';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { createPersonRequest } from '@/api/persons';
import { getUserLevelsRequest } from '@/api/userLevels';

const schema = zod.object({
  first_name: zod.string().min(1, { message: 'First name is required' }),
  family_name: zod.string().min(1, { message: 'Family name is required' }),
  abbreviation: zod.string().min(0, { message: 'Invalid description' }).optional(),
  email: zod.string().email({ message: 'Invalid email address' }).optional(),
  additional_info: zod.string().min(0, { message: 'Invalid additional information' }).optional(),
  is_create_user: zod.boolean({ message: 'Indication of whether to create an user or not for the new person is required.' }),
  user_level_id: zod.number().optional(),
  password: zod.string().min(0, { message: 'The password of the new use is required. Either type it or generate it using the button.' }).optional(),
}).refine(data => !data.is_create_user || (data.user_level_id && data.user_level_id > 0), {
  message: 'The user level is required.',
  path: ['user_level_id']
}).refine(data => !data.is_create_user || (data.password && data.password.length > 0), {
  message: 'The password of the new use is required. Either type it or generate it using the button.',
  path: ['password']
});

type Values = zod.infer<typeof schema>;

export function CreatePersonForm(): React.JSX.Element {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [successMessage, setSuccessMessage] = React.useState(null);
  const [showCreateUserPannel, setShowCreateUserPannel] = React.useState(false);
  const [listUserLevels, setListUserLevels] = useState([]);
  const [showPassword, setShowPassword] = React.useState(false);

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
        first_name: '',
        family_name: '',
        abbreviation: '',
        email: '',
        additional_info: '',
        is_create_user: false,
        user_level_id: 0,
        password: '',
      },
     });

    const isMounted = useRef(false);
              
    useEffect(() => {
        const fetchUserLevels = async () => {
          try {
            if (!isMounted.current) {
              isMounted.current = true;
              //Fetch user levels info
                const responseUserLevels = await getUserLevelsRequest();
                if (responseUserLevels.data && responseUserLevels.data.length > 0) {
                  setListUserLevels(responseUserLevels.data);
                }
            }
          } catch (error) {
            console.error('Error fetching user levels info:', error);
          }
        };
    
        fetchUserLevels();
    
      }, []);

         
   const onSubmit = React.useCallback(
      async (values: Values): Promise<void> => {
        setIsPending(true);
        setSuccessMessage(null);
        try{
          await createPersonRequest(values);
          reset({ first_name: '',
            family_name: '',
            abbreviation: '',
            email: '',
            additional_info: '' });
          setSuccessMessage(`Person ${values.first_name} ${values.family_name} created successfully!`);
          setIsPending(false);

        }catch(error){
          if (error instanceof Error && error.request && error.request.response) {
            const errorMessage = JSON.parse(error.request.response).error ? JSON.parse(error.request.response).error : JSON.parse(error.request.response).message;
            setError('root', { type: 'server', message: String(errorMessage) });
          } else {
            setError('root', { type: 'server', message: String(error) });
          }
          setIsPending(false);
          return;
        }

        // UserProvider, for this case, will not refresh the router
        // After refresh, GuestGuard will handle the redirect
        router.refresh();
      },
      [router, reset, setError]
    );


    const handleChangeCreateuser = (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue('is_create_user', event.target.checked);
      setValue('user_level_id', 0);
      
      setShowCreateUserPannel(event.target.checked);
      clearErrors('is_create_user');
      clearErrors('user_level_id');
      console.log('is_create_user:', event.target.checked);
    }

    //To manage the field of password
    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
    };

    const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
    };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader title="New person" />
        <Divider />
        <CardContent>
          <Stack spacing={3} sx={{ maxWidth: 'sm' }}>
            <Controller
                control={control}
                name="first_name"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.first_name)}>
                  <InputLabel>First name</InputLabel>
                  <OutlinedInput {...field} label="First name" type="text"/>
                  {errors.first_name ? <FormHelperText>{errors.first_name.message}</FormHelperText> : null}
                </FormControl>
                )}
            />
            <Controller
                control={control}
                name="family_name"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.family_name)}>
                  <InputLabel>Family name</InputLabel>
                  <OutlinedInput {...field} label="Family name" type="text"/>
                  {errors.family_name ? <FormHelperText>{errors.family_name.message}</FormHelperText> : null}
                </FormControl>
                )}
            />
            <Controller
                control={control}
                name="abbreviation"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.abbreviation)}>
                  <InputLabel>Abbreviation</InputLabel>
                  <OutlinedInput {...field} label="Abbreviation" type="text"/>
                  {errors.abbreviation ? <FormHelperText>{errors.abbreviation.message}</FormHelperText> : null}
                </FormControl>
                )}
            />
            <Controller
                control={control}
                name="email"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.email)}>
                  <InputLabel>Email</InputLabel>
                  <OutlinedInput {...field} label="Email" type="text" />
                  {errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
                </FormControl>
                )}
            />
            <Controller
                control={control}
                name="additional_info"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.additional_info)}>
                  <InputLabel>Additional information</InputLabel>
                  <OutlinedInput {...field} label="Additional information" type="text" multiline="true" minRows={4}/>
                  {errors.additional_info ? <FormHelperText>{errors.additional_info.message}</FormHelperText> : null}
                </FormControl>
                )}
            />
            <Controller
                control={control}
                name="is_create_user"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.is_create_user)}>
                  <FormControlLabel
                    control={<Switch onChange={handleChangeCreateuser} />}
                    label="Create user for the new person?"
                  />
                  {errors.is_create_user ? <FormHelperText>{errors.is_create_user.message}</FormHelperText> : undefined}
                </FormControl>
                )}
            />
            {showCreateUserPannel &&
            <>
              <Controller
                control={control}
                name="user_level_id"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.user_level_id)}>
                  <InputLabel>User level</InputLabel>
                    <Select {...field} defaultValue="0" label="User level" variant="outlined">
                    <MenuItem value={0}>Select user level</MenuItem>
                      {listUserLevels.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.name}
                        </MenuItem>
                         ))}
                    </Select>
                  {errors.user_level_id ? <FormHelperText>{errors.user_level_id.message}</FormHelperText> : null}
                </FormControl>
                )}
            />

            <Controller
                control={control}
                name="password"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.password)}>
                  <InputLabel>Password</InputLabel>
                  <OutlinedInput {...field} label="Password" 
                    type={showPassword ? 'text' : 'password'}
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
                  {errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
                </FormControl>
                )}
            />
          </>
          }
          </Stack>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
            {isSubmitSuccessful ? <Alert color="success">{successMessage}</Alert> : null}
          </Stack>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained" disabled={isPending}>Create</Button>
        </CardActions>
      </Card>
    </form>
  );
}
