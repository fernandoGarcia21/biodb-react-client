"use client";
import * as React from 'react';
import {useEffect, useState, useRef} from 'react';
import type { Metadata } from 'next';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import dayjs from 'dayjs';

import { config } from '@/config';
import { SpeciesFilters } from '@/components/dashboard/species/species-filters';
import { SpeciesTable } from '@/components/dashboard/species/species-table';
import type { Species } from '@/components/dashboard/species/species-table';
 
import { createSpeciesRequest, getSpeciesRequest } from '@/api/species';

export default function Page(): React.JSX.Element {

  const [species, setSpecies] = useState([]);
  const isMounted = useRef(false);

  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        if (!isMounted.current) {
          isMounted.current = true;
          const response = await getSpeciesRequest(); 
          setSpecies(response.data);
          console.log('Species:', response.data);
        }
      } catch (error) {
        console.error('Error fetching species:', error);
      }
    };

    fetchSpecies();

  }, []);

  //Add title to the page
  useEffect(() => {
    document.title = `Species | Dashboard | ${config.site.name}`;
  }, []);


  //Initialize the pagination of the table
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  //Paginate the list of species
  const paginatedSpecies = applyPagination(species, page, rowsPerPage);

  //Define the event handlers for the pagination
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Rows per page from SPECIES PAGE :', event.target.value);
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    console.log('The new page number :', newPage);
    setPage(newPage);
  };

  return (
      <Stack spacing={3}>
        <Stack direction="row" spacing={3}>
          <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
            <Typography variant="h4">Species list</Typography>
          </Stack>
        </Stack>
        {/**<SpeciesFilters />  */}
        <SpeciesTable
          count={species.length}
          page={page}
          rows={paginatedSpecies}
          rowsPerPage={rowsPerPage}
          myRowsPerPageChangeEvent={handleChangeRowsPerPage}
          myPageChangeEvent={handleChangePage}
        />
      </Stack>
  );
}

function applyPagination(rows: Species[], page: number, rowsPerPage: number): Species[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
