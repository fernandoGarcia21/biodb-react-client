'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
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
import {USER_LEVEL_ADMIN} from '@/constants'

export interface Habitat {
  id: string;
  name: string;
  description: string;
}

interface HabitatsTableProps {
  count?: number;
  page?: number;
  rows?: Habitat[];
  rowsPerPage?: number;
  myRowsPerPageChangeEvent?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  myPageChangeEvent?: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void; 
  handleClickOpen: (id: number, name: string) => void;
  handleUpdateClick: (id: number) => void;
}

export function HabitatsTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  myRowsPerPageChangeEvent,
  myPageChangeEvent,
  handleClickOpen,
  handleUpdateClick,
}: HabitatsTableProps): React.JSX.Element {
  const DESCRIPTION_PREVIEW_LENGTH = 140;
  const topScrollRef = React.useRef<HTMLDivElement | null>(null);
  const tableScrollRef = React.useRef<HTMLDivElement | null>(null);
  const [topScrollbarWidth, setTopScrollbarWidth] = React.useState(0);

  const rowIds = React.useMemo(() => {
    return rows.map((habitat) => habitat.id);
  }, [rows]);

  const [expandedDescriptions, setExpandedDescriptions] = React.useState<Record<string, boolean>>({});

  const toggleDescription = React.useCallback((habitatId: string) => {
    setExpandedDescriptions((prev) => ({ ...prev, [habitatId]: !prev[habitatId] }));
  }, []);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;

  const { user } = useUser();
  const router = useRouter();

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
                    } else {
                      deselectAll();
                    }
                  }}
                />
              </TableCell>
              <TableCell>Id</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
            { (user?.levelId === USER_LEVEL_ADMIN) && (
              <>
              <TableCell>Update</TableCell>
              <TableCell>Delete</TableCell>
              </> )  }
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
                  <TableCell>{row.id}</TableCell>
                  <TableCell>
                    <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                      <Link
                      variant="subtitle2"
                      sx={{ cursor: 'pointer', textDecoration: 'none', p: 0, m: 0, background: 'none', border: 'none' }}
                      onClick={() => router.push(paths.dashboard.habitatDisplay(Number(row.id)))}
                    >
                      {row.name}
                    </Link>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ minWidth: 300, maxWidth: 420 }}>
                    {(() => {
                      const description = row.description ?? '';
                      const isExpanded = Boolean(expandedDescriptions[row.id]);
                      const shouldTruncate = description.length > DESCRIPTION_PREVIEW_LENGTH;
                      const text = shouldTruncate && !isExpanded
                        ? `${description.slice(0, DESCRIPTION_PREVIEW_LENGTH)}...`
                        : description;

                      return (
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {text}
                          {shouldTruncate ? (
                            <Box
                              component="button"
                              type="button"
                              onClick={() => { toggleDescription(row.id); }}
                              sx={{
                                ml: 1,
                                p: 0,
                                border: 'none',
                                background: 'none',
                                color: 'primary.main',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              {isExpanded ? 'Read less' : 'Read more'}
                            </Box>
                          ) : null}
                        </Typography>
                      );
                    })()}
                  </TableCell>
                   { (user?.levelId === USER_LEVEL_ADMIN ) && ( 
                    <>
                                        
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
                            handleClickOpen(Number(row.id), row.name);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </> )  }
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
