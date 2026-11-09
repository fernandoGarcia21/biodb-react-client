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
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import { API } from '@/constants';
import { getHabitatStructuresRequest } from '@/api/habitatCodes';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { AxiosError } from 'axios';

import { getSamplingAreaRequest, updateSamplingAreaRequest } from '@/api/samplingAreas';
import { getLocationsByCountryRequest } from '@/api/locations';
import { getCountriesWithLocationsRequest } from '@/api/countries';
import { HabitatCodeSelector } from './habitat-code-selector';
import { SamplingAreaGuidelines, contactZoneGuidance, descriptionGuidance, photographGuidance } from './sampling-area-guidelines';
import { useBrandTitle } from '@/hooks/use-brand-title';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB.
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

const schema = zod.object({
  name: zod.string().min(1, { message: 'Name is required' }).max(255, { message: 'Name is too long' }),
  description: zod.string().min(1, { message: 'Description of the coordinates is required' }).max(1000, { message: 'Description is too long' }),
  latitude: zod
    .string()
    .trim()
    .min(1, { message: 'Latitude is required' })
    .refine((value) => /^-?\d+(\.\d+)?$/.test(value), {
      message: 'Latitude must be a decimal number (e.g. 58.84128)',
    })
    .refine((value) => Number(value) >= -90 && Number(value) <= 90, {
      message: 'Latitude must be between -90 and 90',
    }),
  longitude: zod
    .string()
    .trim()
    .min(1, { message: 'Longitude is required' })
    .refine((value) => /^-?\d+(\.\d+)?$/.test(value), {
      message: 'Longitude must be a decimal number (e.g. 11.05111)',
    })
    .refine((value) => Number(value) >= -180 && Number(value) <= 180, {
      message: 'Longitude must be between -180 and 180',
    }),
  country_id: zod.string().min(2, { message: 'Country is required' }).max(2),
  location_id: zod.number().min(1, { message: 'Location is required' }),
  habitat_code: zod.string().min(1, { message: 'Habitat code is required' }).max(25),
  is_contact_zone: zod.boolean({message: 'Contact zone status is required'}),
  habitat_structure_id: zod.number().min(1, { message: 'Habitat structure is required' }),
  imageFile: zod.custom<File>((value) => typeof File !== 'undefined' && value instanceof File, {
    message: 'Select an image file.',
  })
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, 'Maximum image size is 5 MB.')
    .refine((file) => !file || (
      /\.(jpg|jpeg|png)$/i.test(file.name) && ['image/jpeg', 'image/png'].includes(file.type)
    ), 'Only .jpg, .jpeg or .png images are supported.')
    .optional(),
});

type Values = zod.infer<typeof schema>;


