'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableSortLabel from '@mui/material/TableSortLabel';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Trash as DeleteIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { Pencil as UpdateIcon } from '@phosphor-icons/react/dist/ssr/Pencil';

import { useSelection } from '@/hooks/use-selection';
import { paths} from '@/paths';
import { API, USER_LEVEL_ADMIN, USER_LEVEL_LEADER } from '@/constants';
import { useUser } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';

export interface SamplingArea {
  id: string;
  name: string;
  country_name: string;
  location_name: string;
  latitude: string;
  longitude: string;
  description: string;
  habitat_code?: string;
  habitat_structure_name?: string;
  habitat_photo_file_name?: string;
  is_contact_zone?: boolean;
}

interface SamplingAreasTableProps {
  sortBy: keyof SamplingArea | null;
  sortDirection: 'asc' | 'desc';
  onSort: (column: keyof SamplingArea) => void;
  count?: number;
  page?: number;
  rows?: SamplingArea[];
  rowsPerPage?: number;
  myRowsPerPageChangeEvent?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  myPageChangeEvent?: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void; 
  handleDeleteClickOpen: (id: number, name: string) => void;
  handleUpdateClick: (id: number) => void;
}

export function SamplingAreasTable({
  sortBy,
  sortDirection,
  onSort,
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  myRowsPerPageChangeEvent,
  myPageChangeEvent,
  handleDeleteClickOpen,
  handleUpdateClick,
}: SamplingAreasTableProps): React.JSX.Element {
  const suppressSortClickRef = React.useRef(false);
  const dragRef = React.useRef<{ startX: number; scrollLeft: number; active: boolean } | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isOverDragArea, setIsOverDragArea] = React.useState(false);

  const DESCRIPTION_PREVIEW_LENGTH = 140;
  const topScrollRef = React.useRef<HTMLDivElement | null>(null);
  const tableScrollRef = React.useRef<HTMLDivElement | null>(null);
  const [topScrollbarWidth, setTopScrollbarWidth] = React.useState(0);

  const isDragArea = (event: React.PointerEvent<HTMLDivElement>): boolean => {
    const target = event.target as HTMLElement;
    if (target.closest('a, button, input, label, select, textarea') ||
      (target.closest('[role="button"]') && !target.closest('thead'))) return false;
    const container = event.currentTarget;
    const bounds = container.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    // Exclude native scrollbars.
    if (x >= container.clientWidth || y >= container.clientHeight) return false;
    const cell = target.closest('td, th');
    const cellBounds = cell?.getBoundingClientRect();
    const nearColumnBorder = cellBounds !== undefined && (
      Math.abs(event.clientX - cellBounds.left) <= 5 ||
      Math.abs(event.clientX - cellBounds.right) <= 5
    );
    return nearColumnBorder || Boolean(target.closest('thead'));
  };

  const stopDragging = (event: React.PointerEvent<HTMLDivElement>): void => {
    dragRef.current = null;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const rowIds = React.useMemo(() => {
    return rows.map((sample_area) => sample_area.id);
  }, [rows]);

  const [expandedDescriptions, setExpandedDescriptions] = React.useState<Record<string, boolean>>({});

  const toggleDescription = React.useCallback((samplingAreaId: string) => {
    setExpandedDescriptions((prev) => ({ ...prev, [samplingAreaId]: !prev[samplingAreaId] }));
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
      <Box
        ref={tableScrollRef}
        onPointerDown={(event) => {
          suppressSortClickRef.current = false;
          if (event.pointerType !== 'mouse' || event.button !== 0) return;
          if (!isDragArea(event)) return;
          event.preventDefault();
          dragRef.current = { startX: event.clientX, scrollLeft: event.currentTarget.scrollLeft, active: false };
        }}
        onPointerMove={(event) => {
          setIsOverDragArea(event.pointerType === 'mouse' && isDragArea(event));
          const drag = dragRef.current;
          if (!drag) return;
          const distance = event.clientX - drag.startX;
          if (!drag.active && Math.abs(distance) < 5) return;
          if (!drag.active) {
            drag.active = true;
            suppressSortClickRef.current = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            setIsDragging(true);
          }
          event.preventDefault();
          event.currentTarget.scrollLeft = drag.scrollLeft - distance;
        }}
        onClickCapture={(event) => {
          if (suppressSortClickRef.current && event.detail !== 0) {
            event.preventDefault();
            event.stopPropagation();
            suppressSortClickRef.current = false;
          }
        }}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onLostPointerCapture={() => { dragRef.current = null; setIsDragging(false); }}
        onPointerLeave={() => {
          setIsOverDragArea(false);
          if (!dragRef.current?.active) dragRef.current = null;
        }}
        sx={{
          overflowX: 'auto',
          cursor: isDragging ? 'grabbing' : isOverDragArea ? 'grab' : 'auto',
          userSelect: isDragging ? 'none' : 'auto',
          '& thead': { userSelect: 'none' },
        }}
      >

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
              {([
                { key: 'id', label: 'Id' },
                { key: 'name', label: 'Name' },
                { key: 'country_name', label: 'Country' },
                { key: 'location_name', label: 'Location' },
                { key: 'latitude', label: 'Latitude' },
                { key: 'longitude', label: 'Longitude' },
                { key: 'habitat_code', label: 'Habitat code' },
                { key: 'habitat_structure_name', label: 'Habitat structure' },
                { key: 'is_contact_zone', label: 'Contact zone in the SA' },
                { key: 'habitat_photo_file_name', label: 'Habitat photo' },
                { key: 'description', label: 'Description' },
              ] satisfies { key: keyof SamplingArea; label: string }[]).map((column) => (
                <TableCell
                  key={column.key}
                  sortDirection={sortBy === column.key ? sortDirection : false}
                  sx={column.key === 'description' ? { minWidth: 360, width: '35%' } : undefined}
                  onClick={() => onSort(column.key)}
                >
                  <TableSortLabel active={sortBy === column.key} direction={sortBy === column.key ? sortDirection : 'asc'}>
                    {column.label}
                  </TableSortLabel>
                </TableCell>
              ))}
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
                  <TableCell>{row.id}</TableCell>
                  <TableCell>
                    <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                      <Link
                      variant="subtitle2"
                      sx={{ cursor: 'pointer', textDecoration: 'none', p: 0, m: 0, background: 'none', border: 'none' }}
                      onClick={() => router.push(paths.dashboard.samplingAreaDisplay(Number(row.id)))}
                    >
                      {row.name}
                    </Link>
                    </Stack>
                  </TableCell>
                  <TableCell>{row.country_name}</TableCell>
                  <TableCell>{row.location_name}</TableCell>
                  <TableCell>{row.latitude}</TableCell>
                  <TableCell>{row.longitude}</TableCell>
                  <TableCell>{row.habitat_code}</TableCell>
                  <TableCell>{row.habitat_structure_name}</TableCell>
                  <TableCell>{row.is_contact_zone ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    {row.habitat_photo_file_name ? (
                      <Link
                        href={`${API}/sampling_area_images/${encodeURIComponent(row.habitat_photo_file_name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Photo
                      </Link>
                    ) : 'Not available'}
                  </TableCell>
                  <TableCell sx={{ minWidth: 360, width: '35%' }}>
                    {(() => {
                      const description = row.description ?? '';
                      const isExpanded = Boolean(expandedDescriptions[row.id]);
                      const shouldTruncate = description.length > DESCRIPTION_PREVIEW_LENGTH;
                      const descriptionPreview = shouldTruncate && !isExpanded
                        ? `${description.slice(0, DESCRIPTION_PREVIEW_LENGTH)}...`
                        : description;

                      return (
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {descriptionPreview}
                          {shouldTruncate ? (
                            <Link
                              component="button"
                              type="button"
                              onClick={() => { toggleDescription(row.id); }}
                              sx={{ ml: 1, fontWeight: 600 }}
                            >
                              {isExpanded ? 'Read less' : 'Read more'}
                            </Link>
                          ) : null}
                        </Typography>
                      );
                    })()}
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
