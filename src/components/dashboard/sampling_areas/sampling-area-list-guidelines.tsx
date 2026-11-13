'use client';

import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Alert from '@mui/material/Alert';
import { darken, lighten } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { getHabitatCodesRequest, getHabitatStructuresRequest } from '@/api/habitatCodes';
import type { HabitatCodesResponse } from './habitat-code-selector';
import { SamplingAreaGuidelines, contactZoneGuidance, descriptionGuidance, photographGuidance } from './sampling-area-guidelines';
import { paths } from '@/paths';

export function SamplingAreaListGuidelines(): React.JSX.Element {
  const [descriptors, setDescriptors] = React.useState<HabitatCodesResponse>([]);
  const [structures, setStructures] = React.useState<{ id: number; name: string; description?: string | null }[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let active = true;
    async function load(): Promise<void> {
      const results = await Promise.allSettled([getHabitatCodesRequest(), getHabitatStructuresRequest()]);
      if (!active) return;
      const [codes, habitatStructures] = results;
      if (codes.status === 'fulfilled') {
        setDescriptors([...codes.value.data].sort((a, b) => a.position_number - b.position_number));
      }
      if (habitatStructures.status === 'fulfilled') setStructures(habitatStructures.value.data);
      if (results.some((result) => result.status === 'rejected')) {
        setError('Some habitat definitions could not be loaded. Please reload the page to try again.');
      }
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, []);

  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMore />} id="sampling-area-guidelines-header" aria-controls="sampling-area-guidelines-content"
        sx={(theme) => {
          const light = theme.palette.mode === 'light';
          const background = (light ? lighten : darken)(theme.palette.info.light, 0.9);
          return {
            bgcolor: background,
            color: (light ? darken : lighten)(theme.palette.info.light, 0.6),
            '&:hover': { bgcolor: background },
            '& .MuiAccordionSummary-expandIconWrapper': { color: 'inherit' },
          };
        }}
      >
        <Typography variant="h6">Sampling area and habitat classification guidelines</Typography>
      </AccordionSummary>
      <AccordionDetails id="sampling-area-guidelines-content">
        <Stack spacing={2}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <p>
              <strong>Sampling area</strong> is the finest geographical unit, representing a specific shore segment, 
              <strong> typically around 100 m in length</strong>, delimited by precise geospatial boundaries.
              The <strong>Id</strong> column in the table below is the consecutive number
              assigned automatically by the system when a sampling area is created. Use this
              number to associate an organism with a sampling area during organism batch processing.
              In the CSV template column <strong>SAMPLING AREA</strong>, only one sampling area
              identifier can be associated with an individual and this is <strong>required </strong>
              at the time of organism creation.
            </p>
            <p>
              <strong>Description</strong> provides additional information about the sampling area and the sampling procedure, 
              such as the approximate extent of the sampled area, shore level or tidal height, 
              identifiable landmarks, and whether high-precision instruments 
              (e.g., high-precision GPS or a total station) were used.
              <br></br>
              If individual organisms were positioned using a total station, 
              describe the instrument location, reference orientation (backsight), 
              and any other information needed to interpret their local coordinates (X, Y, Z), 
              which are recorded separately under the <strong><em>Local coordinates</em></strong> trait.
            </p>
            <p>
              <strong>Latitude and longitude</strong> in decimal degrees, using WGS84 (EPSG:4326).
            </p>
          </Alert>
          <SamplingAreaGuidelines />
          
          <Typography variant="subtitle1">Habitat codes</Typography>
          <Typography variant="body2">
            The habitat code describes the environmental characteristics of the sampling area using a set of pre-defined components
            {descriptors.length ? `: ${descriptors.map((item) => item.name).join(', ')}.` : '.'}
            {' '}{descriptors.some((item) => item.allow_multiple)
              ? `Multiple codes may be selected for ${descriptors.filter((item) => item.allow_multiple).map((item) => item.name).join(', ')} when appropriate. `
              : ''}
            The habitat code does not indicate whether the sampling area is an ecotype contact zone.
          </Typography>
          {loading ? <Typography variant="body2">Loading habitat definitions…</Typography> : null}
          {error ? <Alert severity="warning">{error}</Alert> : null}
          {descriptors.map((descriptor) => (
            <Box key={descriptor.id}>
              <Typography variant="subtitle2">{descriptor.name} ({descriptor.allow_multiple ? 'One or more' : 'Only one'})</Typography>
              <Box component="dl" sx={{ m: 0 }}>
                {[...descriptor.codes].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)).map((code) => (
                  <Box key={code.id} sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    <Typography component="dt" variant="body2" sx={{ fontWeight: 700, minWidth: 32 }}>{code.code}</Typography>
                    <Typography component="dd" variant="body2" sx={{ m: 0 }}>{code.meaning}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
          <Typography variant="subtitle1">Habitat structure</Typography>
          <Typography variant="body2">Habitat structure describes the spatial arrangement of habitats within the sampling area.</Typography>
          <Box component="dl" sx={{ m: 0 }}>
            {structures.map((structure) => (
              <Box key={structure.id} sx={{ mb: 1 }}>
                <Typography component="dt" variant="subtitle2">{structure.name}</Typography>
                <Typography component="dd" variant="body2" sx={{ m: 0 }}>{structure.description || 'No description available.'}</Typography>
              </Box>
            ))}
          </Box>
          <Typography variant="subtitle1">SA in a contact zone</Typography>
          <Typography variant="body2">{contactZoneGuidance}</Typography>
          <Typography variant="subtitle1">Photograph</Typography>
          <Typography variant="body2">{photographGuidance}</Typography>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
