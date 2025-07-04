'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {useEffect, useState, useRef} from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
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
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { createExternalDatasetRequest } from '@/api/externalDatasets';
import { getTypeDatasetsRequest } from '@/api/typeDatasets';
import { get } from 'axios';

const schema = zod.object({
  name: zod.string().min(1, { message: 'Name is required' }),
  description: zod.string().min(1, { message: 'Description is required' }),
  url: zod.string().url({ message: 'Invalid URL format' }), // Validate URL format
  type_dataset_id: zod.number().min(1, { message: 'The type of dataset is required.' }),
});

type Values = zod.infer<typeof schema>;

export function CreateExternalDatasetForm(): React.JSX.Element {
  const router = useRouter();
  const [listTypeDatasets, setListTypeDatasets] = useState([]);
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [successMessage, setSuccessMessage] = React.useState(null);

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
        name: '',
        description: '',
        url: '',
        type_dataset_id: 0,
      },
     });

  const isMounted = useRef(false);
         
      useEffect(() => {
          const fetchTypeDatasets = async () => {
            try {
              if (!isMounted.current) {
                isMounted.current = true;
                //Fetch type datasets info
                  const responseTypeDatasets = await getTypeDatasetsRequest();
                  if (responseTypeDatasets.data && responseTypeDatasets.data.length > 0) {
                    setListTypeDatasets(responseTypeDatasets.data);
                }
              }
            } catch (error) {
              console.error('Error fetching type dataset list:', error);
            }
          };
      
          fetchTypeDatasets();
      
        }, []);

  const onSubmit = React.useCallback(
      async (values: Values): Promise<void> => {
        setIsPending(true);
        setSuccessMessage(null);
        try{
          await createExternalDatasetRequest(values);
          reset({ name: "", description: "", url: "", type_dataset_id: 0 });
          setSuccessMessage(`External dataset ${values.name} created successfully!`);
          setIsPending(false);

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
        router.refresh();
      },
      [router, reset, setError]
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader title="New external dataset" />
        <Divider />
        <CardContent>
          <Stack spacing={3} sx={{ maxWidth: 'sm' }}>
          <Controller
                control={control}
                name="type_dataset_id"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.type_dataset_id)}>
                  <InputLabel>Type dataset</InputLabel>
                    <Select {...field} defaultValue="0" label="Type dataset" variant="outlined">
                    <MenuItem value={0}>Select one type of dataset</MenuItem>
                      {listTypeDatasets.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.name}
                        </MenuItem>
                      ))}
                    </Select>
                  {errors.type_dataset_id ? <FormHelperText>{errors.type_dataset_id.message}</FormHelperText> : null}
                </FormControl>
                )}
            />
            <Controller
                control={control}
                name="name"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.name)}>
                  <InputLabel>Name</InputLabel>
                  <OutlinedInput {...field} label="Name" type="text"/>
                  {errors.name ? <FormHelperText>{errors.name.message}</FormHelperText> : null}
                </FormControl>
                )}
            />
            <Controller
                control={control}
                name="url"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.url)}>
                  <InputLabel>URL</InputLabel>
                  <OutlinedInput {...field} label="URL" type="text"/>
                  {errors.url ? <FormHelperText>{errors.url.message}</FormHelperText> : null}
                </FormControl>
                )}
            />
            <Controller
                control={control}
                name="description"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.description)}>
                  <InputLabel>Description</InputLabel>
                  <OutlinedInput {...field} label="Description" type="text" multiline="true" minRows={4}/>
                  {errors.description ? <FormHelperText>{errors.description.message}</FormHelperText> : null}
                </FormControl>
                )}
            />
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
