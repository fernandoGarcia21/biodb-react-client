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
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import {Typography} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { config } from '@/config';
import { AxiosError } from 'axios';
import { useUser } from '@/hooks/use-user';
import { useBrandTitle } from '@/hooks/use-brand-title';

import { getBatchProcessByIdRequest, updateBatchRequest } from '@/api/batch';
import { API, BU_STATUS_APPROVED, BU_STATUS_REJECTED} from '@/constants';
import { getBatchFileRequest } from '@/api/files';

const schema = zod.object({
  name : zod.string().min(1, { message: 'Name is required' }).max(255, { message: 'Name is too long' }),
  file_name: zod.string().min(1, { message: 'File name is required' }).max(255, { message: 'File name is too long' }),
  internal_file_name: zod.string().min(1, { message: 'Internal file name is required' }).max(255, { message: 'Internal file name is too long' }),
  parameters: zod.string().max(1000).or(zod.string().max(0)),
  batch_type: zod.string().min(1, { message: 'Batch type is required' }).max(255, { message: 'Batch type is too long' }),
  uploaded_by: zod.string().min(1, { message: 'Uploaded by is required' }).max(255, { message: 'Uploaded by is too long' }),
  status_id: zod.number({ required_error: 'Status id is required' }).int().positive({ message: 'Status id is required' }),
  status: zod.string().min(1, { message: 'Status is required' }).max(255, { message: 'Status is too long' }),
  date_submitted: zod.string().min(1, { message: 'Date submitted is required' }).max(255, { message: 'Date submitted is too long' }),
  curator_id: zod.number({ required_error: 'Curator is required' }).int().positive({ message: 'Curator is required' }),
  curator_notes: zod.string().max(1000).or(zod.string().max(0)),
});


type Values = zod.infer<typeof schema>;


export function BatchReviewForm(): React.JSX.Element {
  const router = useRouter();
  const { user } = useUser();
  const asString = React.useCallback((value: unknown): string => {
    return value == null ? '' : String(value);
  }, []);

  const {
    control,
    watch,
    reset,
    handleSubmit,
    setError,
    formState,
    formState: { errors, isSubmitSuccessful },
  } = useForm<Values>({ resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      file_name: '',
      internal_file_name: '',
      parameters: '',
      batch_type: '',
      uploaded_by: '',
      status_id: 0,
      status: '',
      date_submitted: '',
      curator_id: user?.personId ? Number(user.personId) : 0,
      curator_notes: '',
    },
   });


  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [listCountries, setListCountries] = useState<{ id: number; name: string }[]>([]);
  const params = useParams<{ id: string }>();
  const [batchId, setBatchId] = useState(params.id);
  const brandTitle = useBrandTitle();

  const isMounted = useRef(false);

  
  useEffect(() => {
      const fetchLocation = async () => {
        try {
          if (!isMounted.current) {
            isMounted.current = true;
            //fetch batch info
            const responseBatch = await getBatchProcessByIdRequest(batchId);
            if (responseBatch.data && responseBatch.data.length > 0) {
                  reset({ name: asString(responseBatch.data[0].name),
                    file_name: asString(responseBatch.data[0].file_name), 
                    internal_file_name: asString(responseBatch.data[0].internal_file_name),
                    parameters: asString(responseBatch.data[0].parameters),
                    batch_type: asString(responseBatch.data[0].batch_type),
                    uploaded_by: asString(responseBatch.data[0].uploaded_by),
                    status_id: Number(responseBatch.data[0].status_id),
                    status: asString(responseBatch.data[0].status),
                    date_submitted: asString(responseBatch.data[0].date_submitted),
                      curator_id: user?.personId ? Number(user.personId) : 0,
                    curator_notes: asString(responseBatch.data[0].curator_notes) });
              document.title = `Update Batch: ${responseBatch.data[0].file_name} | ${brandTitle}`;
            }
          }
        } catch (error) {
          console.error('Error fetching batch info:', error);
        }
      };
  
      fetchLocation();
  
    }, [asString, batchId, reset, user?.personId]);

//When the Update button is pressed, the form is submitted and the batch is updated with the curator notes
  const onSubmit = React.useCallback(
      async (values: Values): Promise<void> => {
        console.log('Submitting form with values:', values);
        setIsPending(true);
        setSuccessMessage(null);
        try{
          await updateBatchRequest(batchId, values);
          setSuccessMessage(`Batch ${values.file_name} updated successfully!`);
          setIsPending(false);

        }catch(error){
          if (error instanceof AxiosError && error.request && error.request.response) {
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

  const handleActionSubmit = React.useCallback(
    (statusId: number) => {
      void handleSubmit(
        async (values) => {
          await onSubmit({ ...values, status_id: statusId });
        },
        (validationErrors) => {
          const firstField = Object.keys(validationErrors)[0];
          if (firstField) {
            setError('root', { type: 'validate', message: `Validation failed in field: ${firstField}` });
          }
          console.error('Form validation errors:', validationErrors);
        }
      )();
    },
    [handleSubmit, onSubmit, setError]
  );

    //Function to handle the download of the batch file
    const handleDownload = async () => {
        const response = await getBatchFileRequest(batchId);
        const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `${watch('file_name') || 'batch'}`;
        link.click();

        window.URL.revokeObjectURL(url);
        };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardContent>
          <Stack spacing={1} sx={{ maxWidth: 'sm' }}>
            <Typography variant="subtitle1">
                Batch name
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', bgcolor: 'grey.100', p: 1, mb: 2 }}>
                {watch('name')}
            </Typography>
            <Typography variant="subtitle1">
                Batch type
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', bgcolor: 'grey.100', p: 1, mb: 2 }}>
                {watch('batch_type')}
            </Typography>
            <Typography variant="subtitle1">
                File name
            </Typography>
            <Typography
              variant="body1"
              component="div"
              sx={{
                bgcolor: 'grey.100',
                p: 1,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <span>{watch('file_name')}</span>
              <Button startIcon={<DownloadIcon 
              fontSize="var(--icon-fontSize-md)" />} 
              onClick={handleDownload} 
              variant="contained"
              color="primary">
                Download
              </Button>
            </Typography>
            <Typography variant="subtitle1">
                Internal file name
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', bgcolor: 'grey.100', p: 1, mb: 2 }}>
                {watch('internal_file_name')}
            </Typography>
            <Typography variant="subtitle1">
                Uploaded by
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', bgcolor: 'grey.100', p: 1, mb: 2 }}>
                {watch('uploaded_by')}
            </Typography>
            <Typography variant="subtitle1">
                Date submitted
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', bgcolor: 'grey.100', p: 1, mb: 2 }}>
                {watch('date_submitted')}
            </Typography>
            <Typography variant="subtitle1">
                Results of curation
            </Typography>
            <Controller
                control={control}
                name="curator_notes"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.curator_notes)} sx={{ mb: 2 }}>
                  <InputLabel>Curator notes</InputLabel>
                  <OutlinedInput {...field} label="Curator notes" type="text" multiline={true} minRows={4}/>
                  {errors.curator_notes ? <FormHelperText>{errors.curator_notes.message}</FormHelperText> : null}
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
        <Button
            type="button"
            variant="contained"
            color="error"
            disabled={isPending}
            onClick={() => {
              handleActionSubmit(BU_STATUS_REJECTED);
            }}
          >
            Reject
          </Button>
          <Button
            type="button"
            variant="contained"
            color="success"
            disabled={isPending}
            onClick={() => {
              handleActionSubmit(BU_STATUS_APPROVED);
            }}
          >
            Approve
          </Button>
        </CardActions>
      </Card>
    </form>
  );
}
