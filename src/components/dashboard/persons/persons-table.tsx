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
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { Trash as DeleteIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { Pencil as UpdateIcon } from '@phosphor-icons/react/dist/ssr/Pencil';
import { UserPlus as UserIcon } from '@phosphor-icons/react/dist/ssr/UserPlus';

import { useSelection } from '@/hooks/use-selection';
import { paths } from '@/paths';

export interface Person {
  id: string;
  first_name: string;
  family_name: string;
  abbreviation: string;
  email: string;
  additional_info: string;
}

interface PersonTableProps {
  count?: number;
  page?: number;
  rows?: Person[];
  rowsPerPage?: number;
  myRowsPerPageChangeEvent?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  myPageChangeEvent?: (event: unknown, newPage: number) => void; 
  handleClickOpen: (id: number, name: string) => void;
  handleUpdateClick: (id: number) => void;
  handleClickOpenAddUser: (id: number, name: string) => void;
}

export function PersonsTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  myRowsPerPageChangeEvent,
  myPageChangeEvent,
  handleClickOpen,
  handleUpdateClick,
  handleClickOpenAddUser,
}: PersonTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => {
    return rows.map((person) => person.id);
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
              <TableCell>First name</TableCell>
              <TableCell>Family name</TableCell>
              <TableCell>Abbreviation</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Additional information</TableCell>
              <TableCell>User</TableCell>
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
                      <Typography variant="subtitle2">{row.first_name}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{row.family_name}</TableCell>
                  <TableCell>{row.abbreviation}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.additional_info}</TableCell>
                  <TableCell>
                    {row.user_id ? (
                      'Yes'
                    ) : (
                      <IconButton aria-label="add-user"
                      onClick={() => { handleClickOpenAddUser(Number(row.id), `${row.first_name} ${row.family_name}`); }}>
                        <Tooltip title="Add user">
                          <UserIcon />
                        </Tooltip>
                    </IconButton>
                    )}
                  </TableCell>
                  <TableCell>
                  <IconButton aria-label="update"
                      onClick={() => { handleUpdateClick(Number(row.id)); }}>
                        <Tooltip title="Edit">
                          <UpdateIcon />
                        </Tooltip>
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      aria-label="delete"
                      onClick={() => {
                        handleClickOpen(Number(row.id), `${row.first_name} ${row.family_name}`);
                      }}
                    >
                      <Tooltip title="Delete">
                        <DeleteIcon />
                      </Tooltip>
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
