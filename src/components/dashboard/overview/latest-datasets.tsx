import React from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar'; // Import Avatar
import type { SxProps } from '@mui/material/styles';
import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import { DotsThreeVertical as DotsThreeVerticalIcon } from '@phosphor-icons/react/dist/ssr/DotsThreeVertical';
import dayjs from 'dayjs';
import { paths } from '@/paths';

export interface Dataset {
  id: string;
  name: string;
  updatedAt: string;
  type: string;
  link_path: string;
}

export interface LatestDatasetsProps {
  datasets?: Dataset[];
  sx?: SxProps;
}

export function LatestDatasets({ datasets = [], sx }: LatestDatasetsProps): React.JSX.Element {
  const router = useRouter();

  const handleDatasetClick = () => {
    router.push(paths.dashboard.organisms());
  };

  return (
    <Card sx={sx}>
      <CardHeader title="Latest datasets" />
      <Divider />
      <List>
        {datasets.map((dataset, index) => (
          <ListItem divider={index < datasets.length - 1} key={dataset.id}>
            <ListItemAvatar>
                <Avatar
                    sx={{
                      borderRadius: 1, // Keep the square corners if desired
                      height: '48px',
                      width: '48px',
                      // Optional: Custom background color for the avatar based on type
                      backgroundColor: dataset.type === 'External'
                        ? 'var(--mui-palette-info-main)' // Example: blue for External
                        : dataset.type === 'Internal'
                        ? 'var(--mui-palette-success-main)' // Example: green for Internal
                        : 'var(--mui-palette-neutral-200)', // Default fallback color
                      color: 'var(--mui-palette-common-white)', // Text color for the letter
                      fontSize: '1.25rem', // Adjust font size for the letter
                      fontWeight: 'bold',
                    }}
                  >
                    {dataset.type === 'External' ? 'E' : (dataset.type === 'Internal' ? 'I' : '?')}
                    {/* The '?' is a fallback if dataset.type is neither 'External' nor 'Internal' */}
                  </Avatar>

            </ListItemAvatar>
            <ListItemText
              primary={dataset.name}
              primaryTypographyProps={{ variant: 'subtitle1', sx: { cursor: 'pointer' } }}
              secondary={`Uploaded ${dayjs(dataset.updatedAt).format('MMM D, YYYY')}`}
              secondaryTypographyProps={{ variant: 'body2' }}
              onClick={handleDatasetClick}
              sx={{ cursor: 'pointer' }}
            />
            <IconButton edge="end">
              <DotsThreeVerticalIcon weight="bold" />
            </IconButton>
          </ListItem>
        ))}
      </List>
      <Divider />
    </Card>
  );
}
