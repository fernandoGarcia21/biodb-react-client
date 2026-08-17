'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import { useColorScheme } from '@mui/material/styles';

import { NoSsr } from '@/components/core/no-ssr';
import { useLogoContext } from '@/contexts/logo-context';

const HEIGHT = 50;
const WIDTH = 60;

type Color = 'dark' | 'light';
 
export interface LogoProps {
  color?: Color;
  emblem?: boolean;
  height?: number;
  width?: number;
}

export function Logo({ color = 'dark', emblem, height = HEIGHT, width = WIDTH }: LogoProps): React.JSX.Element {
  const { dbName, dbNameSuffix, logoSrc, clearLogo } = useLogoContext();
  const url = logoSrc ?? undefined;
  const dbNameToDisplay = dbName ?? 'FlexBioDB';
  const dbNameSuffixToDisplay = dbNameSuffix ?? '';

  return (
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
        gap: 1.5,
      }}
    >
      <Box
        alt="logo"
        component="img"
        sx={{ display: 'block', flexShrink: 0 }}
        height={height}
        onError={() => {
          if (!emblem) {
            clearLogo();
          }
        }}
        src={url}
        style={{ maxWidth: `${width}px` }}
      />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          fontSize: 30,
          fontWeight: 600,
          gap: 0.0,
          lineHeight: 1.2,
          textAlign: 'left',
        }}
      >
        <Box component="span" sx={{ color: color === 'dark' ? '#121621' : '#FFFFFF', textDecoration: 'none' }}>
          {dbNameToDisplay}
        </Box>
        <Box component="span" sx={{ color: '#7DD3FC', textDecoration: 'none' }}>
          {dbNameSuffixToDisplay}
        </Box>
      </Box>
    </Box>
  ); 
}

export interface DynamicLogoProps {
  colorDark?: Color;
  colorLight?: Color;
  emblem?: boolean;
  height?: number;
  width?: number;
}

export function DynamicLogo({
  colorDark = 'light',
  colorLight = 'dark',
  height = HEIGHT,
  width = WIDTH,
  ...props
}: DynamicLogoProps): React.JSX.Element {
  const { colorScheme } = useColorScheme();
  const color = colorScheme === 'dark' ? colorDark : colorLight;

  return (
    <NoSsr fallback={<Box sx={{ height: `${height}px`, width: `${width}px` }} />}>
      <Logo color={color} height={height} width={width} {...props} />
    </NoSsr>
  );
}
