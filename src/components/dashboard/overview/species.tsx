import * as React from 'react';
import { useRouter } from 'next/navigation';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { paths} from '@/paths';
import { API } from '@/constants';

export interface SpeciesProps {
  id: number;
  name: string;
  image_file_name: string;
  sx?: SxProps;
  value: string;
}

export function Species({id, name, sx, value, image_file_name }: SpeciesProps): React.JSX.Element {
  const router = useRouter();

  const handleClick = () => {
    router.push(paths.dashboard.organisms({speciesId: id}));
  };

  return (
    <Card sx={sx}>
      <CardContent>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={1} onClick={handleClick} sx={{ cursor: 'pointer' }}>
              <Typography color="text.primary" variant="overline">
                {name} 
              </Typography>
              <Typography variant="h6">{value}</Typography>
            </Stack>
              <Avatar
                src={`${API}/images/${image_file_name}`}
                variant="rounded"
                onClick={handleClick}
                sx={{ cursor: 'pointer', width: 70, height: 70 }}
              />
          </Stack>
      </CardContent>
    </Card>
  );
}
