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
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { config } from '@/config';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import { AxiosError } from 'axios';

import { createSpeciesRequest } from '@/api/species';

//Maximum file size allowed is 
  const MAX_FILE_SIZE = 1024 * 1024; // 1 MB

  //Only image files are allowed
  const checkFileType = (file: File) => {
    if (file?.name) {
        const fileType = file.name.split(".").pop()?.toLowerCase();
        if (fileType === "jpg" || fileType === "jpeg" || fileType === "png") return true;
    }
    return false;
}

const schema = zod.object({
  name: zod.string().min(1, { message: 'Name is required' }).max(255, { message: 'Name is too long' }),
  description: zod.string().min(1, { message: 'Description of the coordinates is required' }).max(1000, { message: 'Description is too long' }),
  internal_code: zod.string().min(2, { message: 'Internal code is required' }).max(2, { message: 'Internal code requires only two characters' }),
  imageFile: zod.any().refine((file: File) => !!file, {
        message: "An input file is required"
      }).refine((file) => file.size < MAX_FILE_SIZE, `Max size is ${(MAX_FILE_SIZE / (1024)).toFixed(0)} KB.`)
        .refine((file) => checkFileType(file), "Only .jpg, .jpeg or .png format is supported."),
});


type Values = zod.infer<typeof schema>;


export function CreateSpeciesForm(): React.JSX.Element {
  const router = useRouter();
  const [uploadFileName , setUploadFileName] = React.useState(null);
  const [uploadFileSize , setUploadFileSize] = React.useState(0);
  const [fileTypes, setFileTypes] = React.useState([".png", ".jpg", ".jpeg"]);
  const [imagePreviewUrl, setImagePreviewUrl] = React.useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState,
    formState: { errors, isSubmitSuccessful },
  } = useForm<Values>({ resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      internal_code: '',
      imageFile: undefined,
    },
   });


  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  
  const isMounted = useRef(false);
  
  useEffect(() => {
  
    }, []);

  React.useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

//When the create button is pressed, the form is submitted and the sampling area is created
  const onSubmit = React.useCallback(
      async (values: Values): Promise<void> => {
        setIsPending(true);
        setSuccessMessage(null);
        try{
          // Convert habitat_id to null if it's 0
          const submitData = {
            ...values,
          };
          await createSpeciesRequest(submitData);
          setSuccessMessage(`Species ${values.name} created successfully!`);
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
      [router, setError]
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (file) {
            setValue('imageFile', file, { shouldValidate: true, shouldDirty: true });
            setImagePreviewUrl((previousUrl) => {
              if (previousUrl) {
                URL.revokeObjectURL(previousUrl);
              }
              return URL.createObjectURL(file);
            });
            setUploadFileName(file.name);
            // Convert bytes to KB and set the size
            setUploadFileSize(bytesToKB(file.size));
          } else {
            setValue('imageFile', undefined, { shouldValidate: true, shouldDirty: true });
            setImagePreviewUrl((previousUrl) => {
              if (previousUrl) {
                URL.revokeObjectURL(previousUrl);
              }
              return null;
            });
          }
        };
    
        const bytesToKB = (bytes: number): number => {
          return Math.round((bytes / 1024) * 100) / 100;
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
        <CardHeader title={`Create Species`} />
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
            <Controller
                control={control}
                name="internal_code"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.internal_code)}>
                  <InputLabel>Internal Code</InputLabel>
                  <OutlinedInput {...field} label="Internal Code" type="text"/>
                  {errors.internal_code ? <FormHelperText>{errors.internal_code.message}</FormHelperText> : null}
                </FormControl>
                )}
            />
            <Controller
                control={control}
                name="description"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.description)}>
                  <InputLabel>Description</InputLabel>
                  <OutlinedInput {...field} label="Description" type="text" multiline={true} minRows={4}/>
                  {errors.description ? <FormHelperText>{errors.description.message}</FormHelperText> : null}
                </FormControl>
                )}
            />
            <Controller
                control={control}
                name="imageFile"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.imageFile)}>
                    {imagePreviewUrl ? (
                      <Box sx={{ mb: 1.5 }}>
                        <Typography color="text.secondary" variant="body2" sx={{ mb: 0.75 }}>
                          Image preview
                        </Typography>
                        <Box
                          component="img"
                          src={imagePreviewUrl}
                          alt="Selected species image"
                          sx={{
                            width: 260,
                            maxWidth: '100%',
                            height: 260,
                            objectFit: 'cover',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        />
                      </Box>
                    ) : null}
                    <Button
                      component="label"
                      role={undefined}
                      variant="contained"
                      tabIndex={-1}
                      startIcon={<CloudUploadIcon />}
                    >
                      Upload image
                      <VisuallyHiddenInput {...field}
                        {...register("imageFile")}
                        type="file"
                        onChange={handleChange}
                        accept={fileTypes.join(",")}
                        value={""}
                        multiple={false}
                      />
                    </Button>

                  {errors.imageFile && typeof errors.imageFile.message === 'string' ? (<FormHelperText>{errors.imageFile.message}</FormHelperText>) : null}
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
