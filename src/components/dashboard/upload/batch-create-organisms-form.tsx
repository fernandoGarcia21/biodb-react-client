'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { zodResolver } from '@hookform/resolvers/zod';
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
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';


import { createBatchRequest } from '@/api/batch';
import { BATCH_TYPE_UPLOAD_ORANISMS_ID } from '@/constants';

  //Maximum file size allowed is 
  const MAX_FILE_SIZE = 10000000;

  //Only csv files are allowed
  const checkFileType = (file: File) => {
    if (file?.name) {
        const fileType = file.name.split(".").pop();
        if (fileType === "csv") return true;
    }
    return false;
}

  const schema = zod.object({
    batch_name: zod.string().min(1, { message: 'Name is required' }),
    fileBatch: zod.any().refine((file: File) => file?.length !== 0, {
      message: "An input file is required"
    }).refine((file) => file.size < MAX_FILE_SIZE, `Max size is ${(MAX_FILE_SIZE / (1024)).toFixed(0)} KB.`)
      .refine((file) => checkFileType(file), "Only .csv format is supported."),

  });


type Values = zod.infer<typeof schema>;

export function BatchCreateOrganismsForm(): React.JSX.Element {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [fileTypes, setFileTypes] = React.useState([".CSV"]);
  const [successMessage, setSuccessMessage] = React.useState(null);
  const [uploadFileName , setUploadFileName] = React.useState(null);
  const [uploadFileSize , setUploadFileSize] = React.useState(0);
  const { user } = useUser();

  const {
      control,
      reset,
      register,
      handleSubmit,
      setError,
      formState,
      setValue,
      formState: { errors, isSubmitSuccessful },
    } = useForm<Values>({ resolver: zodResolver(schema),
      defaultValues: {
        batch_name: '',
        fileBatch: undefined,
      },
     });

   const onSubmit = React.useCallback(
      async (values: Values): Promise<void> => {
        setIsPending(true);
        setSuccessMessage(null);
        try{
          if (!user) {
            setError('root', { type: 'server', message: 'User is not authenticated' });
            setIsPending(false);
            return;
          }

          const requestData = { ...values, 
            batch_type_id: BATCH_TYPE_UPLOAD_ORANISMS_ID, 
            person_id: user.personId, 
            parameters: {} }; 
            
          await createBatchRequest(requestData);

          reset({ fileBatch: undefined, batch_name: '' });
          setUploadFileName(null);
          setUploadFileSize(0);

          setSuccessMessage(`Batch upload process created successfully!`);
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

    const handleChange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        reset({ fileBatch: file });
        setUploadFileName(file.name);
        // Convert bytes to KB and set the size
        setUploadFileSize(bytesToKB(file.size));
      }
    };

    const bytesToKB = (bytes) => {
      return (bytes / (1024)).toFixed(2);
    }

    const VisuallyHiddenInput = styled('input')({
      clip: 'rect(0 0 0 0)',
      clipPath: 'inset(50%)',
      height: 1,
      overflow: 'hidden',
      position: 'absolute',
      bottom: 0,
      left: 0,
      whiteSpace: 'nowrap',
      width: 1,
    });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader title={`Upload a CSV file with the individuals information`} />
        <Divider />
        <CardContent>
          <Stack spacing={1} sx={{ textAlign: 'left' }}>
          <Typography variant="body2" sx={{ mt: 2 }}>
              Need a template?{' '}
              <a
                href="/assets/TemplateOrganisms.csv"
                download
                style={{ textDecoration: 'none', color: 'blue' }}
              >
                Download the template
              </a>
            </Typography>
            <Controller
                control={control}
                name="fileBatch"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.fileBatch)}>
                    <Button
                      component="label"
                      role={undefined}
                      variant="contained"
                      tabIndex={-1}
                      startIcon={<CloudUploadIcon />}
                    >
                      Upload files
                      <VisuallyHiddenInput {...field}
                        {...register("fileBatch")}
                        type="file"
                        onChange={handleChange}
                        accept={fileTypes.join(",")}
                        value={""}
                        multiple={false}
                      />
                    </Button>

                  {errors.fileBatch ? <FormHelperText>{errors.fileBatch.message}</FormHelperText> : undefined}
                </FormControl>
                )}
            />
            <Typography variant="h5">{uploadFileName}</Typography>
            <Typography color="text.secondary" variant="body2">
              {uploadFileSize} KB
            </Typography>
          </Stack>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Controller
                control={control}
                name="batch_name"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.batch_name)}>
                  <InputLabel>Dataset name or short description</InputLabel>
                  <OutlinedInput {...field} label="Dataset name or short description" type="text"/>
                  {errors.batch_name ? <FormHelperText>{errors.batch_name.message}</FormHelperText> : null}
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
          <Button type="submit" variant="contained" disabled={isPending}>Submit</Button>
        </CardActions>
      </Card>
    </form>
  );
}
