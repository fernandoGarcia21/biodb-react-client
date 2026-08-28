import * as React from 'react';
import type { Metadata, Viewport } from 'next';

import '@/styles/global.css';
import 'leaflet/dist/leaflet.css';

import { LogoProvider } from '@/contexts/logo-context';
import { UserProvider } from '@/contexts/user-context';
import { LocalizationProvider } from '@/components/core/localization-provider';
import { ThemeProvider } from '@/components/core/theme-provider/theme-provider';
import { CookieConsentBanner } from '@/components/core/cookie-consent-banner';

import {
  SETTINGS_DB_NAME,
  SETTINGS_DB_NAME_SUFFIX,
} from '@/constants';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
} satisfies Viewport;

interface LayoutProps {
  children: React.ReactNode;
}

interface DBNameSetting {
  name: string;
  value: string;
}

export async function generateMetadata(): Promise<Metadata> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  let dbName = 'flexBioDB';

  if (apiUrl) {
    try {
      const response = await fetch(`${apiUrl}/db_name`, {
        next: { revalidate: 3600 },
      });

      if (response.ok) {
        const data: DBNameSetting[] = await response.json();

        const dbNameSetting = data.find(
          (item) => item.name === SETTINGS_DB_NAME
        );

        const dbNameSuffixSetting = data.find(
          (item) => item.name === SETTINGS_DB_NAME_SUFFIX
        );

        if (dbNameSetting?.value) {
          dbName =
            `${dbNameSetting.value}${dbNameSuffixSetting?.value ?? ''}`;
        }
      } else {
        console.warn(
          `Failed to load database name for metadata: ${response.status}`
        );
      }
    } catch (error) {
      console.error(
        'Failed to load database name for metadata:',
        error
      );
    }
  }

  return {
    metadataBase: new URL(
      siteUrl || 'http://localhost:8080'
    ),

    title: {
      default: dbName,
      template: `%s | ${dbName}`,
    },

    icons: {
      icon: apiUrl ? `${apiUrl}/images/favicon.ico` : '/favicon.ico',
    },
  };
}

export default function Layout({
  children,
}: LayoutProps): React.JSX.Element {
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