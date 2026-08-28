'use client';

import * as React from 'react';

import {
  getDBLogoImageRequest,
} from '@/api/files';

import {
  getDBNameRequest,
  getDBWelcomeMessageRequest,
} from '@/api/settings';

import {
  SETTINGS_DB_NAME,
  SETTINGS_DB_NAME_SUFFIX,
} from '@/constants';

const LOGO_CACHE_KEY = 'biodb:db-logo-data-url';
const DB_NAME_CACHE_KEY = 'biodb:db-name';
const DB_NAME_SUFFIX_CACHE_KEY = 'biodb:db-name-suffix';
const WELCOME_MESSAGE_CACHE_KEY = 'biodb:db-welcome-message';


function readCachedLogo(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage.getItem(LOGO_CACHE_KEY);
  } catch {
    return null;
  }
}


function readCachedDBName(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage.getItem(DB_NAME_CACHE_KEY);
  } catch {
    return null;
  }
}


function readCachedDBNameSuffix(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage.getItem(DB_NAME_SUFFIX_CACHE_KEY);
  } catch {
    return null;
  }
}


function readCachedWelcomeMessage(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage.getItem(WELCOME_MESSAGE_CACHE_KEY);
  } catch {
    return null;
  }
}


function persistCachedLogo(logoSrc: string | null): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (logoSrc) {
      window.localStorage.setItem(LOGO_CACHE_KEY, logoSrc);
    } else {
      window.localStorage.removeItem(LOGO_CACHE_KEY);
    }
  } catch {
    // Ignore storage failures and keep the in-memory value.
  }
}


function persistCachedDBName(
  dbName: string | null
): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (dbName) {
      window.localStorage.setItem(
        DB_NAME_CACHE_KEY,
        dbName
      );
    } else {
      window.localStorage.removeItem(
        DB_NAME_CACHE_KEY
      );
    }
  } catch {
    // Ignore storage failures and keep the in-memory value.
  }
}


function persistCachedDBNameSuffix(
  dbNameSuffix: string | null
): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (dbNameSuffix) {
      window.localStorage.setItem(
        DB_NAME_SUFFIX_CACHE_KEY,
        dbNameSuffix
      );
    } else {
      window.localStorage.removeItem(
        DB_NAME_SUFFIX_CACHE_KEY
      );
    }
  } catch {
    // Ignore storage failures and keep the in-memory value.
  }
}


function persistCachedDbWelcomeMessage(
  dbWelcomeMessage: string | null
): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (dbWelcomeMessage) {
      window.localStorage.setItem(
        WELCOME_MESSAGE_CACHE_KEY,
        dbWelcomeMessage
      );
    } else {
      window.localStorage.removeItem(
        WELCOME_MESSAGE_CACHE_KEY
      );
    }
  } catch {
    // Ignore storage failures and keep the in-memory value.
  }
}


function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(
          new Error(
            'Unable to convert logo blob to data URL.'
          )
        );
      }
    };

    reader.onerror = () => {
      reject(
        reader.error ??
          new Error('Unable to read logo blob.')
      );
    };

    reader.readAsDataURL(blob);
  });
}


export interface LogoContextValue {
  dbName: string | null;
  dbNameSuffix: string | null;
  logoSrc: string | null;
  dbWelcomeMessage: string | null;

  clearLogo: () => void;

  setDbName: React.Dispatch<
    React.SetStateAction<string | null>
  >;
}


export const LogoContext =
  React.createContext<
    LogoContextValue | undefined
  >(undefined);


export interface LogoProviderProps {
  children: React.ReactNode;
}


