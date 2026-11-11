'use client';

import * as React from 'react';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';

import type { HabitatDescriptor, HabitatDescriptorFilter, HabitatFilterState } from '@/lib/habitat-codes/filter';

interface HabitatCodeFilterProps {
  descriptors: HabitatDescriptor[];
  value: HabitatFilterState;
  onChange: (filters: HabitatFilterState) => void;
  matchingCount?: number;
  children?: React.ReactNode;
  additionalActiveCount?: number;
  onClear?: () => void;
}

export function HabitatCodeFilter({ descriptors, value, onChange, matchingCount, children, additionalActiveCount = 0, onClear }: HabitatCodeFilterProps): React.JSX.Element {
  const id = React.useId();
  const [expanded, setExpanded] = React.useState(false);
  const ordered = React.useMemo(() => [...descriptors].sort((a, b) => a.position_number - b.position_number).map((descriptor) => ({
    ...descriptor,
    codes: [...descriptor.codes].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)),
  })), [descriptors]);
  const activeCount = Object.values(value).filter((filter) => filter.codes.length > 0).length + additionalActiveCount;

  function update(descriptorId: number, filter: HabitatDescriptorFilter): void {
    onChange({ ...value, [descriptorId]: filter });
  }

  return (
    <Box sx={{ minWidth: 0 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
        <Button type="button" variant="outlined" sx={{ bgcolor: '#e3f2fd', color: '#1565c0', borderColor: '#90caf9', '&:hover': { bgcolor: '#bbdefb', borderColor: '#64b5f6' } }} aria-expanded={expanded} aria-controls={`${id}-panel`} onClick={() => { setExpanded((open) => !open); }} endIcon={expanded ? <ExpandLess /> : <ExpandMore />}>
          Filter sampling areas by habitat{activeCount ? ` (${activeCount} active)` : ''}
        </Button>
        {matchingCount !== undefined ? <Typography variant="body2" color="text.secondary" role="status">{matchingCount} matching sampling areas</Typography> : null}
        <Button type="button" size="small" disabled={!activeCount} onClick={() => { onChange({}); onClear?.(); }}>Clear habitat filters</Button>
      </Stack>
      <Collapse in={expanded} id={`${id}-panel`}>
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 3, bgcolor: 'transparent', mt: 1 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))', xl: 'repeat(6, minmax(0, 1fr))' }, gap: 3, alignItems: 'start' }}>
            {children}
            {!ordered.length ? <Typography variant="body2" color="text.secondary">Habitat descriptor configuration is unavailable.</Typography> : null}
            {ordered.map((descriptor) => {
              const filter = value[descriptor.id] ?? { codes: [], mode: 'ANY' };
              return (
                <FormControl component="fieldset" key={descriptor.id} aria-labelledby={`${id}-${descriptor.id}`} sx={{ minWidth: 0 }}>
                  <Stack spacing={1}>
                    <Typography id={`${id}-${descriptor.id}`} variant="subtitle2" sx={{ fontWeight: 600 }}>{descriptor.name}</Typography>
                      <ToggleButtonGroup
                        exclusive size="small" sx={{ '& .MuiToggleButton-root': { fontSize: '0.6875rem' } }} value={descriptor.allow_multiple ? filter.mode : 'ANY'} aria-label={`Matching mode for ${descriptor.name}`}
                        onChange={(_, mode: 'ANY' | 'ALL' | null) => { if (mode) update(descriptor.id, { ...filter, mode: descriptor.allow_multiple ? mode : 'ANY' }); }}
                      >
                        <ToggleButton value="ANY">ANY selected</ToggleButton>
                        {descriptor.allow_multiple ? <ToggleButton value="ALL">ALL selected</ToggleButton> : null}
                      </ToggleButtonGroup>
                    <FormGroup aria-labelledby={`${id}-${descriptor.id}`}>
                      {descriptor.codes.map((option) => (
                        <FormControlLabel key={option.id} label={option.meaning} sx={{ mx: 0, py: 0.25, '&:not(:last-child)': { borderBottom: '1px solid', borderColor: 'divider' }, '& .MuiFormControlLabel-label': { fontSize: '0.8125rem' } }} control={
                          <Checkbox checked={filter.codes.includes(option.code)} onChange={(_, checked) => {
                            update(descriptor.id, { ...filter, codes: checked ? [...filter.codes, option.code] : filter.codes.filter((code) => code !== option.code) });
                          }} />
                        } />
                      ))}
                    </FormGroup>
                  </Stack>
                </FormControl>
              );
            })}
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}

