"use client";
import * as React from 'react';
import {useEffect, useState, useRef} from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { ArrowClockwise as ArrowClockwiseIcon } from '@phosphor-icons/react/dist/ssr/ArrowClockwise';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import { config } from '@/config';
import { BatchFilters } from '@/components/dashboard/upload/batch-filters';
import { BatchTable } from '@/components/dashboard/upload/batch-table';
import type { Batch } from '@/components/dashboard/upload/batch-table';
import { useForm } from 'react-hook-form';
 
import { getBatchProcessesRequest, refreshMaterializedViewsRequest } from '@/api/batch';

export default function Page(): React.JSX.Element {

  const [successMessage, setSuccessMessage] = React.useState(null);
  const { setError, 
    formState: { errors } 
  } = useForm();
  const [batches, setBatches] = useState([]);
  const isMounted = useRef(false);

  const fetchBatches = async () => {
      try {
          const response = await getBatchProcessesRequest(); 
          setBatches(response.data);
          console.log('Batch processes:', response.data);
      } catch (error) {
        console.error('Error fetching batch processes:', error);
      }
    };

    useEffect(() => {
      if (!isMounted.current) {
        isMounted.current = true;
        fetchBatches();
      }
  
      const intervalId = setInterval(() => {
        fetchBatches();
      }, 60000); // Refresh every 60 seconds
  
      return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }, []);


  //Add title to the page
  useEffect(() => {
    document.title = `Batch | Dashboard | ${config.site.name}`;
  }, []);


  //Define the event handler for the refresh materialized views button
  const handleRefreshViewsClick = async () => {
    try{
      const res = await refreshMaterializedViewsRequest();
      setSuccessMessage(res.data);
    }catch(error){
      if (error instanceof Error && error.request && error.request.response) {
          const errorMessage = JSON.parse(error.request.response).message;
          setError('root', { type: 'server', message: String(errorMessage) });
        } else {
          setError('root', { type: 'server', message: String(error) });
        }
      }
    };


  //Initialize the pagination of the table
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  //Paginate the list of species
  const paginatedBatches = applyPagination(batches, page, rowsPerPage);

  //Define the event handlers for the pagination
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Rows per page from BATCH PROCESSES PAGE :', event.target.value);
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
            <Typography variant="h4">Batch processes</Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Button color="inherit" startIcon={<UploadIcon fontSize="var(--icon-fontSize-md)" />}>
                Import
              </Button>
              <Button color="inherit" startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />}>
                Export
              </Button>
            </Stack>
          </Stack>
          <div>
            <Button onClick={handleRefreshViewsClick} startIcon={<ArrowClockwiseIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" color='warning'>
              Refresh materialized views
            </Button>
          </div>
        </Stack>
        <Stack spacing={3} sx={{ mt: 2 }}>
            {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
            {successMessage ? <Alert color="success">{successMessage}</Alert> : null}
        </Stack>
        <BatchFilters />
        <BatchTable
          count={batches.length}
          page={page}
          rows={paginatedBatches}
          rowsPerPage={rowsPerPage}
          myRowsPerPageChangeEvent={handleChangeRowsPerPage}
          myPageChangeEvent={handleChangePage}
        />
      </Stack>
  );
}

function applyPagination(rows: Batch[], page: number, rowsPerPage: number): Batch[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
