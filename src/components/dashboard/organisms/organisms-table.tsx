'use client';

import * as React from 'react';
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
import Typography from '@mui/material/Typography';

import { useSelection } from '@/hooks/use-selection';
import { DATA_TYPE_TEXT } from '@/constants';

export interface Organism {
  id: string;
  individual_id: string;
  species_name: string;
  habitat_name: string;
  sampling_site_name: string;
  location_name: string;
  country_name: string;
  habitat_structure?: string | null;
  is_contact_zone?: boolean | null;
  projects: string;
  project_ids: string;
  properties: { f2: string; f4: string }[]; // <-- Fix here
}

interface OrganismTableProps {
  count?: number;
  page?: number;
  rows?: Organism[];
  headersGroupping?: any[];
  rowsPerPage?: number;
  myRowsPerPageChangeEvent?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  myPageChangeEvent?: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void; 
}

export function OrganismsTable({
  count = 0,
  rows = [],
  headersGroupping = [],
  page = 0,
  rowsPerPage = 0,
  myRowsPerPageChangeEvent,
  myPageChangeEvent,
}: OrganismTableProps): React.JSX.Element {
  const topScrollRef = React.useRef<HTMLDivElement>(null);
  const tableScrollRef = React.useRef<HTMLDivElement>(null);
  const tableRef = React.useRef<HTMLTableElement>(null);
  const dragRef = React.useRef<{ startX: number; scrollLeft: number; active: boolean } | null>(null);
  const [tableWidth, setTableWidth] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isOverDragArea, setIsOverDragArea] = React.useState(false);

  React.useEffect(() => {
    const table = tableRef.current;
    const container = tableScrollRef.current;
    if (!table || !container) return;

    const observer = new ResizeObserver(() => {
      setTableWidth(container.scrollWidth);
    });
    observer.observe(table);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const syncScroll = (source: HTMLDivElement, target: HTMLDivElement | null): void => {
    if (target && target.scrollLeft !== source.scrollLeft) {
      target.scrollLeft = source.scrollLeft;
    }
  };

  const isDragArea = (event: React.PointerEvent<HTMLDivElement>): boolean => {
    const target = event.target as HTMLElement;
    if (target.closest('a, button, input, label, select, textarea, [role="button"]')) return false;
    const container = event.currentTarget;
    const bounds = container.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    // Exclude native scrollbars; reserve a 12px strip along the visible edges.
    if (x >= container.clientWidth || y >= container.clientHeight) return false;
    const cell = target.closest('td, th');
    const cellBounds = cell?.getBoundingClientRect();
    const nearColumnBorder = cellBounds !== undefined && (
      Math.abs(event.clientX - cellBounds.left) <= 5 ||
      Math.abs(event.clientX - cellBounds.right) <= 5
    );
    return nearColumnBorder || Boolean(target.closest('thead')) || x < 12 || x > container.clientWidth - 12 ||
      y < 12 || y > container.clientHeight - 12;
  };

  const stopDragging = (event: React.PointerEvent<HTMLDivElement>): void => {
    dragRef.current = null;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const isWebUrl = (value: unknown): value is string => {
    if (typeof value !== 'string') {
      return false;
    }

    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const rowIds = React.useMemo(() => {
    return rows.map((organism) => organism.id);
  }, [rows]);

  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;

  // Get all headers for dynamic properties that are groupped by trait name
  const tmpPropertyHeaders = headersGroupping.reduce((acc, obj) => { return acc.concat(obj.items); }, []);
  const flatHeaders = tmpPropertyHeaders.map((obj) => obj.property_name);

  return (
    <Card>
      <Box
        ref={topScrollRef}
        role="region"
        aria-label="Scroll organisms table horizontally"
        tabIndex={0}
        onScroll={(event) => syncScroll(event.currentTarget, tableScrollRef.current)}
        sx={{ overflowX: 'auto', overflowY: 'hidden' }}
      >
        <Box sx={{ width: tableWidth, height: '16px' }} />
      </Box>
      <Box
        ref={tableScrollRef}
        onScroll={(event) => syncScroll(event.currentTarget, topScrollRef.current)}
        onPointerDown={(event) => {
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
            event.currentTarget.setPointerCapture(event.pointerId);
            setIsDragging(true);
          }
          event.preventDefault();
          event.currentTarget.scrollLeft = drag.scrollLeft - distance;
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
        <Table ref={tableRef} sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" rowSpan={2}>
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
              <TableCell rowSpan={2} scope="col">Internal Id</TableCell>
              <TableCell rowSpan={2} scope="col">Species</TableCell>
              <TableCell align="center" colSpan={6} scope="colgroup" sx={{ borderLeft: '1px solid #ccc' }}>
                Geography and habitat
              </TableCell>
              <TableCell rowSpan={2} scope="col" sx={{ borderLeft: '1px solid #ccc' }}>Projects</TableCell>
              {/* Add group of headers for dynamic properties */}
              {headersGroupping.length > 0 && headersGroupping.map((group) => (
                <TableCell 
                key={`${group.trait_name}-${group.count}`} 
                align="center" 
                colSpan={group.count}
                sx={{ borderLeft: '1px solid #ccc' }} // Add border to grouped headers
                >{group.trait_name}</TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell sx={{ borderLeft: '1px solid #ccc' }}>Country</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Sampling area</TableCell>
              <TableCell>Habitat</TableCell>
              <TableCell>Habitat structure</TableCell>
              <TableCell>Contact zone in the SA</TableCell>
              {/* Add headers for dynamic properties */}
              {flatHeaders.length > 0 && flatHeaders.map((key) => (
                <TableCell key={key}>{key}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {
            rows.map((row) => {
              const isSelected = selected?.has(row.id);
              const propertiesRow = row.properties.reduce((acc, obj) => {
                    acc[obj.f2] = obj.f4;
                    return acc;
                  }, {});

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
                      <Typography variant="subtitle2">{row.individual_id}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{row.species_name}</TableCell>
                  <TableCell sx={{ borderLeft: '1px solid #ccc' }}>{row.country_name}</TableCell>
                  <TableCell>{row.location_name}</TableCell>
                  <TableCell>{row.sampling_site_name}</TableCell>
                  <TableCell>{row.habitat_name}</TableCell>
                  <TableCell>{row.habitat_structure || '-'}</TableCell>
                  <TableCell>{row.is_contact_zone == null ? '-' : row.is_contact_zone ? 'Yes' : 'No'}</TableCell>
                  <TableCell sx={{ borderLeft: '1px solid #ccc' }}>{row.projects}</TableCell>
                  {/* Render dynamic properties */}
                  {flatHeaders.length > 0 && flatHeaders.map((key) => {
                    const propertyValue = propertiesRow[key];

                    return (
                      <TableCell key={`${row.id}-${key}`}>
                        {propertyValue ? (
                          isWebUrl(propertyValue) ? (
                            <a href={propertyValue} target="_blank" rel="noopener noreferrer">
                              {propertyValue}
                            </a>
                          ) : (
                            propertyValue
                          )
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    );
                  })}
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
