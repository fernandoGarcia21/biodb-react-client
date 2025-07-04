'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { Desktop as DesktopIcon } from '@phosphor-icons/react/dist/ssr/Desktop';
import { DeviceTablet as DeviceTabletIcon } from '@phosphor-icons/react/dist/ssr/DeviceTablet';
import { Phone as PhoneIcon } from '@phosphor-icons/react/dist/ssr/Phone';
import type { ApexOptions } from 'apexcharts';

import { Chart } from '@/components/core/chart';

const iconMapping = { Desktop: DesktopIcon, Tablet: DeviceTabletIcon, Phone: PhoneIcon } as Record<string, Icon>;

export interface TraitsProps {
  chartSeries: number[];
  labels: string[];
  sx?: SxProps;
}

export function Traits({ chartSeries, labels, sx }: TraitsProps): React.JSX.Element {
  const chartOptions = useChartOptions(labels);

  return (
    <Card sx={sx}>
      <CardHeader title="Data records by trait" />
      <CardContent>
        <Stack spacing={2}>
          <Chart height={300} options={chartOptions} series={chartSeries} type="donut" width="100%" />
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'center' }}>
            {chartSeries.map((item, index) => {
              const label = labels[index];
              const Icon = iconMapping[label];

              return (
                <Stack key={label} spacing={1} sx={{ alignItems: 'center' }}>
                  {Icon ? <Icon fontSize="var(--icon-fontSize-lg)" /> : null}
                  <Typography>{label}</Typography>
                  <Typography color="text.secondary" variant="subtitle2">
                    {item}
                  </Typography>
                </Stack>
              );
            })}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function useChartOptions(labels: string[]): ApexOptions {
  const theme = useTheme();

  // Define a broader set of default colors from your theme or custom colors
  const defaultColors = [
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
    theme.palette.secondary.main,
    theme.palette.text.primary,
    theme.palette.grey[500], // Example: using a grey shade
    '#66DA26', // Custom colors for more variety
    '#E91E63',
    '#FF9800',
    '#00BCD4',
    '#9C27B0',
    '#CDDC39',
    '#795548',
    '#607D8B',
  ];

   // Take as many colors as there are labels, or default to the full list if fewer labels
  const colorsForChart = defaultColors.slice(0, labels.length);

  return {
    chart: { background: 'transparent' },
    colors: colorsForChart.length > 0 ? colorsForChart : defaultColors,
    dataLabels: { enabled: true },
    labels,
    legend: { show: true, position: 'top', horizontalAlign: 'center', fontSize: '14px', markers: { width: 12, height: 12 } },
    plotOptions: { pie: { expandOnClick: true,
      donut: { size: '65%', labels: { show: true, 
                                      name: { show: true, fontSize: '16px', fontWeight: 600 }, 
                                      value: { show: true, fontSize: '14px', fontWeight: 400 } } }
     } },
    states: { active: { filter: { type: 'none' } }, hover: { filter: { type: 'none' } } },
    stroke: { width: 0 },
    theme: { mode: theme.palette.mode },
    tooltip: { fillSeriesColor: false },
  };
}
