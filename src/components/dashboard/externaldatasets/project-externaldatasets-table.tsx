'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import Box from '@mui/material/Box';

import IconButton from '@mui/material/IconButton';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { Trash as DeleteIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { Pencil as UpdateIcon } from '@phosphor-icons/react/dist/ssr/Pencil';

import { useSelection } from '@/hooks/use-selection';
import { paths } from '@/paths';

export interface ExternalDataset {
  id: string;
  external_dataset_id: string;
  dataset_name: string;
  url: string;
  type_dataset_name: string;
}

interface ExternalDatasetTableProps {
  count?: number;
  page?: number;
  rows?: ExternalDataset[];
  rowsPerPage?: number;
  myRowsPerPageChangeEvent?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  myPageChangeEvent?: (event: unknown, newPage: number) => void; 
  handleClickOpen: (id: number, name: string) => void;
}

export function ExternalDatasetsTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  myRowsPerPageChangeEvent,
  myPageChangeEvent,
  handleClickOpen,
}: ExternalDatasetTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => {
    return rows.map((externalDataset) => externalDataset.id);
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
              <TableCell>Id</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type dataset</TableCell>
              <TableCell>URL</TableCell>
              {handleClickOpen && (
                <TableCell>Delete</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const isSelected = selected?.has(row.id);

              return (
                <TableRow hover key={row.id} selected={isSelected}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>
                    <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                      <Typography variant="subtitle2">{row.dataset_name}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{row.type_dataset_name}</TableCell>
                  <TableCell>{row.url}</TableCell>
                  {handleClickOpen && (
                    <TableCell>
                        <IconButton
                        aria-label="delete"
                        onClick={() => {
                          handleClickOpen(Number(row.id), row.dataset_name);
                        }}
                      >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    )}
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
