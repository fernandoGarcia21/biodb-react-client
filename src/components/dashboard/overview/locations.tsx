'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { alpha, useTheme } from '@mui/material/styles';
import type { SxProps } from '@mui/material/styles';
import { ArrowClockwise as ArrowClockwiseIcon } from '@phosphor-icons/react/dist/ssr/ArrowClockwise';
import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import type { ApexOptions } from 'apexcharts';
import { paths } from '@/paths';
import { useRouter } from 'next/navigation';

import { Chart } from '@/components/core/chart';

export interface LocationsProps {
  chartSeries: { name: string; data: number[] }[];
  customCategories?: string[];
  sx?: SxProps;
}

export function Locations({ chartSeries, customCategories, sx }: LocationsProps): React.JSX.Element {
  const chartOptions = useChartOptions(customCategories);
  const router = useRouter();

  return (
    <Card sx={{ overflowX: 'auto' }}>
    <Card sx={sx}>
      <CardHeader
        title="Samples by location"
      />
        <CardContent>
          <Chart height={350} options={chartOptions} series={chartSeries} type="bar" width="100%" />
        </CardContent>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button color="inherit" endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />} size="small"
        onClick={() => {
            router.push(paths.dashboard.organisms);
          }}>
          Explore data
        </Button>
      </CardActions>
    </Card>
    </Card>
  );
}

function useChartOptions(customCategories: string[] | undefined): ApexOptions {
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

  return {
    chart: { background: 'transparent', stacked: false, toolbar: { show: false } },
    colors: defaultColors,
    dataLabels: { enabled: false },
    fill: { opacity: 1, type: 'solid' },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 2,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    legend: { show: true, position: 'top', horizontalAlign: 'center', fontSize: '14px', markers: { width: 10, height: 10 } },
    plotOptions: { bar: { columnWidth: '20px' } },
    stroke: { colors: ['transparent'], show: true, width: 2 },
    theme: { mode: theme.palette.mode },
    xaxis: {
      axisBorder: { color: theme.palette.divider, show: true },
      axisTicks: { color: theme.palette.divider, show: true },
      categories: customCategories,
      labels: { offsetY: 5, style: { colors: theme.palette.text.secondary } },
    },
    yaxis: {
      labels: {
        formatter: (value) => (value > 0 ? `${value}` : `${value}`),
        offsetX: -10,
        style: { colors: theme.palette.text.secondary },
      },
    },
  };
}
