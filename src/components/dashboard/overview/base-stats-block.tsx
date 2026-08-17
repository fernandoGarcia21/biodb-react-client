import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Cat as TotalSamplesIcon } from '@phosphor-icons/react/dist/ssr/Cat';
import { FediverseLogo as SpeciesCountIcon } from '@phosphor-icons/react/dist/ssr/FediverseLogo';
import { CalendarCheck as ActiveProjectsIcon } from '@phosphor-icons/react/dist/ssr/CalendarCheck';
import { Clock as LastUpdateIcon } from '@phosphor-icons/react/dist/ssr/Clock';

export interface BaseStatsBlockProps {
  totalSamples: string | number;
  speciesCount: string | number;
  activeProjects: string | number;
  lastUpdate: string;
  sx?: SxProps;
}

export function BaseStatsBlock({
  totalSamples,
  speciesCount,
  activeProjects,
  lastUpdate,
  sx,
}: BaseStatsBlockProps): React.JSX.Element {
  const stats = [
    {
      label: 'Total samples',
      value: totalSamples,
      icon: <TotalSamplesIcon size={15} weight="duotone" />,
    },
    {
      label: 'Species count',
      value: speciesCount,
      icon: <SpeciesCountIcon size={15} weight="duotone" />,
    },
    {
      label: 'Active projects',
      value: activeProjects,
      icon: <ActiveProjectsIcon size={15} weight="duotone" />,
    },
    {
      label: 'Last update',
      value: lastUpdate,
      icon: <LastUpdateIcon size={15} weight="duotone" />,
    },
  ];

  return (
        <Stack spacing={1.5}>
          {stats.map((stat) => (
            <Box
              key={stat.label}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                px: 1.5,
                py: 1.25,
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Avatar
                  variant="rounded"
                  sx={{ bgcolor: 'var(--mui-palette-primary-main)', width: 36, height: 36, borderRadius: 1 }}
                >
                  {stat.icon}
                </Avatar>
                <Stack spacing={0.25}>
                  <Typography color="text.secondary" variant="subtitle2" sx={{letterSpacing: 0.5 }}>
                    {stat.label}
                  </Typography>
                  <Typography variant="h6">{stat.value}</Typography>
                </Stack>
              </Stack>
            </Box>
          ))}
        </Stack>
  );
}
