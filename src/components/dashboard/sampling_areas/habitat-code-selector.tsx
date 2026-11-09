'use client';

import * as React from 'react';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import RadioButtonChecked from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUnchecked from '@mui/icons-material/RadioButtonUnchecked';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import { z } from 'zod';

import { getHabitatCodesRequest } from '@/api/habitatCodes';

const descriptorSchema = z.object({
  id: z.number(),
  position_number: z.number(),
  name: z.string().min(1),
  allow_multiple: z.boolean(),
  codes: z.array(z.object({
    id: z.number(),
    code: z.string().min(1).refine((code) => !code.includes('-')),
    meaning: z.string(),
    display_order: z.number().nullish(),
  })).min(1),
});

export type HabitatDescriptor = z.infer<typeof descriptorSchema>;
export type HabitatCodesResponse = HabitatDescriptor[];
export type DescriptorSelections = Record<number, string[]>;

// Find a unique tokenization, including codes consisting of more than one character.
function parseSegment(segment: string, descriptor: HabitatDescriptor): string[] | null {
  const matches: string[][] = [];
  function visit(remaining: string, selected: string[]): void {
    if (matches.length > 1) return;
    if (!remaining) {
      if (selected.length && (descriptor.allow_multiple || selected.length === 1) &&
        (!selected.includes('U') || selected.length === 1)) matches.push(selected);
      return;
    }
    for (const { code } of descriptor.codes) {
      if (!selected.includes(code) && remaining.startsWith(code)) {
        visit(remaining.slice(code.length), [...selected, code]);
      }
    }
  }
  visit(segment, []);
  return matches.length === 1 ? matches[0] : null;
}

interface HabitatCodeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  onValidityChange: (valid: boolean) => void;
  error?: string;
  disabled?: boolean;
}