export function LogoProvider({
  children,
}: LogoProviderProps): React.JSX.Element {
  const [logoSrc, setLogoSrc] =
    React.useState<string | null>(
      () => readCachedLogo()
    );

  const [dbName, setDbName] =
    React.useState<string | null>(
      () => readCachedDBName()
    );

  const [dbNameSuffix, setDbNameSuffix] =
    React.useState<string | null>(
      () => readCachedDBNameSuffix()
    );

  const [
    dbWelcomeMessage,
    setDbWelcomeMessage,
  ] = React.useState<string | null>(
    () => readCachedWelcomeMessage()
  );

  const fallbackUrl =
    '/assets/flexBioDB.png';


  const clearLogo =
    React.useCallback((): void => {
      setLogoSrc(null);
      persistCachedLogo(null);
    }, []);


  /*
   * Load database logo
   */
  React.useEffect(() => {
    if (logoSrc) {
      return;
    }

    let isActive = true;

    const loadLogo =
      async (): Promise<void> => {
        try {
          const logoResponse =
            await getDBLogoImageRequest();

          if (
            !isActive ||
            !logoResponse?.data
          ) {
            return;
          }

          const dataUrl =
            await blobToDataUrl(
              logoResponse.data
            );

          if (!isActive) {
            return;
          }

          if (dataUrl) {
            setLogoSrc(dataUrl);
            persistCachedLogo(dataUrl);
          } else {
            console.warn(
              'Logo data URL is empty, using fallback logo.'
            );

            setLogoSrc(fallbackUrl);
            persistCachedLogo(
              fallbackUrl
            );
          }
        } catch {
          if (isActive) {
            console.warn(
              'Failed to load logo from backend, using fallback logo.'
            );

            setLogoSrc(fallbackUrl);
            persistCachedLogo(
              fallbackUrl
            );
          }
        }
      };

    loadLogo();

    return () => {
      isActive = false;
    };
  }, [logoSrc]);


  /*
   * Load database name
   *
   * document.title is intentionally NOT modified here.
   * SEO metadata is generated server-side by Next.js.
   */
  React.useEffect(() => {
    let isActive = true;

    const loadDBName =
      async (): Promise<void> => {
        try {
          const dbNameResponse =
            await getDBNameRequest();

          if (
            !isActive ||
            !dbNameResponse?.data
          ) {
            return;
          }

          const tmpDBNameSetting =
            dbNameResponse.data.find(
              (item: any) =>
                item.name ===
                SETTINGS_DB_NAME
            );

          const tmpDBNameSuffixSetting =
            dbNameResponse.data.find(
              (item: any) =>
                item.name ===
                SETTINGS_DB_NAME_SUFFIX
            );

          if (
            tmpDBNameSetting?.value
          ) {
            const tmpDBName =
              tmpDBNameSetting.value;

            const tmpDBNameSuffix =
              tmpDBNameSuffixSetting?.value ??
              null;

            setDbName(tmpDBName);

            setDbNameSuffix(
              tmpDBNameSuffix
            );

            persistCachedDBName(
              tmpDBName
            );

            persistCachedDBNameSuffix(
              tmpDBNameSuffix
            );
          } else {
            console.warn(
              'DB Name is empty, using default name.'
            );

            setDbName('FlexBioDB');
            setDbNameSuffix(null);
          }
        } catch {
          if (isActive) {
            console.warn(
              'Failed to load DB Name from backend, using default name.'
            );

            setDbName('FlexBioDB');
            setDbNameSuffix(null);
          }
        }
      };

    loadDBName();

    return () => {
      isActive = false;
    };
  }, []);


  /*
   * Load database welcome message
   */
  React.useEffect(() => {
    let isActive = true;

    const loadWelcomeMessage =
      async (): Promise<void> => {
        try {
          const response =
            await getDBWelcomeMessageRequest();

          if (
            !isActive ||
            !response?.data
          ) {
            return;
          }

          const welcomeMessageSetting =
              response.data.find(
                (item: any) =>
                  item.name === 'DB_WELCOME_MESSAGE'
              );

            const message =
              welcomeMessageSetting?.value?.trim();

          if (message) {
            setDbWelcomeMessage(
              message
            );

            persistCachedDbWelcomeMessage(
              message
            );
          } else {
            console.warn(
              'DB Welcome Message is empty, using default message.'
            );

            setDbWelcomeMessage(
              'Welcome to FlexBioDB!'
            );
          }
        } catch {
          if (isActive) {
            console.warn(
              'Failed to load DB Welcome Message from backend, using default message.'
            );

            setDbWelcomeMessage(
              'Welcome to FlexBioDB!'
            );
          }
        }
      };

    loadWelcomeMessage();

    return () => {
      isActive = false;
    };
  }, []);


  return (
    <LogoContext.Provider
      value={{
        dbName,
        dbNameSuffix,
        logoSrc,
        clearLogo,
        setDbName,
        dbWelcomeMessage,
      }}
    >
      {children}
    </LogoContext.Provider>
  );
}


export function useLogoContext():
  LogoContextValue {
  const context =
    React.useContext(LogoContext);

  if (!context) {
    throw new Error(
      'useLogoContext must be used within a LogoProvider.'
    );
  }

  return context;
}