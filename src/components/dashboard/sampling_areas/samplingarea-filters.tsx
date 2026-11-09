import * as React from 'react';
import Card from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormHelperText from '@mui/material/FormHelperText';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';

interface SamplingAreasFiltersProps {
  value: string;
  onChange: (value: string) => void;
}

export function SamplingAreasFilters({ value, onChange }: SamplingAreasFiltersProps): React.JSX.Element {
  return (
    <Card sx={{ p: 2 }}>
      <OutlinedInput
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputProps={{ 'aria-label': 'Search sampling areas', 'aria-describedby': 'sampling-area-search-help' }}
        fullWidth
        placeholder="Search sampling areas"
        startAdornment={
          <InputAdornment position="start">
            <MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" />
          </InputAdornment>
        }
        sx={{ maxWidth: '500px' }}
      />
      <FormHelperText id="sampling-area-search-help">Type at least 3 characters to search name, location, country, description, habitat structure, or habitat code.</FormHelperText>
    </Card>
  );
}
