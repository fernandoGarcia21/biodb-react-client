import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import type { SxProps } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import dayjs from 'dayjs';
import { Typography } from '@mui/material';


export interface AboutUs {
 
}

export interface AboutUsProps {
  info?: AboutUs[];
  sx?: SxProps;
}

export function AboutUs({ info = [], sx }: AboutUsProps): React.JSX.Element {
  return (
    <Card sx={sx}>
      <CardHeader title="About us" />
      <Divider />
      <Box sx={{ overflowX: 'auto' }}>
        <Typography variant="body2" sx={{ padding: 2 }}>
          How to cite Littorina DB?
        </Typography>
      </Box>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button
          color="inherit"
          endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />}
          size="small"
          variant="text"
        >
          More
        </Button>
      </CardActions>
    </Card>
  );
}
