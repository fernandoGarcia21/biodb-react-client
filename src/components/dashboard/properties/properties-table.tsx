'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { Info as InfoIcon } from '@phosphor-icons/react/dist/ssr/Info';
import { Trash as DeleteIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { Pencil as UpdateIcon } from '@phosphor-icons/react/dist/ssr/Pencil';
import { BookOpenText as ProtocolIcon } from '@phosphor-icons/react/dist/ssr/BookOpenText';

import { paths } from '@/paths';
import { useSelection } from '@/hooks/use-selection';
import { USER_LEVEL_ADMIN, USER_LEVEL_LEADER } from '@/constants';
import { useUser } from '@/hooks/use-user';

export interface Property {
  id: string;
  name: string;
  description: string;
  trait_id: string;
  trait_name: string;
  data_type_name: string;
  template_column_name: string;
  pre_defined_values: string;
  req_project_must_read: boolean;
}

interface PropertyTableProps {
  count?: number;
  page?: number;
  rows?: Property[];
  rowsPerPage?: number;
  showTraitName?: boolean;
  propertyIds?: number[];
  setPropertyIds?: React.Dispatch<React.SetStateAction<number[]>>;
  myRowsPerPageChangeEvent?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  myPageChangeEvent?: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void; 
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
  propertyIds = [],
  setPropertyIds,
  myRowsPerPageChangeEvent,
  myPageChangeEvent,
  handleDeleteClickOpen,
  handleUpdateClick,
  handleProtocolClickOpen,
}: PropertyTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => {
    return rows.map((trait) => trait.id);
  }, [rows]);
  const topScrollRef = React.useRef<HTMLDivElement | null>(null);
  const tableScrollRef = React.useRef<HTMLDivElement | null>(null);
  const [topScrollbarWidth, setTopScrollbarWidth] = React.useState(0);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const rowIdsAsNumbers = React.useMemo(() => {
    return rows
      .map((row) => Number(row.id))
      .filter((id) => Number.isInteger(id));
  }, [rows]);

  const selectedSome = setPropertyIds
    ? rowIdsAsNumbers.some((id) => propertyIds.includes(id)) && !rowIdsAsNumbers.every((id) => propertyIds.includes(id))
    : (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = setPropertyIds
    ? rowIdsAsNumbers.length > 0 && rowIdsAsNumbers.every((id) => propertyIds.includes(id))
    : rows.length > 0 && selected?.size === rows.length;
  const { user } = useUser();
  const router = useRouter();
  const preDefinedValuesCellSx = {
    whiteSpace: 'normal',
    overflowWrap: 'break-word',
    wordBreak: 'normal',
  } as const;
  const getPreDefinedValues = (value: string): string[] => {
    return value
      .split('/')
      .map((item) => item.trim())
      .filter(Boolean);
  };

  React.useEffect(() => {
    const topScroll = topScrollRef.current;
    const tableScroll = tableScrollRef.current;

    if (!topScroll || !tableScroll) {
      return;
    }

    const syncFromTop = () => {
      tableScroll.scrollLeft = topScroll.scrollLeft;
    };

    const syncFromTable = () => {
      topScroll.scrollLeft = tableScroll.scrollLeft;
    };

    const updateScrollbarWidth = () => {
      const tableEl = tableScroll.querySelector('table');
      setTopScrollbarWidth(tableEl ? tableEl.scrollWidth : tableScroll.scrollWidth);
    };

    topScroll.addEventListener('scroll', syncFromTop);
    tableScroll.addEventListener('scroll', syncFromTable);

    const resizeObserver = new ResizeObserver(() => {
      updateScrollbarWidth();
    });

    const tableEl = tableScroll.querySelector('table');
    resizeObserver.observe(tableScroll);
    if (tableEl) {
      resizeObserver.observe(tableEl);
    }

    window.addEventListener('resize', updateScrollbarWidth);
    updateScrollbarWidth();

    return () => {
      topScroll.removeEventListener('scroll', syncFromTop);
      tableScroll.removeEventListener('scroll', syncFromTable);
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateScrollbarWidth);
    };
  }, [rows.length, rowsPerPage]);

  return (
    <Card>
      <Box
        ref={topScrollRef}
        sx={{
          overflowX: 'scroll',
          overflowY: 'hidden',
          height: 16,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            height: 12,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0, 0, 0, 0.08)',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0, 0, 0, 0.35)',
            borderRadius: 8,
          },
        }}
      >
        <Box sx={{ width: topScrollbarWidth || '100%', height: 1 }} />
      </Box>
      <Box ref={tableScrollRef} sx={{ overflowX: 'auto' }}>
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
                      if (setPropertyIds) {
                        setPropertyIds((prev) => [...new Set([...prev, ...rowIdsAsNumbers])]);
                      }
                    } else {
                      deselectAll();
                      if (setPropertyIds) {
                        setPropertyIds((prev) => prev.filter((id) => !rowIdsAsNumbers.includes(id)));
                      }
                    }
                  }}
                />
              </TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Data type</TableCell>
              <TableCell>Template column</TableCell>
              <TableCell sx={preDefinedValuesCellSx}>Pre-defined values</TableCell>
              {showTraitName && <TableCell>Trait</TableCell>}
              <TableCell>Protocol</TableCell>
              <TableCell>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <span>Require must read in projects</span>
                  <Tooltip title="If 'Yes', when the user downloads organism data for this property, the system displays the 'Must read' information of the projects associated with the organisms before proceeding with the data download" arrow>
                    <InfoIcon size={46} style={{ cursor: 'help' }} />
                  </Tooltip>
                </Stack>
              </TableCell>
              {(user?.levelId === USER_LEVEL_ADMIN) && (<>
                <TableCell>Update</TableCell>
                <TableCell>Delete</TableCell>
              </>)}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const rowIdNumber = Number(row.id);
              const isSelected = setPropertyIds ? propertyIds.includes(rowIdNumber) : selected?.has(row.id);

              return (
                <TableRow hover key={row.id} selected={isSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={(event) => {
                        if (event.target.checked) {
                          selectOne(row.id);
                          if (setPropertyIds) {
                            setPropertyIds((prev) => (prev.includes(rowIdNumber) ? prev : [...prev, rowIdNumber]));
                          }
                        } else {
                          deselectOne(row.id);
                          if (setPropertyIds) {
                            setPropertyIds((prev) => prev.filter((id) => id !== rowIdNumber));
                          }
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                      <Link
                      variant="subtitle2"
                      sx={{ cursor: 'pointer', textDecoration: 'none', p: 0, m: 0, background: 'none', border: 'none' }}
                      onClick={() => router.push(paths.dashboard.traitPropertiesDisplay(Number(row.id)))}
                    >
                      {row.name}
                    </Link>
                    </Stack>
                  </TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell>{row.data_type_name}</TableCell>
                  <TableCell>{row.template_column_name}</TableCell>
                  <TableCell>
                    <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                      {getPreDefinedValues(row.pre_defined_values).map((value) => (
                        <Box
                          component="li"
                          key={`${row.id}-${value}`}
                          sx={{ mb: 0.5, whiteSpace: 'normal', overflowWrap: 'break-word', wordBreak: 'normal' }}
                        >
                          <Typography variant="body2">{value}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </TableCell>
                  {showTraitName && <TableCell>
                      <Chip
                          label={row.trait_name}
                          component={RouterLink}
                          href={paths.dashboard.traitProperties(row.trait_id)}
                          clickable
                          sx={{ margin: '4px' }}
                        />
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
                  <TableCell>{row.req_project_must_read ? 'Yes' : 'No'}</TableCell>
                  {(user?.levelId === USER_LEVEL_ADMIN) && <>
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
                  </>}
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
