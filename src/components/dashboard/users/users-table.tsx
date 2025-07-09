'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { Pencil as UpdateIcon } from '@phosphor-icons/react/dist/ssr/Pencil';
import { Power  as ActivateIcon } from '@phosphor-icons/react/dist/ssr/Power';
import { XCircle  as DeactivateIcon } from '@phosphor-icons/react/dist/ssr/XCircle';

import { useSelection } from '@/hooks/use-selection';
import { USER_STATUS_ACTIVE, USER_STATUS_NEW, USER_STATUS_INACTIVE, USER_LEVEL_ADMIN } from '@/constants';
import { useUser } from '@/hooks/use-user';

export interface User {
  id: string;
  first_name: string;
  family_name: string;
  email: string;
  level: string;
  status: string;
  status_id: number;
}

interface UserTableProps {
  count?: number;
  page?: number;
  rows?: User[];
  rowsPerPage?: number;
  myRowsPerPageChangeEvent?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  myPageChangeEvent?: (event: unknown, newPage: number) => void; 
  handleClickOpen: (id: number, name: string) => void;
  handleUpdateClick: (id: number) => void;
}

export function UsersTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  myRowsPerPageChangeEvent,
  myPageChangeEvent,
  handleClickOpen,
  handleUpdateClick,
}: UserTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => {
    return rows.map((user) => user.id);
  }, [rows]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;
  const { user } = useUser();

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
              <TableCell>First Name</TableCell>
              <TableCell>Family Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Level</TableCell>
              <TableCell>Status</TableCell>
              { (user?.levelId === USER_LEVEL_ADMIN) && ( <>
                <TableCell>Action</TableCell>
                <TableCell>Edit</TableCell>
              </> )}
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
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.level}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  { (user?.levelId === USER_LEVEL_ADMIN) && ( <>
                      <TableCell>
                        <IconButton
                          aria-label="action"
                          onClick={() => {
                            handleClickOpen(Number(row.id), row.email);
                          }}
                        >
                          {row.status_id ===  USER_STATUS_NEW && 
                          <Tooltip title="Activate"><ActivateIcon /></Tooltip>
                          }
                          {row.status_id ===  USER_STATUS_ACTIVE && 
                          <Tooltip title="Inactivate"><DeactivateIcon /></Tooltip> }
                          {row.status_id ===  USER_STATUS_INACTIVE && 
                          <Tooltip title="Activate"><ActivateIcon /></Tooltip> }
                          
                        </IconButton>
                      </TableCell>
                      <TableCell>
                      <IconButton aria-label="update"
                          onClick={() => { handleUpdateClick(Number(row.id)); }}>
                            <Tooltip title="Change level or password">
                              <UpdateIcon />
                            </Tooltip>
                        </IconButton>
                      </TableCell>
                    </> )}
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
