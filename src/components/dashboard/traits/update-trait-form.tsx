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
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { config } from '@/config';
import { AxiosError } from 'axios';
import { useBrandTitle } from '@/hooks/use-brand-title';

import { getTraitRequest, updateTraitRequest } from '@/api/traits';
import { getTraitTypesRequest } from '@/api/traitTypes';
import { TRAIT_TYPE_ENVIRONMENT } from '@/constants';

const schema = zod.object({
  name: zod.string().min(1, { message: 'Name is required' }),
  description: zod.string().min(1, { message: 'Description is required' }),
  trait_type_id: zod.number().min(1, { message: 'The type of trait is required' }),
  is_location_associated: zod.boolean({ message: 'Indication whether the trait is associated to locations is required.' }),
});

type Values = zod.infer<typeof schema>;


export function UpdateTraitForm(): React.JSX.Element {
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
      description: '',
      trait_type_id: 0,
      is_location_associated: false,
    },
   });


  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [listTraitTypes, setListTraitTypes] = useState<{ id: number; name: string }[]>([]);
  const params = useParams<{ id: string }>();
  const [traitId, setTraitId] = useState(params.id);
  const brandTitle = useBrandTitle();

  const isMounted = useRef(false);
  
  useEffect(() => {
      const fetchTrait = async () => {
        try {
          if (!isMounted.current) {
            isMounted.current = true;
            //fetch trait info
            const responseTrait = await getTraitRequest(traitId);
            if (responseTrait.data && responseTrait.data.length > 0) {
              reset({ name: responseTrait.data[0].name, 
                      description: responseTrait.data[0].description,
                      trait_type_id: responseTrait.data[0].trait_type_id,
                      is_location_associated: responseTrait.data[0].is_location_associated });
              document.title = `Update Trait: ${responseTrait.data[0].name} | ${brandTitle}`;
            }

            //Fetch traitTypes info
            const responseTraitTypes = await getTraitTypesRequest();
            if (responseTraitTypes.data && responseTraitTypes.data.length > 0) {
              setListTraitTypes(responseTraitTypes.data);
            }
          }
        } catch (error) {
          console.error('Error fetching trait info:', error);
        }
      };
  
      fetchTrait();
  
    }, []);

//When the Update button is pressed, the form is submitted and the trait is updated
  const onSubmit = React.useCallback(
      async (values: Values): Promise<void> => {
        setIsPending(true);
        setSuccessMessage(null);
        try{
          await updateTraitRequest(traitId, values);
          setSuccessMessage(`Trait ${values.name} updated successfully!`);
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

  //Recuperate the trait type id selected from the menu.
    //If the trait type is environment, show the switch to indicate if the trait is location associated
    const traitTypeId = watch('trait_type_id');
  
    //Reset the is_location_associated field when the trait type is changed
    const onChangeTraitType = (event: SelectChangeEvent<number>) => {
      const newValue = Number(event.target.value);
      setValue('trait_type_id', newValue);
      setValue('is_location_associated', false);
      clearErrors('trait_type_id'); // Clear the error for the trait_type_id field
    };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader title='Update trait' />
        <Divider />
        <CardContent>
          <Stack spacing={3} sx={{ maxWidth: 'sm' }}>
          <Controller
                control={control}
                name="trait_type_id"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.trait_type_id)}>
                  <InputLabel>Trait type</InputLabel>
                    <Select {...field} value={field.value ?? 0} label="Trait type" onChange={onChangeTraitType} variant="outlined">
                    <MenuItem value={0}>Select trait type</MenuItem>
                      {listTraitTypes.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.name}
                        </MenuItem>
                      ))}
                    </Select>
                  {errors.trait_type_id ? <FormHelperText>{errors.trait_type_id.message}</FormHelperText> : null}
                </FormControl>
                )}
            />
            {/* traitTypeId === TRAIT_TYPE_ENVIRONMENT && (
              <Controller
                  control={control}
                  name="is_location_associated"
                  render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.is_location_associated)}>
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Is it a location-associated trait?"
                    />
                    {errors.is_location_associated ? <FormHelperText>{errors.is_location_associated.message}</FormHelperText> : undefined}
                  </FormControl>
                  )}
              />
            )
              //This switch is not needed anymore, 
              // because the trait type environment is always individual associated. 
              // The switch was used to indicate if the trait was location associated or not, 
              // but now it is always individual associated. 
              // The switch is kept in the code for future use, in case we want to allow 
              // the user to create a trait type that is not individual associated.
              // In the DB there is a table called location_property, similarly to organism_property.
              */}
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
                name="description"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.description)}>
                  <InputLabel>Description</InputLabel>
                  <OutlinedInput {...field} label="Description" type="text" multiline={true} minRows={4}/>
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
          <Button type="submit" variant="contained" disabled={isPending}>Update</Button>
        </CardActions>
      </Card>
    </form>
  );
}
