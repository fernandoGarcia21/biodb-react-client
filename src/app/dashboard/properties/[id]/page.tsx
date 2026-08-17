"use client";
import { useParams, useRouter } from 'next/navigation';
import * as React from 'react';
import {useEffect, useState, useRef} from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import { useBrandTitle } from '@/hooks/use-brand-title';

import { config } from '@/config';
import { PropertiesFilters } from '@/components/dashboard/properties/properties-filters';
import { PropertiesTable } from '@/components/dashboard/properties/properties-table';
import type { Property } from '@/components/dashboard/properties/properties-table';
import { AxiosError } from 'axios';
 
import { getPropertyRequest, getTraitPropertiesRequest, deletePropertyRequest, getPropertiesWithProtocolPdfRequest } from '@/api/properties';
import { getTraitRequest } from '@/api/traits';
import { paths } from '@/paths';
import { useUser } from '@/hooks/use-user';
import {BACKEND_ENDPOINT_URL_IMAGES, USER_LEVEL_ADMIN} from '@/constants';

export default function Page(): React.JSX.Element {

  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [propertyIds, setPropertyIds] = useState<number[]>([]);
  const [traitName, setTraitName] = useState<string>('');
  const [isDownloadingProtocols, setIsDownloadingProtocols] = React.useState(false);
  const isMounted = useRef(false);
  const { user } = useUser();
  const brandTitle = useBrandTitle();

  const params = useParams<{ id: string }>();
  const traitId = params.id;
  console.log(params);

  const fetchProperties = async () => {
    try {
      if (!isMounted.current) {
        isMounted.current = true;

        //fetch trait name
        const responseTrait = await getTraitRequest(traitId);
        if (responseTrait.data && responseTrait.data.length > 0) {
          setTraitName(responseTrait.data[0].name);
          document.title = `Trait properties: ${responseTrait.data[0].name} | ${brandTitle}`;
        }

        //fetch trait properties
        const response = await getTraitPropertiesRequest(traitId); 
        setProperties(response.data);
        console.log('Properties:', response.data);
      }
    } catch (error) {
      console.error('Error fetching trait info or trait properties:', error);
    }
  };

  useEffect(() => {
        fetchProperties();
      
    }, []);

  //Add title to the page
  useEffect(() => {
    //document.title = `Trait properties: ${traitName} | Dashboard | ${config.site.name}`;
  }, []);

  //When clicking the add button, redirect to the create property page
  const handleAddClick = () => {
      router.push(paths.dashboard.traitPropertiesCreate(traitId));
    };

  //State for the operation result messages
    const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  
    //Code for the delete dialog
    const [open, setOpen] = React.useState(false);
    const [deleteName, setDeleteName] = React.useState("");
    const [deleteId, setDeleteId] = React.useState<number | null>(null);
    const errorRef = React.useRef<HTMLDivElement>(null);
  
    const handleDeleteClickOpen = (idProperty: number, nameProperty: string) => {
      setDeleteId(idProperty);
      setDeleteName(nameProperty);
      setSuccessMessage(null);
      setErrorMessage(null);
      setOpen(true);
    };
  
    const handleClose = () => {
      setDeleteId(null);
      setDeleteName('');
      setOpen(false);
    };
  
    const handleDelete = async () => {
      // Perform delete operation here
      setSuccessMessage(null);
      setErrorMessage(null);
      try{
        if (deleteId) {
          await deletePropertyRequest(deleteId);
          setSuccessMessage(`Property ${deleteName} eliminated successfully!`);
            // Refresh the properties table
          isMounted.current = false;
          fetchProperties();
        } else {
          throw new Error('Property ID is null or undefined when trying to delete');
        }
      }catch(error){
        if (error instanceof AxiosError && error.request && error.request.response) {
          const errorMessage = JSON.parse(error.request.response).message;
          setErrorMessage(String(errorMessage));
        } else {
          setErrorMessage(String(error));
        }
      }
      console.log('Item deleted');
      handleClose();
  
      //Scroll to the error message
      if (errorRef.current) {
        errorRef.current.scrollIntoView({ behavior: 'smooth' });
      }
  
    };
  
    const handleUpdateClick = (idProperty: number) => {
      router.push(paths.dashboard.traitPropertiesUpdate(idProperty));
    };

    // Function to preprocess HTML and update image paths
  const preprocessHtml = (html: string): string => {
    const backendImageBaseUrl = BACKEND_ENDPOINT_URL_IMAGES; // Replace with your backend URL
  
    // Use a DOM parser to manipulate the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
  
    // Update all <img> tags
    const images = doc.querySelectorAll('img');
    images.forEach((img) => {
      const src = img.getAttribute('src');
      if (src && !src.startsWith('http')) {
        // Update the src to point to the backend API
        img.setAttribute('src', `${backendImageBaseUrl}${src}`);
      }
    });
  
    // Serialize the updated HTML back to a string
    return doc.body.innerHTML;
  };

  // Function to handle the download of all protocols as a single PDF
    const handleDownloadAllProtocols = async () => {
      setSuccessMessage(null);
      setErrorMessage(null);
      setIsDownloadingProtocols(true);
  
      try {
        // If propertyIds is empty, use all properties' IDs of the trait
        const tmpPropertyIds = propertyIds.length > 0 ? propertyIds : properties.map((property: Property) => property.id);
        const response = await getPropertiesWithProtocolPdfRequest(tmpPropertyIds);
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'all-property-protocols.pdf';
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
  
        setSuccessMessage('PDF generated successfully.');
      } catch (error) {
        setErrorMessage('Error generating protocols PDF.');
        console.error('Error generating protocols PDF:', error);
      } finally {
        setIsDownloadingProtocols(false);
      }
    };
  

  //Initialize the pagination of the table
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  //Paginate the list of properties
  const paginatedProperties = applyPagination(properties, page, rowsPerPage);

  //Define the event handlers for the pagination
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Rows per page :', event.target.value);
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    console.log('The new page number :', newPage);
    setPage(newPage);
  };


  //Code for the protocol dialog
    const [openProtocol, setOpenProtocol] = React.useState(false);
    const [propertyProtocolName, setPropertyProtocolName] = React.useState("");
    const [propertyProtocol, setPropertyProtocol] = React.useState("");
  
    const handleProtocolClickOpen = async(idProperty: number) => {
      try {
        if(!openProtocol && idProperty){
          const responseProperty = await getPropertyRequest(idProperty);
          
          if (responseProperty.data && responseProperty.data.length > 0) {
            setPropertyProtocolName(responseProperty.data[0].name);
            // Preprocess the HTML to update image paths
            const rawProtocol = responseProperty.data[0].protocol;
            const updatedProtocol = preprocessHtml(rawProtocol);
            setPropertyProtocol(updatedProtocol);
          }
          setOpenProtocol(true);
        }
        
        } catch (error) {
            console.error('Error fetching property info:', error);
        }
    };
  
    const handleCloseProtocol = () => {
      setPropertyProtocolName('');
      setPropertyProtocol('');
      setOpenProtocol(false);
    };

  return (
      <Stack spacing={3}>
        <Stack direction="row" spacing={3}>
          <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
            <Typography variant="h4">Trait {traitName} properties</Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Button
                variant="outlined"
                onClick={handleDownloadAllProtocols}
                disabled={isDownloadingProtocols}
                startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />}
              >
                {isDownloadingProtocols ? 'Generating PDF...' : (propertyIds.length > 0 ? `Download ${propertyIds.length} protocols out of ${properties.length}` : 'Download all trait protocols')}
              </Button>
            </Stack>
          </Stack>
          {(user?.levelId === USER_LEVEL_ADMIN) && (
            <div>
              <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={handleAddClick}>
                Add
              </Button>
            </div>
          )}
        </Stack>
        {//<PropertiesFilters /> is commented out for now, but can be enabled if needed
        // but the filter functionality is not implemented yet
        }
        <PropertiesTable
          count={properties.length}
          page={page}
          rows={paginatedProperties}
          rowsPerPage={rowsPerPage}
          showTraitName={false}
          propertyIds={propertyIds}
          setPropertyIds={setPropertyIds}
          myRowsPerPageChangeEvent={handleChangeRowsPerPage}
          myPageChangeEvent={handleChangePage}
          handleDeleteClickOpen={handleDeleteClickOpen}
          handleUpdateClick={handleUpdateClick}
          handleProtocolClickOpen={handleProtocolClickOpen}
        />
        <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        >
        <DialogTitle id="alert-dialog-title">
          {`Are you sure you want to delete ${deleteName}?`}
        </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleDelete} autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
                open={openProtocol}
                onClose={handleCloseProtocol}
                aria-labelledby="alert-protocol-dialog-title"
                aria-describedby="alert-dialog-description"
                fullWidth // Makes the dialog take the full width of the container
                maxWidth="xl" // Sets the maximum width to extra-large (you can adjust this)
                sx={{
                  '& .MuiDialog-paper': {
                    width: '90%', // Adjust the width to occupy 90% of the screen
                    maxWidth: 'none', // Disable the default maxWidth constraint
                  },
                }}
                >
                <DialogTitle id="alert-protocol-dialog-title">
                  {`Protocol for collecting and recording ${propertyProtocolName}`}
                </DialogTitle>
                <DialogContent>
                  <div dangerouslySetInnerHTML={{ __html: propertyProtocol }} />
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleCloseProtocol}>Close</Button>
                </DialogActions>
              </Dialog>
        <Stack ref={errorRef} spacing={3} sx={{ mt: 1, mb: 3 }}>
          {errorMessage ? <Alert color="error">{errorMessage}</Alert> : null}
          {successMessage ? <Alert color="success">{successMessage}</Alert> : null}
        </Stack>
      </Stack>
  );
}

function applyPagination(rows: Property[], page: number, rowsPerPage: number): Property[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
