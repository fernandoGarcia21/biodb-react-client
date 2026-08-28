"use client";
import * as React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

export function CsvTemplateStructure(): React.JSX.Element {
  return (
    <Accordion
      defaultExpanded={false}
      sx={{
        bgcolor: 'background.default',
        borderRadius: 2,
        border: 1,
        borderColor: 'divider',
        '&:before': { display: 'none' },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
          CSV template structure
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>

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
            pre-configured trait/feature-property system. The requirements
            for creating (C), updating (U), and deleting (D) organism
            records are summarized below.
          </Typography>


          {/* Template table */}

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              borderRadius: 2,
              overflowX: 'auto',
            }}
          >
            <Table
              size="small"
              sx={{
                minWidth: 900,
                '& th': {
                  fontWeight: 700,
                  bgcolor: 'action.hover',
                },
                '& td, & th': {
                  verticalAlign: 'top',
                },
              }}
            >

              <TableHead>

                <TableRow>
                  <TableCell rowSpan={2}>
                    Template column
                  </TableCell>

                  <TableCell align="center" colSpan={3}>
                    Is required
                  </TableCell>

                  <TableCell rowSpan={2}>
                    Description
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell align="center">C</TableCell>
                  <TableCell align="center">U</TableCell>
                  <TableCell align="center">D</TableCell>
                </TableRow>

              </TableHead>


              <TableBody>

                {/* ORGANISM ID */}

                <TableRow>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700 }}
                    >
                      ORGANISM ID
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label="Yes"
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label="Yes"
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label="Yes"
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      Standard and unique identifier of the individual.
                      The format follows the convention defined by the{' '}
                      <em>Littorina</em> community:{' '}
                      <strong>
                        ProjectInternalIDSnailID_otherRelevantInfoIfNeeded
                      </strong>.
                      {' '}<em>ProjectInternalID</em> and <em>SnailID</em> are not
                      the unique numeric identifiers generated by the database, but
                      internal identifiers defined by the research group. 
                      {' '}<em>ProjectInternalID</em>{' '}can be found in the Project module.
                    </Typography>
                  </TableCell>
                </TableRow>


                {/* SPECIES */}

                <TableRow>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700 }}
                    >
                      SPECIES
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label="Yes"
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label="No"
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label="No"
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      Internal code of the species as defined by the
                      administrator in the Species module. For example,
                      LS for <em>L. saxatilis</em> or LA for{' '}
                      <em>L. arcana</em>.
                    </Typography>
                  </TableCell>
                </TableRow>


                {/* SAMPLING AREA */}

                <TableRow>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700 }}
                    >
                      SAMPLING AREA
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label="Yes"
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label="No"
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label="No"
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      Numeric identifier of the sampling area where the
                      individual was collected. Sampling area identifiers
                      can be found in the Sampling Area module.
                    </Typography>
                  </TableCell>
                </TableRow>


                {/* PROJECTS */}

                <TableRow>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700 }}
                    >
                      PROJECTS
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label="No"
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label="No"
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label="No"
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      One or more numeric identifiers of projects associated
                      with the individual. If more than one project is
                      specified, the values must be separated by a semicolon
                      (;). Project identifiers can be found in the Project
                      module.
                    </Typography>
                  </TableCell>
                </TableRow>


                {/* DYNAMIC COLUMNS */}

                <TableRow>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700 }}
                    >
                      Dynamic property columns
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label="No"
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label="No"
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label="No"
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      Each dynamic column header must correspond exactly to
                      a configuration in the <em>Template column</em> field
                      within the Trait Properties module of the database.
                    </Typography>
                  </TableCell>
                </TableRow>

              </TableBody>

            </Table>
          </TableContainer>


          {/* C/U/D legend */}

          <Typography
            variant="caption"
            color="text.secondary"
          >
            <strong>C</strong> = Create ·{' '}
            <strong>U</strong> = Update ·{' '}
            <strong>D</strong> = Delete
          </Typography>


          {/* Important dynamic-column note */}

          <Alert severity="info">
            <Typography variant="body2">
              <strong>Important:</strong> Each dynamic column header must
              exactly match the value configured in the{' '}
              <em>Template column</em> field of the corresponding property
              in the Trait Properties module.
            </Typography>
          </Alert>


          {/* CSV formatting note */}

          <Typography variant="body2" color="text.secondary">
            Values containing commas should be sanitized or commas should
            be replaced with semicolons to prevent CSV parsing conflicts.
          </Typography>

        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
