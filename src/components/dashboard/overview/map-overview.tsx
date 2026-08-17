'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import type { SxProps } from '@mui/material/styles';
import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import { paths } from '@/paths';
import { useRouter } from 'next/navigation';
import { BaseStatsBlock } from '@/components/dashboard/overview/base-stats-block';


const LeafletMap = dynamic(() => import('./leaflet-map').then((mod) => mod.LeafletMap), {
  ssr: false,
  loading: () => <Box sx={{ height: 220 }} />,
});


export interface MapOverviewProps {
  samplingAreasCoordinates: {id: number; 
                            name: string; 
                            latitude: number; 
                            longitude: number; 
                            number_individuals: number,
                            habitat_name: string }[];
  sx?: SxProps;
  mapHeight?: number;
  totalSamples: number;
  speciesCount: number;
  activeProjects: number;
  lastUpdate: string;
}

export function MapOverview({ samplingAreasCoordinates, sx, mapHeight = 315, totalSamples, speciesCount, activeProjects, lastUpdate }: MapOverviewProps): React.JSX.Element {
  const router = useRouter();

  return (
    <Card sx={sx}>
      <CardHeader
        title="Sampling areas"
        sx={{ px: 2, pb: 0 }}
        slotProps={{
          content: {
            sx: { m: 0 },
          },
          title: {
            variant: 'h5',
            fontWeight: 700,
          },
        }}
      />
      <Typography variant="body2" color="text.secondary" sx={{ px: 2, pb: 0, textAlign: 'left' }}>
        The map below shows the geographic distribution of sampling areas included in this database.
      </Typography>
      <CardContent>
      <Grid container spacing={3} sx={{ width: '100%' }}>
        <Grid item xs={12} md={9}>
            <LeafletMap samplingAreasCoordinates={samplingAreasCoordinates} mapHeight={mapHeight} />
        </Grid>
          <Grid item xs={12} md={3}>
                  <BaseStatsBlock
                    totalSamples={totalSamples}
                    speciesCount={speciesCount}
                    activeProjects={activeProjects}
                    lastUpdate={lastUpdate}
                    sx={{ height: '100%' }}
                  />
                </Grid>
      </Grid>

        
      </CardContent>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button color="inherit" endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />} size="small"
        onClick={() => {
            router.push(paths.dashboard.organisms());
          }}>
          Explore data
        </Button>
      </CardActions>
    </Card>
  );
}

