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
import IconButton from '@mui/material/IconButton';
import { ListMagnifyingGlass as CurateIcon } from '@phosphor-icons/react/dist/ssr/ListMagnifyingGlass';


import { useSelection } from '@/hooks/use-selection';
import { useUser } from '@/hooks/use-user';
import { USER_LEVEL_ADMIN, BU_STATUS_SUBMITTED, BU_STATUS_APPROVED, BU_STATUS_REJECTED } from '@/constants';
import Tooltip from '@mui/material/Tooltip';

export interface Batch {
  id: string;
  file_name: string;
  internal_file_name: string;
  parameters: string;
  batch_type: string;
  uploaded_by: string;
  status_id: number;
  status: string;
  date_submitted: string;
  date_started: string;
  date_completed: string;
  logs: string;
  curator: string;
  curator_notes: string;
  date_curated: string;
}

interface BatchTableProps {
  count?: number;
  page?: number;
  rows?: Batch[];
  rowsPerPage?: number;
  myRowsPerPageChangeEvent?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  myPageChangeEvent?: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void; 
  handleReviewClick: (idBatch: number) => void;
}

const statusMap = {
  1: { color: 'primary' },
  2: { color: 'warning' },
  3: { color: 'success' },
  4: { color: 'gray' },
  5: { color: 'error' },
  6: { color: 'info' },
  7: { color: 'gray' },
} as const;

export function BatchTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  myRowsPerPageChangeEvent,
  myPageChangeEvent,
  handleReviewClick,
}: BatchTableProps): React.JSX.Element {
  const PREVIEW_LENGTH = 120;
  const topScrollRef = React.useRef<HTMLDivElement | null>(null);
  const tableScrollRef = React.useRef<HTMLDivElement | null>(null);
  const [topScrollbarWidth, setTopScrollbarWidth] = React.useState(0);

  const rowIds = React.useMemo(() => {
    return rows.map((batch) => batch.id);
  }, [rows]);

  const [expandedLogs, setExpandedLogs] = React.useState<Record<string, boolean>>({});
  const [expandedCuratorNotes, setExpandedCuratorNotes] = React.useState<Record<string, boolean>>({});

  const toggleLog = React.useCallback((batchId: string) => {
    setExpandedLogs((prev) => ({ ...prev, [batchId]: !prev[batchId] }));
  }, []);

  const toggleCuratorNotes = React.useCallback((batchId: string) => {
    setExpandedCuratorNotes((prev) => ({ ...prev, [batchId]: !prev[batchId] }));
  }, []);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;
  const { user } = useUser();

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

              <TableCell>Type</TableCell>
              <TableCell>Uploaded by</TableCell>
              <TableCell>Status</TableCell>
              {user?.levelId === USER_LEVEL_ADMIN && (
                <>
                  <TableCell>Review</TableCell>
                </>
              )}
              <TableCell>Submitted File</TableCell>
              <TableCell>Date Submitted</TableCell>
              <TableCell>Date Started</TableCell>
              <TableCell>Date Completed</TableCell>
              <TableCell>Parameters</TableCell>
              <TableCell>Log</TableCell>
              <TableCell>Internal File Name</TableCell>
              <TableCell>Curator</TableCell>
              <TableCell>Curator Notes</TableCell>
              <TableCell>Date Curated</TableCell>
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
                  {user?.levelId === USER_LEVEL_ADMIN && (
                  <TableCell>
                      {row.status_id === BU_STATUS_SUBMITTED || row.status_id === BU_STATUS_APPROVED || row.status_id === BU_STATUS_REJECTED ? (
                        <Tooltip title="Review">
                          <IconButton
                            aria-label="review"
                            onClick={() => { handleReviewClick(Number(row.id)); }}
                            size="large"
                            sx={{
                              color: 'warning.main',
                              bgcolor: 'warning.light',
                              border: '1px solid',
                              borderColor: 'warning.main',
                              '&:hover': {
                                bgcolor: 'warning.main',
                                color: 'warning.contrastText',
                              },
                            }}
                          >
                            <CurateIcon color="#fff" size={24} />
                          </IconButton>
                        </Tooltip>
                      ) : '-'}
                    </TableCell>
                  )}
                  <TableCell>{row.file_name}</TableCell>
                  <TableCell>{row.date_submitted}</TableCell>
                  <TableCell>{row.date_started}</TableCell>
                  <TableCell>{row.date_completed}</TableCell>
                  <TableCell>{row.parameters}</TableCell>
                  <TableCell sx={{ minWidth: 260, maxWidth: 360 }}>
                    {(() => {
                      const logText = row.logs ?? '';
                      const isExpanded = Boolean(expandedLogs[row.id]);
                      const shouldTruncate = logText.length > PREVIEW_LENGTH;
                      const text = shouldTruncate && !isExpanded ? `${logText.slice(0, PREVIEW_LENGTH)}...` : logText;

                      return (
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {text}
                          {shouldTruncate ? (
                            <Box
                              component="button"
                              type="button"
                              onClick={() => { toggleLog(row.id); }}
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
                  <TableCell>{row.internal_file_name}</TableCell>
                  <TableCell>{row.curator}</TableCell>
                  <TableCell sx={{ minWidth: 260, maxWidth: 360 }}>
                    {(() => {
                      const notesText = row.curator_notes ?? '';
                      const isExpanded = Boolean(expandedCuratorNotes[row.id]);
                      const shouldTruncate = notesText.length > PREVIEW_LENGTH;
                      const text = shouldTruncate && !isExpanded ? `${notesText.slice(0, PREVIEW_LENGTH)}...` : notesText;

                      return (
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {text}
                          {shouldTruncate ? (
                            <Box
                              component="button"
                              type="button"
                              onClick={() => { toggleCuratorNotes(row.id); }}
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
                  <TableCell>{row.date_curated}</TableCell>
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
