'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'next/navigation'
import {useEffect, useState, useRef} from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
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
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { config } from '@/config';

import { getTypeDatasetRequest, updateTypeDatasetRequest } from '@/api/typeDatasets';

const schema = zod.object({
  name: zod.string().min(1, { message: 'Name is required' }),
});

type Values = zod.infer<typeof schema>;


export function UpdateTypeDatasetForm(): React.JSX.Element {
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
      name: '',
    },
   });


  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [successMessage, setSuccessMessage] = React.useState(null);
  const params = useParams<{ id: int }>();
  const [typeDatasetId, setTypeDatasetId] = useState(params.id);

  const isMounted = useRef(false);
  
  useEffect(() => {
      const fetchTypeDataset = async () => {
        try {
          if (!isMounted.current) {
            isMounted.current = true;
            //fetch TypeDataset info
            const responseTypeDataset= await getTypeDatasetRequest(typeDatasetId);
            if (responseTypeDataset.data && responseTypeDataset.data.length > 0) {
              reset({ name: responseTypeDataset.data[0].name, });
              document.title = `Update Type Dataset: ${responseTypeDataset.data[0].name} | Dashboard | ${config.site.name}`;
            }
          }
        } catch (error) {
          console.error('Error fetching type dataset info:', error);
        }
      };
  
      fetchTypeDataset();
  
    }, []);

//When the Update button is pressed, the form is submitted and the type dataset is updated
  const onSubmit = React.useCallback(
      async (values: Values): Promise<void> => {
        setIsPending(true);
        setSuccessMessage(null);
        try{
          await updateTypeDatasetRequest(typeDatasetId, values);
          setSuccessMessage(`Type dataset ${values.name} updated successfully!`);
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
        <CardHeader title='Update type dataset' />
        <Divider />
        <CardContent>
          <Stack spacing={3} sx={{ maxWidth: 'sm' }}>
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
          </Stack>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
            {isSubmitSuccessful ? <Alert color="success">{successMessage}</Alert> : null}
          </Stack>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained" disabled={isPending}>Update</Button>
        </CardActions>
      </Card>
    </form>
  );
}
