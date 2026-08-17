import * as React from 'react';
import RouterLink from 'next/link';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { paths } from '@/paths';
import { DynamicLogo } from '@/components/core/logo';
import { SideNav } from '@/components/dashboard/layout/side-nav';
import GlobalStyles from '@mui/material/GlobalStyles';
import { AuthGuard } from './auth-guard';
import { MainNav } from '../dashboard/layout/main-nav';

export interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <AuthGuard>
      <GlobalStyles
      styles={{
        body: {
          '--MainNav-height': '56px',
          '--MainNav-zIndex': 1000,
          '--SideNav-width': '280px',
          '--SideNav-zIndex': 1100,
          '--MobileNav-width': '320px',
          '--MobileNav-zIndex': 1100,
        },
      }}
    />
    <Box
            sx={{
              bgcolor: 'var(--mui-palette-background-default)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              minHeight: '100%',
              flexGrow: 1,
            }}
          >
        <SideNav />
        <Box sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column', pl: { lg: 'var(--SideNav-width)' } }}>
          <MainNav />
            <main>
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                <Box
                  component={RouterLink}
                  href={paths.home}
                  sx={{
                    display: 'inline-block',
                    fontSize: 0,
                    textDecoration: 'none',
                    '&:hover, &:focus, &:active, &:visited': { textDecoration: 'none' },
                  }}
                >
                  <DynamicLogo colorDark="light" colorLight="dark" height={100} width={422} />
                </Box>
              </Box>
              <Box sx={{ alignItems: 'center', display: 'flex', flex: '1 1 auto', justifyContent: 'center', p: 3 }}>
                <Box sx={{ maxWidth: '450px', width: '100%' }}>{children}</Box>
              </Box>
            </main>
        </Box>
      </Box>
    </AuthGuard>
  );
}
