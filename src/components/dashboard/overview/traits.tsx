'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { Desktop as DesktopIcon } from '@phosphor-icons/react/dist/ssr/Desktop';
import { DeviceTablet as DeviceTabletIcon } from '@phosphor-icons/react/dist/ssr/DeviceTablet';
import { Phone as PhoneIcon } from '@phosphor-icons/react/dist/ssr/Phone';
import type { ApexOptions } from 'apexcharts';

import { Chart } from '@/components/core/chart';

import { paths } from '@/paths';
import { useRouter } from 'next/navigation';

const iconMapping = { Desktop: DesktopIcon, Tablet: DeviceTabletIcon, Phone: PhoneIcon } as Record<string, Icon>;

export interface TraitsProps {
  chartSeries: number[];
  labels: string[];
  sx?: SxProps;
}

export function Traits({ chartSeries, labels, sx }: TraitsProps): React.JSX.Element {
  const theme = useTheme();
  const chartColors = getChartColors(theme, labels.length);
  const chartOptions = useChartOptions(labels, chartColors);
  const router = useRouter();

  return (
    <Card sx={sx}>
      <CardHeader title="Data records by trait" />
      <CardContent>
        <Stack spacing={2}>
          <Chart height={300} options={chartOptions} series={chartSeries} type="donut" width="100%" />
          <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ backgroundColor: 'grey.400', fontSize: '1rem', fontWeight: 700, color: 'common.white' }}
                  >
                    Trait
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ backgroundColor: 'grey.400', fontSize: '1rem', fontWeight: 700, color: 'common.white' }}
                  >
                    Records
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {chartSeries.map((item, index) => {
                  const label = labels[index];
                  const Icon = iconMapping[label];
                  const rowColor = chartColors[index % chartColors.length] ?? theme.palette.grey[500];

                  return (
                    <TableRow key={label} sx={{ backgroundColor: alpha(rowColor, 0.12) }}>
                      <TableCell sx={{ borderLeft: `4px solid ${rowColor}` }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          {Icon ? <Icon fontSize="var(--icon-fontSize-md)" /> : null}
                          <Typography variant="body2">{label}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Typography color="text.secondary" variant="body2">
                          {item}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
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

function getChartColors(theme: Theme, labelsCount: number): string[] {
  const defaultColors = [
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
    '#6cbb42c6', // Custom colors for more variety
    '#E91E63',
    '#FF9800',
    '#00BCD4',
    '#9C27B0',
    '#CDDC39',
    '#795548',
    '#607D8B',
    '#98bc17',
    '#9d21b0',
    theme.palette.secondary.main,
    theme.palette.text.primary,
    theme.palette.grey[500], // Example: using a grey shade
  ];

  return defaultColors.slice(0, labelsCount);
}

function useChartOptions(labels: string[], chartColors: string[]): ApexOptions {
  const theme = useTheme();

  return {
    chart: { background: 'transparent' },
    colors: chartColors.length > 0 ? chartColors : [theme.palette.primary.main],
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
    tooltip: { fillSeriesColor: true },
  };
}