export function HabitatCodeSelector({ value = '', onChange, onBlur, onValidityChange, error, disabled }: HabitatCodeSelectorProps): React.JSX.Element {
  const id = React.useId();
  const [expanded, setExpanded] = React.useState(false);
  const [descriptors, setDescriptors] = React.useState<HabitatCodesResponse>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState('');

  React.useEffect(() => {
    let active = true;
    async function load(): Promise<void> {
      try {
        const response: { data: unknown } = await getHabitatCodesRequest();
        const configuration = z.array(descriptorSchema).min(1).parse(response.data);
        const sorted = configuration.sort((a, b) => a.position_number - b.position_number).map((descriptor) => ({
          ...descriptor,
          codes: [...descriptor.codes].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)),
        }));
        if (new Set(sorted.map((descriptor) => descriptor.id)).size !== sorted.length ||
          sorted.some((descriptor) => new Set(descriptor.codes.map((option) => option.code)).size !== descriptor.codes.length)) {
          throw new Error('Duplicate habitat configuration identifiers');
        }
        if (active) setDescriptors(sorted);
      } catch {
        if (active) setLoadError('Unable to load habitat descriptors. Reload the page to try again.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  const segments = value.split('-');
  const selections: DescriptorSelections = {};
  let valid = !loading && !loadError && descriptors.length > 0 && segments.length === descriptors.length;
  for (const [index, descriptor] of descriptors.entries()) {
    const parsed = parseSegment(segments[index] ?? '', descriptor);
    selections[descriptor.id] = parsed ?? [];
    if (!parsed) valid = false;
  }

  const fieldError = error || (!loading && !loadError && !valid
    ? 'Enter a valid code for every descriptor, separated by hyphens, or use the selectors below.'
    : '');

  React.useEffect(() => { onValidityChange(valid); }, [valid, onValidityChange]);

  function changeTypedCode(nextValue: string): void {
    const parts = nextValue.split('-');
    const parsed = descriptors.map((descriptor, index) => parseSegment(parts[index] ?? '', descriptor));
    const complete = descriptors.length > 0 && parts.length === descriptors.length && parsed.every((selection) => selection !== null);
    // Preserve incomplete input while typing; normalize complete codes to API order.
    const nextCode = complete ? descriptors.map((descriptor, index) => descriptor.codes
      .filter((option) => parsed[index]?.includes(option.code))
      .map((option) => option.code).join('')).join('-') : nextValue;
    onChange(nextCode);
  }

  function changeSelection(descriptor: HabitatDescriptor, next: string[]): void {
    const previous = selections[descriptor.id];
    const exclusive = next.includes('U') ? (previous.includes('U') && next.length > 1 ? next.filter((code) => code !== 'U') : ['U']) : next;
    const updated = { ...selections, [descriptor.id]: exclusive };
    const generated = descriptors.map((item) => item.codes.filter((option) => updated[item.id].includes(option.code)).map((option) => option.code).join('')).join('-');
    onChange(generated);
  }

  return (
    <Stack spacing={1}>
      <FormControl fullWidth error={Boolean(fieldError)}>
        <InputLabel htmlFor={`${id}-code`}>Habitat code</InputLabel>
        <OutlinedInput id={`${id}-code`} label="Habitat code" value={value} disabled={disabled} onChange={(event) => { changeTypedCode(event.target.value); }} onBlur={onBlur} aria-describedby={fieldError ? `${id}-code-error` : undefined} />
        {fieldError ? <FormHelperText id={`${id}-code-error`}>{fieldError}</FormHelperText> : null}
      </FormControl>
      <Typography variant="body2" color="text.secondary">
        The habitat code describes the environmental characteristics of the sampling area using a set of pre-defined components
        {descriptors.length ? `: ${descriptors.map((descriptor) => descriptor.name).join(', ')}.` : '.'}
        {' '}{descriptors.some((descriptor) => descriptor.allow_multiple)
          ? `Multiple codes may be selected for ${descriptors.filter((descriptor) => descriptor.allow_multiple).map((descriptor) => descriptor.name).join(', ')} when appropriate. `
          : ''}
        The habitat code does not indicate whether the sampling area is an ecotype contact zone.
      </Typography>
      <Button type="button" onClick={() => { setExpanded((open) => !open); }} aria-expanded={expanded} aria-controls={`${id}-descriptors`} endIcon={expanded ? <ExpandLess /> : <ExpandMore />}>
        {expanded ? 'Hide habitat descriptors' : 'Edit habitat descriptors'}
      </Button>
      <Collapse in={expanded} id={`${id}-descriptors`}>
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 3, bgcolor: 'transparent', minWidth: 0 }}>
          <Stack spacing={2}>
            {loading ? <Alert severity="info">Loading habitat descriptors…</Alert> : null}
            {loadError ? <Alert severity="error">{loadError}</Alert> : null}
            {!loading && !loadError && !valid ? <Alert severity="warning">Select a valid option for every habitat descriptor before saving.</Alert> : null}
            <Stack spacing={2} divider={<Divider />}>
              {descriptors.map((descriptor) => (
                <FormControl key={descriptor.id} component="fieldset" aria-labelledby={`${id}-${descriptor.id}-label`} sx={{ minWidth: 0 }} fullWidth required error={!selections[descriptor.id].length} disabled={disabled}>
                  <Stack spacing={1}>
                    <Typography id={`${id}-${descriptor.id}-label`} variant="subtitle2" sx={{ fontWeight: 600 }}>{descriptor.name}{descriptor.allow_multiple ? ' (select multiple)' : ''}</Typography>
                    {descriptor.allow_multiple ? (
                      <FormGroup row aria-labelledby={`${id}-${descriptor.id}-label`} onBlur={onBlur}>
                        {descriptor.codes.map((option) => (
                          <FormControlLabel
                            key={option.id}
                            label={option.meaning}
                            control={
                              <Checkbox
                                value={option.code}
                                checked={selections[descriptor.id].includes(option.code)}
                                icon={<RadioButtonUnchecked />}
                                checkedIcon={<RadioButtonChecked />}
                                onChange={(_, checked) => {
                                  const current = selections[descriptor.id];
                                  changeSelection(descriptor, checked ? [...current, option.code] : current.filter((code) => code !== option.code));
                                }}
                              />
                            }
                          />
                        ))}
                      </FormGroup>
                    ) : (
                      <RadioGroup
                        row
                        aria-labelledby={`${id}-${descriptor.id}-label`}
                        name={`${id}-${descriptor.id}`}
                        value={selections[descriptor.id][0] ?? ''}
                        onBlur={onBlur}
                        onChange={(_, code) => { changeSelection(descriptor, [code]); }}
                      >
                        {descriptor.codes.map((option) => (
                          <FormControlLabel key={option.id} value={option.code} control={<Radio />} label={option.meaning} />
                        ))}
                      </RadioGroup>
                    )}
                  </Stack>
                </FormControl>
              ))}
            </Stack>
          </Stack>
        </Box>
      </Collapse>
    </Stack>
  );
}
