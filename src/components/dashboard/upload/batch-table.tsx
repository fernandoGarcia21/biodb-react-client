'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { useSelection } from '@/hooks/use-selection';

export interface Batch {
  id: string;
  file_name: string;
  internal_file_name: string;
  parameters: string;
  batch_type: string;
  uploaded_by: string;
  status_id: string;
  status: string;
  date_submitted: string;
  date_started: string;
  date_completed: string;
  logs: string;
}

interface BatchTableProps {
  count?: number;
  page?: number;
  rows?: Batch[];
  rowsPerPage?: number;
  myRowsPerPageChangeEvent?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  myPageChangeEvent?: (event: unknown, newPage: number) => void; 
}

const statusMap = {
  1: { color: 'primary' },
  2: { color: 'warning' },
  3: { color: 'success' },
  4: { color: 'gray' },
  5: { color: 'error' },
} as const;

export function BatchTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  myRowsPerPageChangeEvent,
  myPageChangeEvent,
}: BatchTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => {
    return rows.map((batch) => batch.id);
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

              <TableCell>Type</TableCell>
              <TableCell>Uploaded by</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Submitted File</TableCell>
              <TableCell>Date Submitted</TableCell>
              <TableCell>Date Started</TableCell>
              <TableCell>Date Completed</TableCell>
              <TableCell>Parameters</TableCell>
              <TableCell>Log</TableCell>
              <TableCell>Internal File Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const isSelected = selected?.has(row.id);

              const { color } = statusMap[row.status_id] ?? { color: 'default' };

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
                      <Typography variant="subtitle2">{row.batch_type}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{row.uploaded_by}</TableCell>
                  <TableCell>
                  <Chip color={color} label={row.status} size="small" />
                  </TableCell>
                  <TableCell>{row.file_name}</TableCell>
                  <TableCell>{row.date_submitted}</TableCell>
                  <TableCell>{row.date_started}</TableCell>
                  <TableCell>{row.date_completed}</TableCell>
                  <TableCell>{row.parameters}</TableCell>
                  <TableCell>{row.logs}</TableCell>
                  <TableCell>{row.internal_file_name}</TableCell>
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
