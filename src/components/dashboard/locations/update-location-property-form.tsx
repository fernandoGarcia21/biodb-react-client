'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { updateLocationPropertyRequest, getLocationProperty } from '@/api/locationProperties';
import { getPropertyRequest } from '@/api/properties';
import { DATA_TYPE_INTEGER, DATA_TYPE_DECIMAL, DATA_TYPE_DATE, DATA_TYPE_TEXT } from '@/constants';

const baseSchema = zod.object({
  value: zod.string().min(1, { message: 'The value of the property is required' }),
});

type Values = zod.infer<typeof baseSchema>;

export function UpdateLocationPropertyForm(): React.JSX.Element {
  const router = useRouter();
  const params = useParams<{ id: int }>();
  const pLocationPropertyId = params.id; //Obtain the trait id from the URL
  const [locationProperty, setLocationProperty] = useState();
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [successMessage, setSuccessMessage] = React.useState(null);
  const [schema, setSchema] = useState(baseSchema);

  const {
      control,
      reset,
      handleSubmit,
      setError,
      setValue,
      formState,
      formState: { errors, isSubmitSuccessful },
    } = useForm<Values>({ resolver: zodResolver(schema),
      defaultValues: {
        value: '',
      },
     });

    const isMounted = useRef(false);
       
    useEffect(() => {
        const fetchLocationProperty = async () => {
          try {
            if (!isMounted.current) {
              isMounted.current = true;
              //fetch location property info
              const responseLocationProperty = await getLocationProperty(pLocationPropertyId);
              if (responseLocationProperty.data && responseLocationProperty.data.length > 0) {
                setLocationProperty(responseLocationProperty.data[0]);
                setValue('value', responseLocationProperty.data[0].value);

                //fetch property info and set the schema validation
                const tmpProperty = await getPropertyRequest(responseLocationProperty.data[0].property_id);
                if(tmpProperty.data && tmpProperty.data.length > 0){
                  const tmpDataType = tmpProperty.data[0].data_type_id;
    
                  //Dunamically set the validation schema for the value field based on the property data type
                  switch (tmpDataType) {
                    case DATA_TYPE_INTEGER:
                      setSchema(baseSchema.extend({
                        value: zod.number().min(1, { message: 'The value must be a number' }),
                      }));
                      break;
                      case DATA_TYPE_DECIMAL:
                        setSchema(baseSchema.extend({
                          value: zod.string().refine((val) => {
                            const regex = /^\d+(\.\d+)?$/;
                            return regex.test(val);
                          }, {
                            message: 'The value must be a decimal number',
                          }),
                        }));
                        break;
                    case DATA_TYPE_DATE:
                      setSchema(baseSchema.extend({
                        value: zod.string().refine((val) => {
                          const regex = /^\d{2}\/\d{2}\/\d{4}$/;
                          return regex.test(val);
                        }, {
                          message: 'The value must be a date in the format DD/MM/YYYY',
                        }),
                      }));
                      break;
                    default:
                      setSchema(baseSchema.extend({
                        value: zod.string().min(1, { message: 'The value of the property is required' }),
                      }));
                  }
                }

              }
            }
          } catch (error) {
            console.error('Error fetching location info:', error);
          }
        };
    
        fetchLocationProperty();
    
      }, []);

  const onSubmit = React.useCallback(
      async (values: Values): Promise<void> => {
        setIsPending(true);
        setSuccessMessage(null);
        try{
          const requestData = { ...values }; // Add location id to the property value object
          await updateLocationPropertyRequest(pLocationPropertyId, requestData);
          setSuccessMessage(`Property value was successfully updated!`);
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
        <CardHeader title={`Location: ${locationProperty?.location_name}`} />
        <Divider />
        <CardContent>
          <Stack spacing={3} sx={{ maxWidth: 'sm' }}>
            {/* Display Trait name (not editable) */}
            <div>
              <Typography variant="h6" component="span">
                  Trait:
              </Typography>
              <span> {locationProperty?.trait_name} </span>
              </div>
              {/* Display Property name (not editable) */}
              <div>
              <Typography variant="h6" component="span">
                  Property:
              </Typography>
              <span> {locationProperty?.property_name} </span>
            </div>
            <Controller
                control={control}
                name="value"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.value)}>
                  <InputLabel>Property value</InputLabel>
                  <OutlinedInput {...field} label="Property value" type="text"/>
                  {errors.value ? <FormHelperText>{errors.value.message}</FormHelperText> : null}
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
