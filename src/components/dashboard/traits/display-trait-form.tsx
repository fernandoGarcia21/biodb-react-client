'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'next/navigation'
import {useEffect, useState, useRef} from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { config } from '@/config';
import { Typography } from '@mui/material';
import { useBrandTitle } from '@/hooks/use-brand-title';

import { getTraitRequest } from '@/api/traits';

const schema = zod.object({
  name: zod.string(),
  description: zod.string(),
  trait_type_id: zod.number(),
  trait_type_name: zod.string(),
  is_location_associated: zod.boolean({ message: 'Indication whether the trait is associated to locations is required.' }),
});

type Values = zod.infer<typeof schema>;


export function DisplayTraitForm(): React.JSX.Element {
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
      trait_type_name: '',
      is_location_associated: false,
    },
   });


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
                      trait_type_name: responseTrait.data[0].trait_type_name,
                      is_location_associated: responseTrait.data[0].is_location_associated });
              document.title = `Display Trait: ${responseTrait.data[0].name} | ${brandTitle}`;
            }
          }
        } catch (error) {
          console.error('Error fetching trait info:', error);
        }
      };
  
      fetchTrait();
  
    }, []);


  return (
      <Card>
        <Divider />
        <CardContent>
          <Stack spacing={1} sx={{ maxWidth: 'sm' }}>

          <Typography variant="subtitle1" sx={{ mt: 1 }}>Name</Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line', bgcolor: 'grey.100', p: 1 }}>{watch('name')}</Typography>

          <Typography variant="subtitle1" sx={{ mt: 1 }}>Trait type</Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line', bgcolor: 'grey.100', p: 1 }}>{watch('trait_type_name')}</Typography>

          <Typography variant="subtitle1" sx={{ mt: 1 }}>Description</Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line', bgcolor: 'grey.100', p: 1 }}>{watch('description')}</Typography>

          </Stack>
        </CardContent>
        <Divider />
      </Card>
  );
}
