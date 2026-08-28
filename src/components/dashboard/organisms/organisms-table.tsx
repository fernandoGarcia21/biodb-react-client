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
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell align="center" colSpan={1}></TableCell>
              <TableCell align="center" colSpan={7}></TableCell>
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
              <TableCell>Internal Id</TableCell>
              <TableCell>Species</TableCell>
              <TableCell>Habitat</TableCell>
              <TableCell>Sampling area</TableCell>
              <TableCell>Sampling location</TableCell>
              <TableCell>Country</TableCell>
              <TableCell>Project</TableCell>
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
                  <TableCell>{row.habitat_name}</TableCell>
                  <TableCell>{row.sampling_site_name}</TableCell>
                  <TableCell>{row.location_name}</TableCell>
                  <TableCell>{row.country_name}</TableCell>
                  <TableCell>{row.projects}</TableCell>
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