export function UpdateSamplingAreaForm(): React.JSX.Element {
  const router = useRouter();
  const brandTitle = useBrandTitle();

  const {
    control,
    reset,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitSuccessful },
  } = useForm<Values>({ resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      habitat_code: '',
      habitat_structure_id: 0,
      imageFile: undefined,
      is_contact_zone: false,
      country_id: '0',
      location_id: 0,
      longitude: '',
      latitude: '',
    },
   });


  const imageFile = watch('imageFile');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!imageFile || !['image/jpeg', 'image/png'].includes(imageFile.type)) {
      setImagePreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const [listHabitatStructures, setListHabitatStructures] = useState<{ id: number; name: string; description?: string | null }[]>([]);
  const [existingPhotoName, setExistingPhotoName] = useState('');
  const photoUrl = imagePreviewUrl ?? (existingPhotoName ? `${API}/sampling_area_images/${encodeURIComponent(existingPhotoName)}` : null);
  const [habitatValid, setHabitatValid] = useState(false);
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [listCountries, setListCountries] = useState<{ id: number; name: string }[]>([]);
  const [listLocations, setListLocations] = useState<{ id: number; name: string }[]>([]);
  const params = useParams<{ id: string }>();
  const [samplingAreaId] = useState(params.id);
  const [samplingAreaName, setSamplingAreaName] = useState<string>('');

  const isMounted = useRef(false);
  
  useEffect(() => {
      const fetchSamplingArea = async () => {
        try {
          if (!isMounted.current) {
            isMounted.current = true;
            //fetch sampling area info
            const responseSamplingArea = await getSamplingAreaRequest(samplingAreaId);
            if (responseSamplingArea.data && responseSamplingArea.data.length > 0) {
              reset({ name: responseSamplingArea.data[0].name, 
                      description: responseSamplingArea.data[0].description, 
                      country_id: responseSamplingArea.data[0].country_id,
                      location_id: responseSamplingArea.data[0].location_id,
                      longitude: responseSamplingArea.data[0].longitude,
                      latitude: responseSamplingArea.data[0].latitude,
                      habitat_code: responseSamplingArea.data[0].habitat_code ? responseSamplingArea.data[0].habitat_code : '',
                      habitat_structure_id: Number(responseSamplingArea.data[0].habitat_structure_id ?? 0),
                      imageFile: undefined,
                      is_contact_zone: responseSamplingArea.data[0].is_contact_zone === true || responseSamplingArea.data[0].is_contact_zone === 'true'});
              setExistingPhotoName(responseSamplingArea.data[0].habitat_photo_file_name ?? '');

              setSamplingAreaName(responseSamplingArea.data[0].name);
              document.title = `Update Sampling Area: ${responseSamplingArea.data[0].name} | ${brandTitle}`;
            }

            //Fetch countries info
            const [responseCountries, responseStructures] = await Promise.all([
              getCountriesWithLocationsRequest(),
              getHabitatStructuresRequest(),
            ]);
            setListHabitatStructures(responseStructures.data);
            if (responseCountries.data && responseCountries.data.length > 0) {
              setListCountries(responseCountries.data);
            }

            if(responseSamplingArea.data[0].country_id && responseSamplingArea.data[0].country_id !== '0') {
              console.log('Fetching locations for country:', responseSamplingArea.data[0].country_id);
              setListLocations([]); // Reset locations before fetching new ones
              //Fetch locations info by country
              const responseLocations = await getLocationsByCountryRequest(responseSamplingArea.data[0].country_id);
              if (responseLocations.data && responseLocations.data.length > 0) {
                setListLocations(responseLocations.data);
              }
            }

          }
        } catch (error) {
          console.error('Error fetching sampling area info:', error);
          setError('root', { type: 'server', message: 'Could not load the sampling area options. Please reload the page.' });
        }
      };
  
      fetchSamplingArea();
  
    }, []);

//When the Update button is pressed, the form is submitted and the sampling area is updated
  const onSubmit = React.useCallback(
      async (values: Values): Promise<void> => {
        if (!habitatValid) {
          setError('habitat_code', { type: 'validate', message: 'Complete all habitat descriptors before saving.' });
          return;
        }
        setIsPending(true);
        setSuccessMessage(null);
        try{
          // Convert habitat_id to null if it's 0
          const submitData = {
            ...values
          };
          await updateSamplingAreaRequest(samplingAreaId, submitData);
          if (values.imageFile) {
            setExistingPhotoName(values.imageFile.name);
            setValue('imageFile', undefined);
          }
          setSuccessMessage(`Sampling area ${values.name} updated successfully!`);
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
      [router, setError, setValue, samplingAreaId, habitatValid]
    );

  // Handle country change to fetch locations
  const handleCountryChange = async (event: SelectChangeEvent<number>) => { if (event.target.value) {
    const selectedCountryId = event.target.value as string; 
    console.log('Selected country ID:', selectedCountryId);
    setListLocations([]); // Reset locations before fetching new ones
    setValue('country_id', selectedCountryId); // Update the form value
    setValue('location_id', 0); // Reset location_id when country changes
    try {
      const responseLocations = await getLocationsByCountryRequest(selectedCountryId);
      if (responseLocations.data && responseLocations.data.length > 0) {
        setListLocations(responseLocations.data);
      } else {
        setListLocations([]); // Clear locations if none found
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      setListLocations([]); // Clear locations on error
    }
  }
  };


  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader title={`Update sampling area ${samplingAreaName}`} />
        <Divider />
        <CardContent>
          <SamplingAreaGuidelines />
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
                name="habitat_code"
                render={({ field }) => (
                <HabitatCodeSelector
                  value={field.value ?? ''}
                  onChange={(value) => { setValue('habitat_code', value, { shouldValidate: true, shouldDirty: true }); }}
                  onBlur={field.onBlur}
                  onValidityChange={setHabitatValid}
                  error={errors.habitat_code?.message}
                  disabled={isPending}
                />
                )}
            />
            <Controller
              control={control}
              name="habitat_structure_id"
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.habitat_structure_id)}>
                  <InputLabel id="habitat-structure-label">Habitat structure</InputLabel>
                  <Select
                    {...field}
                    labelId="habitat-structure-label"
                    label="Habitat structure"
                    renderValue={(value) => listHabitatStructures.find((option) => option.id === Number(value))?.name ?? 'Select habitat structure'}
                    disabled={isPending}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                  >
                    <MenuItem value={0}>Select habitat structure</MenuItem>
                    {listHabitatStructures.map((option) => (
                      <MenuItem key={option.id} value={option.id} sx={{ whiteSpace: 'normal' }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{option.name}</Typography>
                          {option.description ? <Typography variant="body2" color="text.secondary">{option.description}</Typography> : null}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {listHabitatStructures.find((option) => option.id === Number(field.value))?.description ??
                      'Select the spatial arrangement of habitats. Each option includes its meaning.'}
                  </FormHelperText>
                  {errors.habitat_structure_id ? <FormHelperText>{errors.habitat_structure_id.message}</FormHelperText> : null}
                </FormControl>
              )}
            />
            <Controller
              control={control}
              name="is_contact_zone"
              render={({ field }) => (
                <FormControl error={Boolean(errors.is_contact_zone)}>
                  <FormControlLabel
                    label={`Contact zone: ${field.value ? 'Yes' : 'No'}`}
                    control={
                      <Switch
                        name={field.name}
                        checked={field.value}
                        onChange={(_, checked) => field.onChange(checked)}
                        onBlur={field.onBlur}
                      />
                    }
                  />
                  <FormHelperText>
                    {errors.is_contact_zone?.message ??
                      contactZoneGuidance}
                  </FormHelperText>
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
                  <FormHelperText>{descriptionGuidance}</FormHelperText>
                  {errors.description ? (<FormHelperText>{errors.description.message}</FormHelperText>) : (
                                    <FormHelperText>
                                        Use the description to specify the surveying method used for the sampling area:
                                        <br />
                                        <strong>1. High-precision instrument-based sampling:</strong> When using GPS or a
                                        total station, record the instrument positioning and backsight reference
                                        orientations. This information applies to the sampling area as a whole rather
                                        than to individual organisms. A total station is a surveying instrument used
                                        to precisely measure angles and distances and determine the relative positions
                                        of sampling points.
                                        <br />
                                        <strong>2. Sampling without high-precision instruments:</strong> Describe the
                                        sampling site, total sampling area, and tidal height on the shore.
                                      </FormHelperText>
                                    )}
                </FormControl>
                )}
            />
            <Controller
                control={control}
                name="country_id"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.country_id)}>
                  <InputLabel>Country</InputLabel>
                    <Select {...field} value={field.value ?? 0} label="Country" variant="outlined" onChange={handleCountryChange}>
                    <MenuItem value={0} >Select Country</MenuItem>
                      {listCountries.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.name}
                        </MenuItem>
                      ))}
                    </Select>
                  {errors.country_id ? <FormHelperText>{errors.country_id.message}</FormHelperText> : null}
                </FormControl>
                )}
            />
            <Controller
                control={control}
                name="location_id"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.location_id)}>
                  <InputLabel>Location</InputLabel>
                    <Select {...field} value={field.value ?? 0}
                    onChange={e => field.onChange(Number(e.target.value))} label="Location" variant="outlined">
                    <MenuItem value={0}>Select Location</MenuItem>
                      {listLocations.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.name}
                        </MenuItem>
                      ))}
                    </Select>
                  {errors.location_id ? <FormHelperText>{errors.location_id.message}</FormHelperText> : null}
                </FormControl>
                )}
            />
            <Controller
                control={control}
                name="latitude"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.latitude)}>
                  <InputLabel>Latitude</InputLabel>
                  <OutlinedInput {...field} label="Latitude" type="text"/>
                  {errors.latitude ? (
                    <FormHelperText>{errors.latitude.message}</FormHelperText>
                  ) : (
                    <FormHelperText>WGS84 (EPSG:4326), decimal degrees. Example: 58.84128</FormHelperText>
                  )}
                </FormControl>
                )}
            />
            <Controller
                control={control}
                name="longitude"
                render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.longitude)}>
                  <InputLabel>Longitude</InputLabel>
                  <OutlinedInput {...field} label="Longitude" type="text"/>
                  {errors.longitude ? (
                    <FormHelperText>{errors.longitude.message}</FormHelperText>
                  ) : (
                    <FormHelperText>WGS84 (EPSG:4326), decimal degrees. Example: 11.05111</FormHelperText>
                  )}
                </FormControl>
                )}
            />
            <Controller
              control={control}
              name="imageFile"
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.imageFile)}>
                  {photoUrl ? (
                    <Box
                      component="img"
                      src={photoUrl}
                      alt="Sampling area photograph"
                      sx={{ width: '100%', height: { xs: 300, sm: 420 }, objectFit: 'contain', borderRadius: 1, mb: 1.5 }}
                    />
                  ) : null}
                  {existingPhotoName && !imageFile ? (
                    <Typography variant="body2" sx={{ mb: 1 }}>Current photograph: {existingPhotoName}</Typography>
                  ) : null}
                  <Button component="label" variant="contained" startIcon={<CloudUploadIcon />} disabled={isPending}>
                    {existingPhotoName ? 'Replace photograph (optional)' : 'Upload image (optional)'}
                    <VisuallyHiddenInput
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      disabled={isPending}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) setValue('imageFile', file, { shouldValidate: true, shouldDirty: true });
                        event.target.value = '';
                      }}
                    />
                  </Button>
                  {imageFile ? (
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 1 }}>
                      <Typography variant="body2">{imageFile.name} ({Math.round(imageFile.size / 1024)} KB)</Typography>
                      <Button
                        size="small"
                        disabled={isPending}
                        onClick={() => setValue('imageFile', undefined, { shouldValidate: true, shouldDirty: true })}
                      >
                        Cancel replacement
                      </Button>
                    </Stack>
                  ) : null}
                  <FormHelperText>{photographGuidance}</FormHelperText>
                  <FormHelperText>{errors.imageFile?.message ?? 'Optional JPG or PNG image, up to 5 MB.'}</FormHelperText>
                </FormControl>
              )}
            />
          </Stack>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
            {isSubmitSuccessful && successMessage ? <Alert color="success">{successMessage}</Alert> : null}
          </Stack>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained" disabled={isPending || !habitatValid}>Update</Button>
        </CardActions>
      </Card>
    </form>
  );
}
