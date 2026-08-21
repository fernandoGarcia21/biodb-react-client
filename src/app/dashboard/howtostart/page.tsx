'use client';

import * as React from 'react';
import { useEffect } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { useBrandTitle } from '@/hooks/use-brand-title';


interface SetupStep {
  number: string;
  title: string;
  description: string;
  access: 'ADMIN ONLY' | 'ADMIN + GROUP LEADER';
  optional?: boolean;
}


const setupSteps: SetupStep[] = [
  {
    number: '1.1',
    title: 'Users and access',
    description:
      'Create the instance administrator and the Group Leader accounts required for data curation.',
    access: 'ADMIN ONLY',
  },
  {
    number: '1.2',
    title: 'Species',
    description:
      'Register the species represented in the database.',
    access: 'ADMIN ONLY',
  },
  {
    number: '1.3',
    title: 'Habitats',
    description:
      'Define the habitat categories used by your study system.',
    access: 'ADMIN ONLY',
  },
  {
    number: '1.4',
    title: 'Locations',
    description:
      'Create the geographic locations represented in the database.',
    access: 'ADMIN ONLY',
  },
  {
    number: '1.5',
    title: 'Sampling areas',
    description:
      'Define the sampling areas associated with organism records.',
    access: 'ADMIN ONLY',
  },
  {
    number: '1.6',
    title: 'Projects',
    description:
      'Register the research projects associated with organism records.',
    access: 'ADMIN + GROUP LEADER',
  },
  {
    number: '1.7',
    title: 'Traits, features & properties',
    description:
      'Configure phenotypic traits, environmental features, their properties, protocols, and the identifiers used as dynamic columns in the organism CSV template.',
    access: 'ADMIN ONLY',
  },
  {
    number: '1.8',
    title: 'External datasets',
    description:
      'Optionally link the database to datasets stored in external repositories. This step is not required before uploading organisms.',
    access: 'ADMIN + GROUP LEADER',
    optional: true,
  },
];


