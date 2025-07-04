'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {useEffect, useRef, useState} from 'react';
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
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';

import { createBatchRequest } from '@/api/batch';
import { getPropertiesTraitRequest } from '@/api/properties';
import { BATCH_TYPE_DELETE_ORANISMS_ID } from '@/constants';


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
    fileBatch: zod.any().refine((file: File) => file?.length !== 0, {
      message: "An input file is required"
    }).refine((file) => file.size < MAX_FILE_SIZE, `Max size is ${(MAX_FILE_SIZE / (1024)).toFixed(0)} KB.`)
      .refine((file) => checkFileType(file), "Only .csv format is supported."),
    is_delete_organisms: zod.boolean({ message: 'Indication of what information to be deleted is required.' }),
      list_delete_properties: zod.array(zod.any(), { message: 'List of properties to be deleted must be an array.' }).optional()
    })
    .refine(data => data.is_delete_organisms || (data.list_delete_properties && data.list_delete_properties.length > 0), {
      message: 'List of properties to be deleted is required when not deleting organisms completely.',
      path: ['list_delete_properties']
  });

type Values = zod.infer<typeof schema>;

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const GroupHeader = styled('div')(({ theme }) => ({
  position: 'sticky',
  top: '-8px',
  padding: '4px 10px',
  color: theme.palette.primary.main,
  backgroundColor: lighten(theme.palette.primary.light, 0.85),
  ...theme.applyStyles('dark', {
    backgroundColor: darken(theme.palette.primary.main, 0.8),
  }),
}));

const GroupItems = styled('ul')({
  padding: 0,
});


export function BatchDeleteOrganismsForm(): React.JSX.Element {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [fileTypes, setFileTypes] = React.useState([".CSV"]);
  const [successMessage, setSuccessMessage] = React.useState(null);
  const [uploadFileName , setUploadFileName] = React.useState(null);
  const [uploadFileSize , setUploadFileSize] = React.useState(0);
  const { user } = useUser();
  const [listProperties, setListProperties] = useState([]);
  const isMounted = useRef(false);
  const [defaultValue, setDefaultValue] = useState([]);

  const {
      control,
      reset,
      watch,
      setValue,
      register,
      handleSubmit,
      clearErrors,
      setError,
      formState,
      formState: { errors, isSubmitSuccessful },
    } = useForm<Values>({ resolver: zodResolver(schema),
      defaultValues: {
        fileBatch: undefined,
        is_delete_organisms: false,
        list_delete_properties: [],
      },
     });


  useEffect(() => {
        const fetchProperties = async () => {
          try {
            if (!isMounted.current) {
              isMounted.current = true;
              //Fetch properties info
              const responseProperties = await getPropertiesTraitRequest();
              if (responseProperties.data && responseProperties.data.length > 0) {
                setListProperties(responseProperties.data);
                setDefaultValue(responseProperties.data[0]);
                console.log(responseProperties.data)
              }
  
            }
          } catch (error) {
            console.error('Error fetching properties info:', error);
          }
        };
    
        void fetchProperties();
    
      }, []);

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
            batch_type_id: BATCH_TYPE_DELETE_ORANISMS_ID, 
            person_id: user.personId, 
            parameters: JSON.stringify({ 'is_delete_organism': values.is_delete_organisms,
                                          'list_delete_properties': values.list_delete_properties
             }) }; 
            
          await createBatchRequest(requestData);

          reset({ fileBatch: undefined,
                  is_delete_organisms: false,
                  list_delete_properties: [],
           });
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
        setValue('fileBatch', file );
        setUploadFileName(file.name);
        setUploadFileSize(bytesToKB(file.size));
        clearErrors('fileBatch'); // Clear the error for the fileBatch field
      }
    };


    const handlePropertiesChange = (_, value) => {
      setValue('list_delete_properties', value.map((v) => v.id));
      clearErrors('list_delete_properties'); // Clear the error for the list_delete_properties field
    };

    const bytesToKB = (bytes) => {
      return (bytes / (1024)).toFixed(0);
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

    const optionsProperties = listProperties.map((option) => {
      const trait = option.trait_name;
      return {
        groupProperty: trait,
        ...option,
      };
    });

  const selectedProperties = watch('list_delete_properties');

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader title={`Upload a CSV file with the list of individual IDs to delete`} />
        <Divider />
        <CardContent>
          <Stack spacing={1} sx={{ textAlign: 'left' }}>
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
              {uploadFileSize} bytes
            </Typography>
            <Controller
                control={control}
                name="is_delete_organisms"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.is_delete_organisms)}>
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Delete the organisms completely?"
                  />
                  {errors.is_delete_organisms ? <FormHelperText>{errors.is_delete_organisms.message}</FormHelperText> : undefined}
                </FormControl>
                )}
            />
            <Controller
              control={control}
              name="list_delete_properties"
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.list_delete_properties)}>
                  <Autocomplete 
                     {...field}
                    multiple
                    onChange={handlePropertiesChange}
                    options={optionsProperties}
                    value={optionsProperties.filter(option => selectedProperties.includes(option.id))}
                    groupBy={(option) => option.groupProperty}
                    disableCloseOnSelect
                    getOptionLabel={(option) => option.name}
                    renderOption={(props, option, { selected }) => {
                      const { key, ...optionProps } = props;
                      return (
                        <li key={key} {...optionProps}>
                          <Checkbox
                            icon={icon}
                            checkedIcon={checkedIcon}
                            style={{ marginRight: 8 }}
                            checked={selected}
                          />
                          {option.name}
                        </li>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Organism properties you want to delete" placeholder="Select one or more" />
                    )}
                  />
                  {errors.list_delete_properties ? <FormHelperText>{errors.list_delete_properties.message}</FormHelperText> : null}
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
