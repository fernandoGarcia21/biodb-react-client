import * as React from 'react';
import type { Viewport } from 'next';

import '@/styles/global.css';
import 'leaflet/dist/leaflet.css';

import { LogoProvider } from '@/contexts/logo-context';
import { UserProvider } from '@/contexts/user-context';
import { LocalizationProvider } from '@/components/core/localization-provider';
import { ThemeProvider } from '@/components/core/theme-provider/theme-provider';
import { CookieConsentBanner } from '@/components/core/cookie-consent-banner';

export const viewport = { width: 'device-width', initialScale: 1 } satisfies Viewport;

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <html lang="en">
      <body>
        <LocalizationProvider>
          <LogoProvider>
            <UserProvider>
              <ThemeProvider>
                {children}
                <CookieConsentBanner />
              </ThemeProvider>
            </UserProvider>
          </LogoProvider>
        </LocalizationProvider>
      </body>
    </html>
  );
}
