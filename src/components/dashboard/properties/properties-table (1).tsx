'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import Box from '@mui/material/Box';

import IconButton from '@mui/material/IconButton';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { Trash as DeleteIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { Pencil as UpdateIcon } from '@phosphor-icons/react/dist/ssr/Pencil';
import { BookOpenText as ProtocolIcon } from '@phosphor-icons/react/dist/ssr/BookOpenText';

import { paths } from '@/paths';
import { useSelection } from '@/hooks/use-selection';

export interface Property {
  id: string;
  name: string;
  description: string;
  trait_name: string;
  data_type_name: string;
  template_column_name: string;
  pre_defined_values: string;
}

interface PropertyTableProps {
  count?: number;
  page?: number;
  rows?: Trait[];
  rowsPerPage?: number;
  showTraitName?: boolean;
  myRowsPerPageChangeEvent?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  myPageChangeEvent?: (event: unknown, newPage: number) => void; 
  handleDeleteClickOpen: (id: number, name: string) => void;
  handleUpdateClick: (id: number) => void;
  handleProtocolClickOpen: (id: number) => void;
}

export function PropertiesTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  showTraitName = false,
  myRowsPerPageChangeEvent,
  myPageChangeEvent,
  handleDeleteClickOpen,
  handleUpdateClick,
  handleProtocolClickOpen,
}: PropertyTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => {
    return rows.map((trait) => trait.id);
  }, [rows]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedAll}
                  indeterminate={selectedSome}
                  onChange={(event) => {
                    if (event.target.checked) {
                      selectAll();
                    } else {
                      deselectAll();
                    }
                  }}
                />
              </TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Data type</TableCell>
              <TableCell>Template column</TableCell>
              <TableCell>Pre-defined values</TableCell>
              {showTraitName && <TableCell>Trait</TableCell>}
              <TableCell>Protocol</TableCell>
              <TableCell>Update</TableCell>
              <TableCell>Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const isSelected = selected?.has(row.id);

              return (
                <TableRow hover key={row.id} selected={isSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={(event) => {
                        if (event.target.checked) {
                          selectOne(row.id);
                        } else {
                          deselectOne(row.id);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                      <Typography variant="subtitle2">{row.name}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell>{row.data_type_name}</TableCell>
                  <TableCell>{row.template_column_name}</TableCell>
                  <TableCell>{row.pre_defined_values}</TableCell>
                  {showTraitName && <TableCell>
                      <Link component={RouterLink} href={paths.dashboard.traitProperties(row.trait_id)} underline="hover" variant="subtitle2">
                          {row.trait_name}
                      </Link>
                    </TableCell>}
                  <TableCell>
                    <IconButton
                      aria-label="protocol"
                      onClick={() => {
                        handleProtocolClickOpen(Number(row.id));
                      }}
                    >
                      <ProtocolIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <IconButton aria-label="update"
                      onClick={() => { handleUpdateClick(Number(row.id)); }}>
                      <UpdateIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      aria-label="delete"
                      onClick={() => {
                        handleDeleteClickOpen(Number(row.id), row.name);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <TablePagination
        component="div"
        count={count}
        onPageChange={myPageChangeEvent}
        onRowsPerPageChange={myRowsPerPageChangeEvent}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
}
