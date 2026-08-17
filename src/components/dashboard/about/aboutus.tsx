'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
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

export interface AboutUsSetting {
  name: string;
  value: string;
}

export function AboutUs({
  aboutUsSettings = [],
}: {
  aboutUsSettings: AboutUsSetting[];
}) {
  const titleMap: Record<string, string> = {
    ABOUT_MISSION: 'Our Mission',
    ABOUT_SCOPE: 'Scope & Methodology',
    ABOUT_CITE: 'How to Cite',
    ABOUT_COLLABORATION: 'Collaboration & Support',
    ABOUT_CONTACT: 'Inquiries & Feedback',
  };

  const orderedNames = [
    'ABOUT_MISSION',
    'ABOUT_SCOPE',
    'ABOUT_CITE',
    'ABOUT_COLLABORATION',
    'ABOUT_CONTACT',
  ];

  const orderedSettings = orderedNames
    .map((name) => aboutUsSettings.find((setting) => setting.name === name))
    .filter((setting): setting is AboutUsSetting => setting !== undefined);

  return (
    <Card>
      <Box sx={{ p: 3 }}>
        <Stack spacing={4}>
          {orderedSettings.map((setting, index) => (
            <Box key={setting.name}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                {titleMap[setting.name]}
              </Typography>
              <Box
                dangerouslySetInnerHTML={{ __html: setting.value }}
                sx={{
                  '& p': { mb: 1 },
                  '& ul, & ol': { pl: 3, mb: 1 },
                  '& a': { color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } },
                }}
              />
              {index < orderedSettings.length - 1 && <Divider sx={{ mt: 3 }} />}
            </Box>
          ))}
        </Stack>
      </Box>
    </Card>
  );
}