export default function Page(): React.JSX.Element {

  const brandTitle = useBrandTitle();

  // Add title to the page
  useEffect(() => {
    document.title = `Getting started | ${brandTitle}`;
  }, [brandTitle]);


  return (
    <Stack spacing={4}>

      {/* ============================================================= */}
      {/* PAGE HEADER                                                   */}
      {/* ============================================================= */}

      <Stack spacing={1}>
        <Typography
          variant="overline"
          color="primary"
          sx={{ fontWeight: 700, letterSpacing: '0.08em' }}
        >
          Getting started
        </Typography>

        <Typography variant="h4">
          Configure your flexBioDB instance
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 760 }}
        >
          Complete the initial configuration before uploading organism data. Most setup tasks are performed once by an administrator.
        </Typography>
      </Stack>


      {/* ============================================================= */}
      {/* DEFAULT ADMIN WARNING                                         */}
      {/* ============================================================= */}

      <Alert severity="warning">
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          First login
        </Typography>

        <Typography variant="body2">
          If the default account <strong>admin@example.com</strong> was
          retained during installation, use it only for the initial login.
          Create a new administrator suitable for your database instance,
          then deactivate or remove the default account. The new
          administrator can subsequently create Group Leader users.
        </Typography>
      </Alert>


      {/* ============================================================= */}
      {/* ROLE LEGEND                                                   */}
      {/* ============================================================= */}

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Chip
          label="ADMIN / CURATOR"
          color="primary"
          variant="outlined"
          size="small"
        />

        <Chip
          label="GROUP LEADER"
          color="success"
          variant="outlined"
          size="small"
        />
      </Stack>


      {/* ============================================================= */}
      {/* PHASE 1                                                       */}
      {/* ============================================================= */}

      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 2,
        }}
      >

        <Stack spacing={3}>

          {/* Phase title */}

          <Stack direction="row" spacing={2} alignItems="flex-start">

            <Box
              sx={{
                minWidth: 42,
                height: 42,
                borderRadius: 1.5,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
              }}
            >
              1
            </Box>

            <Stack spacing={0.5}>
              <Typography variant="h5">
                Configure the database instance
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Complete these steps in order before uploading organism data.
              </Typography>
            </Stack>

          </Stack>


          {/* Setup cards */}

          <Grid container spacing={2}>

            {setupSteps.map((step) => {

              const adminOnly = step.access === 'ADMIN ONLY';

              return (
                <Grid item xs={12} sm={6} lg={4} key={step.number}>

                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      height: '100%',
                      bgcolor: 'background.default',
                      borderRadius: 2,
                    }}
                  >

                    <Stack spacing={1.5} height="100%">

                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                      >

                        <Box
                          sx={{
                            minWidth: 36,
                            height: 36,
                            px: 0.75,
                            borderRadius: '50%',
                            bgcolor: adminOnly
                              ? 'primary.main'
                              : 'success.main',
                            color: adminOnly
                              ? 'primary.contrastText'
                              : 'success.contrastText',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          {step.number}
                        </Box>

                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 700 }}
                        >
                          {step.title}
                        </Typography>

                      </Stack>


                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ flexGrow: 1 }}
                      >
                        {step.description}
                      </Typography>


                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                      >

                        <Chip
                          label={step.access}
                          size="small"
                          color={adminOnly ? 'primary' : 'success'}
                          variant="outlined"
                        />

                        {step.optional && (
                          <Chip
                            label="OPTIONAL"
                            size="small"
                            variant="outlined"
                          />
                        )}

                      </Stack>

                    </Stack>

                  </Paper>

                </Grid>
              );
            })}

          </Grid>


          {/* Protocol images */}

          <Alert
            severity="info"
            icon={<InfoOutlinedIcon />}
            sx={{ alignItems: 'flex-start' }}
          >

            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, mb: 0.5 }}
            >
              Protocol images
            </Typography>

            <Typography variant="body2">
              If a property protocol includes images, upload them to the
              server <code>permanent_files</code> directory before
              referencing them in the protocol.
            </Typography>

            <Box
              component="pre"
              sx={{
                mt: 2,
                mb: 0,
                p: 1.5,
                overflowX: 'auto',
                borderRadius: 1,
                bgcolor: 'grey.900',
                color: 'common.white',
                fontSize: '0.75rem',
              }}
            >
{`scp /home/my/location/permanent_files/protocols/* \\
snail@REMOTE_IP_ADDRESS:/home/remote/littorina_database/permanent_files`}
            </Box>

          </Alert>

        </Stack>

      </Paper>


      {/* ============================================================= */}
      {/* PHASE 2                                                       */}
      {/* ============================================================= */}

      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 2,
        }}
      >

        <Stack spacing={3}>

          {/* Phase title */}

          <Stack direction="row" spacing={2} alignItems="flex-start">

            <Box
              sx={{
                minWidth: 42,
                height: 42,
                borderRadius: 1.5,
                bgcolor: 'success.main',
                color: 'success.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
              }}
            >
              2
            </Box>

            <Stack spacing={0.5}>

              <Typography variant="h5">
                Upload organism data
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Once the metadata setup is complete, administrators and
                Group Leaders can create, modify, or delete organism
                records in batch.
              </Typography>

            </Stack>

          </Stack>


          {/* CSV explanation */}

          <Box
            sx={{
              p: 2.5,
              bgcolor: 'background.default',
              borderRadius: 2,
              border: 1,
              borderColor: 'divider',
            }}
          >

            <Stack spacing={2}>

              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                CSV template structure
              </Typography>

              <Typography variant="body2" color="text.secondary">
                The organism template begins with four static columns:
              </Typography>


              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                useFlexGap
              >

                <Chip label="ORGANISM ID" size="small" />
                <Chip label="SPECIES" size="small" />
                <Chip label="SAMPLING AREA" size="small" />
                <Chip label="PROJECTS" size="small" />

              </Stack>


              <Typography variant="body2" color="text.secondary">
                These are followed by dynamic columns corresponding to the
                pre-configured trait/feature-property system.{' '}
                <strong>ORGANISM ID</strong> is the mandatory primary
                identifier.
              </Typography>


              <Typography variant="body2" color="text.secondary">
                Dynamic column headers must exactly match the template
                identifiers configured during the trait/feature-property
                setup. Values containing commas should be sanitized or
                commas should be replaced with semicolons to prevent CSV
                parsing conflicts.
              </Typography>

            </Stack>

          </Box>


          {/* Batch button */}

          <Box>
            <Button
              variant="contained"
              href="/dashboard/organisms/batch/create"
              endIcon={<ArrowForwardIcon />}
            >
              Go to Batch Organism Upload
            </Button>
          </Box>


          <Typography variant="body2" color="text.secondary">
            Batch jobs are processed asynchronously by the scheduler.
            Execution status and error logs can be monitored from the
            batch-processing interface.
          </Typography>

        </Stack>

      </Paper>

          {/* ============================================================= */}
      {/* PHASE 3                                                       */}
      {/* ============================================================= */}

      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 2,
        }}
      >
        <Stack spacing={3}>

          {/* Phase title */}

          <Stack direction="row" spacing={2} alignItems="flex-start">

            <Box
              sx={{
                minWidth: 42,
                height: 42,
                borderRadius: 1.5,
                bgcolor: 'warning.main',
                color: 'warning.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
              }}
            >
              3
            </Box>

            <Stack spacing={0.5}>

              <Typography variant="h5">
                Review and process batch submissions
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Uploaded batch files must be reviewed by an administrator
                or curator before the system applies the requested changes
                to the database.
              </Typography>

            </Stack>

          </Stack>


          {/* Submitted status */}

          <Alert severity="info">

            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, mb: 0.5 }}
            >
              After submitting a batch
            </Typography>

            <Typography variant="body2">
              New batch processes initially appear with the{' '}
              <strong>Submitted</strong> status. Administrators and Group
              Leaders can monitor their batch processes from the Batch
              processes page. The batch will remain pending until it is
              reviewed by an administrator or curator.
            </Typography>

          </Alert>


          {/* Batch processes button */}

          <Box>
            <Button
              variant="outlined"
              href="/dashboard/batch"
              endIcon={<ArrowForwardIcon />}
            >
              Go to Batch Processes
            </Button>
          </Box>


          {/* Admin curation workflow */}

          <Box
            sx={{
              p: 2.5,
              bgcolor: 'background.default',
              borderRadius: 2,
              border: 1,
              borderColor: 'divider',
            }}
          >

            <Stack spacing={2.5}>

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
                useFlexGap
              >

                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700 }}
                >
                  Batch curation workflow
                </Typography>

                <Chip
                  label="ADMIN / CURATOR"
                  size="small"
                  color="primary"
                  variant="outlined"
                />

              </Stack>


              {/* Step 3.1 */}

              <Stack direction="row" spacing={2} alignItems="flex-start">

                <Box
                  sx={{
                    minWidth: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  3.1
                </Box>

                <Stack spacing={0.5}>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Open the submitted batch
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    On the Batch processes page, locate a process with
                    <strong> Submitted</strong> status and click the{' '}
                    <strong>Review</strong> button.
                  </Typography>

                </Stack>

              </Stack>


              {/* Step 3.2 */}

              <Stack direction="row" spacing={2} alignItems="flex-start">

                <Box
                  sx={{
                    minWidth: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  3.2
                </Box>

                <Stack spacing={0.5}>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Inspect the uploaded file
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Download the original file using the{' '}
                    <strong>Download</strong> button and verify that the
                    data are correct, consistently formatted, and properly
                    standardized.
                  </Typography>

                </Stack>

              </Stack>


              {/* Step 3.3 */}

              <Stack direction="row" spacing={2} alignItems="flex-start">

                <Box
                  sx={{
                    minWidth: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  3.3
                </Box>

                <Stack spacing={1} sx={{ flex: 1 }}>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Approve or reject the batch
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    After reviewing the file, choose the appropriate
                    curation outcome:
                  </Typography>


                  <Grid container spacing={2}>

                    <Grid item xs={12} md={6}>

                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          height: '100%',
                          borderColor: 'success.main',
                        }}
                      >

                        <Stack spacing={1}>

                          <Chip
                            label="APPROVE"
                            color="success"
                            size="small"
                            sx={{ alignSelf: 'flex-start' }}
                          />

                          <Typography variant="body2">
                            Approve the batch when the uploaded file and
                            its data are correct and properly standardized.
                            The system will then process the requested
                            database changes.
                          </Typography>

                        </Stack>

                      </Paper>

                    </Grid>


                    <Grid item xs={12} md={6}>

                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          height: '100%',
                          borderColor: 'error.main',
                        }}
                      >

                        <Stack spacing={1}>

                          <Chip
                            label="REJECT"
                            color="error"
                            size="small"
                            sx={{ alignSelf: 'flex-start' }}
                          />

                          <Typography variant="body2">
                            Reject the batch if you identify errors,
                            inconsistencies, or data that require correction
                            before they can be processed.
                          </Typography>

                        </Stack>

                      </Paper>

                    </Grid>

                  </Grid>


                  <Typography variant="body2" color="text.secondary">
                    In either case, the curator can document the decision
                    in the <strong>Results of curation</strong> field.
                  </Typography>

                </Stack>

              </Stack>


              {/* Step 3.4 */}

              <Stack direction="row" spacing={2} alignItems="flex-start">

                <Box
                  sx={{
                    minWidth: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  3.4
                </Box>

                <Stack spacing={0.5}>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Wait for batch processing
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Once approved, the system automatically processes the
                    batch and applies the corresponding changes to the
                    database. A successfully executed process will appear
                    with the <strong>Completed</strong> status.
                  </Typography>

                </Stack>

              </Stack>

            </Stack>

          </Box>


          {/* Materialized views */}

          <Alert severity="warning">

            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, mb: 0.5 }}
            >
              Making processed data available
            </Typography>

            <Typography variant="body2">
              Materialized views are refreshed automatically once a day at
              <strong> 2:00 AM</strong>. If the newly processed data should
              become available immediately, an administrator can use the{' '}
              <strong>Refresh materialized views</strong> button on the
              Batch processes page.
            </Typography>

          </Alert>

        </Stack>

      </Paper>

      {/* ============================================================= */}
      {/* RECOMMENDED ORDER                                             */}
      {/* ============================================================= */}

      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
          borderLeft: 4,
          borderLeftColor: 'primary.main',
          borderRadius: 1,
        }}
      >

        <Typography variant="body2">
          <strong>Recommended order:</strong>{' '}
          Users → Species → Habitats → Locations → Sampling areas →
          Projects → Traits, features & properties → Organism data.
          External datasets can be added at any time.
        </Typography>

      </Paper>

    </Stack>
  );
}
