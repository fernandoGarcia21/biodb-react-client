'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Trash as DeleteIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { Pencil as UpdateIcon } from '@phosphor-icons/react/dist/ssr/Pencil';
import { API } from '@/constants';
import { USER_LEVEL_ADMIN } from '@/constants';
import { useUser } from '@/hooks/use-user';

import { useSelection } from '@/hooks/use-selection';

export interface Species {
  id: string;
  name: string;
  description: string;
  internal_code: string;
  image_file_name: string;
}

interface SpeciesTableProps {
  count?: number;
  page?: number;
  rows?: Species[];
  rowsPerPage?: number;
  myRowsPerPageChangeEvent?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  myPageChangeEvent?: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void; 
  handleDeleteClickOpen: (id: number, name: string) => void;
  handleUpdateClick: (id: number) => void;
}

export function SpeciesTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  myRowsPerPageChangeEvent,
  myPageChangeEvent,
  handleDeleteClickOpen,
  handleUpdateClick,
}: SpeciesTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => {
    return rows.map((species) => species.id);
  }, [rows]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const { user } = useUser();
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
              <TableCell>Internal Code</TableCell>
              <TableCell>Thumbnail</TableCell>
              {(user?.levelId === USER_LEVEL_ADMIN) && (<>
                  <TableCell>Update</TableCell>
                  <TableCell>Delete</TableCell>
                </>)}
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
                  <TableCell>{row.internal_code}</TableCell>
                  <TableCell>
                    <Avatar
                      src={`${API}/images/${row.image_file_name}`}
                      variant="rounded"
                      sx={{ width: 50, height: 50 }}
                    />
                  </TableCell>
                  {(user?.levelId === USER_LEVEL_ADMIN) && (<>
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
                          handleDeleteClickOpen(Number(row.id), row.name);
                        }}
                      >
                        <Tooltip title="Delete">
                          <DeleteIcon />
                        </Tooltip>
                      </IconButton>
                    </TableCell>
                  </>)}
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
        onPageChange={myPageChangeEvent ?? (() => {})}
        onRowsPerPageChange={myRowsPerPageChangeEvent}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
}
