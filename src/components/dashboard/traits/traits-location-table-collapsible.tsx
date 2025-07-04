'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import Box from '@mui/material/Box';

import IconButton from '@mui/material/IconButton';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Trash as DeleteIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { Pencil as UpdateIcon } from '@phosphor-icons/react/dist/ssr/Pencil';
import Collapse from '@mui/material/Collapse';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import { useSelection } from '@/hooks/use-selection';
import { paths } from '@/paths';

export interface Trait {
  id: string;
  name: string;
  description: string;
  num_properties: string;
  trait_type_name: string;
  location_associated: string;
}

interface TraitTableProps {
  count?: number;
  page?: number;
  rows?: Trait[];
  handleClickOpen: (id: number, name: string) => void;
  handleUpdateClick: (id: number) => void;
}


function Row(props): React.JSX.Element {
  const { row, handleClickOpen, handleClickUpdate } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          <Typography variant="h6">
            {row.trait_name}
          </Typography>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.trait_type_name}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Table size="small" aria-label="purchases">
                {/* This is the table of the properties */}
                <TableHead>
                  <TableRow>
                    <TableCell>Property</TableCell>
                    <TableCell>Data type</TableCell>
                    <TableCell >Value</TableCell>
                    <TableCell >Update</TableCell>
                    <TableCell >Delete</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.properties.map((propertyRow: { property_id: number; property_name: string; data_type_name: string; value: string; location_property_id?: number }) => (
                    <TableRow key={`${propertyRow.property_id}-${propertyRow.property_name}`}>
                      <TableCell component="th" scope="row">
                        {propertyRow.property_name}
                      </TableCell>
                      <TableCell>{propertyRow.data_type_name}</TableCell>
                      <TableCell>{propertyRow.value}</TableCell>
                      <TableCell>
                      {propertyRow.location_property_id && 
                          <IconButton aria-label="update"
                            onClick={() => {
                              handleClickUpdate(Number(propertyRow.location_property_id));
                            }}>
                              <Tooltip title="Edit">
                                <UpdateIcon />
                              </Tooltip>
                          </IconButton>
        }
                      </TableCell>
                      <TableCell>
                        {propertyRow.location_property_id && 
                          <IconButton
                            aria-label="delete"
                            onClick={() => {
                              handleClickOpen(Number(propertyRow.location_property_id), propertyRow.property_name);
                            }}
                            >
                            <Tooltip title="Delete">
                              <DeleteIcon />
                            </Tooltip>
                          </IconButton>
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export function TraitsTable({
  rows = [],
  handleClickOpen,
  handleUpdateClick,
}: TraitTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => {
    return rows.map((trait) => trait.id);
  }, [rows]);

  return (
    <Card>
      <CardHeader title={`Traits and properties`} />
      <Divider />
      <CardContent>
        <TableContainer component={Paper}>
          {/* This is the table of the traits */}
          <Table aria-label="collapsible table">
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Trait</TableCell>
                <TableCell>Type</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <Row key={row.id} row={row} handleClickOpen = {handleClickOpen} handleClickUpdate = {handleUpdateClick} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
