'use client';

import * as React from 'react';

import { getDBLogoImageRequest, getImageBlobRequest } from '@/api/files';
import { getDBNameRequest, getDBWelcomeMessageRequest } from '@/api/settings';
import { SETTINGS_DB_NAME, SETTINGS_DB_NAME_SUFFIX } from '@/constants';

const LOGO_CACHE_KEY = 'biodb:db-logo-data-url';
const FAVICON_CACHE_KEY = 'biodb:favicon-data-url';
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

function readCachedFavicon(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }
    try {
        return window.localStorage.getItem(FAVICON_CACHE_KEY);
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

function persistCachedFavicon(faviconSrc: string | null): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        if (faviconSrc) {
            window.localStorage.setItem(FAVICON_CACHE_KEY, faviconSrc);
        } else {
            window.localStorage.removeItem(FAVICON_CACHE_KEY);
        }
    } catch {
        // Ignore storage failures and keep the in-memory value.
    }
}

function persistCachedDBName(dbName: string | null): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        if (dbName) {
            window.localStorage.setItem(DB_NAME_CACHE_KEY, dbName);
        } else {
            window.localStorage.removeItem(DB_NAME_CACHE_KEY);
        }
    } catch {
        // Ignore storage failures and keep the in-memory value.
    }
}

function persistCachedDBNameSuffix(dbNameSuffix: string | null): void {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        if (dbNameSuffix) {
            window.localStorage.setItem(DB_NAME_SUFFIX_CACHE_KEY, dbNameSuffix);
        } else {
            window.localStorage.removeItem(DB_NAME_SUFFIX_CACHE_KEY);
        }
    } catch {
        // Ignore storage failures and keep the in-memory value.
    }
}

function persistCachedDbWelcomeMessage(dbWelcomeMessage: string | null): void {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        if (dbWelcomeMessage) {
            window.localStorage.setItem(WELCOME_MESSAGE_CACHE_KEY, dbWelcomeMessage);
        } else {
            window.localStorage.removeItem(WELCOME_MESSAGE_CACHE_KEY);
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
        reject(new Error('Unable to convert logo blob to data URL.'));
      }
    };

    reader.onerror = () => {
      reject(reader.error ?? new Error('Unable to read logo blob.'));
    };

    reader.readAsDataURL(blob);
  });
}

function updateDocumentFavicon(faviconSrc: string | null): void {
  if (typeof document === 'undefined' || !faviconSrc) {
    return;
  }

  const relValues = ['icon', 'shortcut icon'];

  relValues.forEach((relValue) => {
    let link = document.querySelector(`link[rel='${relValue}']`) as HTMLLinkElement | null;

    if (!link) {
      link = document.createElement('link');
      link.rel = relValue;
      document.head.appendChild(link);
    }

    link.href = faviconSrc;
  });
}

export interface LogoContextValue {
  dbName: string | null;
  dbNameSuffix: string | null;
  logoSrc: string | null;
  faviconSrc: string | null;
  dbWelcomeMessage: string | null;
  clearLogo: () => void;
  setDbName: React.Dispatch<React.SetStateAction<string | null>>;
  setFaviconSrc: React.Dispatch<React.SetStateAction<string | null>>;
}

export const LogoContext = React.createContext<LogoContextValue | undefined>(undefined);

export interface LogoProviderProps {
  children: React.ReactNode;
}

export function LogoProvider({ children }: LogoProviderProps): React.JSX.Element {
  const [logoSrc, setLogoSrc] = React.useState<string | null>(() => readCachedLogo());
  const [faviconSrc, setFaviconSrc] = React.useState<string | null>(() => readCachedFavicon());
  const [dbName, setDbName] = React.useState<string | null>(() => readCachedDBName());
  const [dbNameSuffix, setDbNameSuffix] = React.useState<string | null>(() => readCachedDBNameSuffix());
  const [dbWelcomeMessage, setDbWelcomeMessage] = React.useState<string | null>(() => readCachedWelcomeMessage());
  const fallbackUrl = '/assets/flexBioDB.png';
  const fallbackFaviconUrl = '/assets/favicon.ico';


  const clearLogo = React.useCallback((): void => {
    setLogoSrc(null);
    persistCachedLogo(null);
  }, []);

  React.useEffect(() => {
    if (logoSrc) {
      return;
    }

    let isActive = true;

    // Load the logo from the backend and set it in the context state
    const loadLogo = async (): Promise<void> => {
      try {
        const logoResponse = await getDBLogoImageRequest();

        if (!isActive || !logoResponse?.data) {
          return;
        }

        const dataUrl = await blobToDataUrl(logoResponse.data);

        if (!isActive) {
          return;
        }
        if (dataUrl) {
          setLogoSrc(dataUrl);
          persistCachedLogo(dataUrl);
        }else{
            console.warn('Logo data URL is empty, using fallback logo.');
            setLogoSrc(fallbackUrl);
            persistCachedLogo(fallbackUrl);
        }

      } catch {
        if (isActive) {
            console.warn('Failed to load logo from backend, using fallback logo.');
            setLogoSrc(fallbackUrl);
            persistCachedLogo(fallbackUrl);
        }
      }
    };

    // Load the favicon from the backend and set it in the context state
    const loadFavicon = async (): Promise<void> => {
      try {
        const faviconResponse = await getImageBlobRequest('favicon.ico');

        if (!isActive || !faviconResponse?.data) {
          return;
        }

        const dataUrl = await blobToDataUrl(faviconResponse.data);

        if (!isActive) {
          return;
        }
        if (dataUrl) {
          setFaviconSrc(dataUrl);
          persistCachedFavicon(dataUrl);
        }else{
            console.warn('Favicon data URL is empty, using fallback favicon.');
            setFaviconSrc(fallbackFaviconUrl);
            persistCachedFavicon(fallbackFaviconUrl);
        }

      } catch {
        if (isActive) {
            console.warn('Failed to load favicon from backend, using fallback favicon.');
            setFaviconSrc(fallbackFaviconUrl);
            persistCachedFavicon(fallbackFaviconUrl);
        }
      }
    };

    // Load the DB name from the backend and set it as the document title
    const loadDBName = async (): Promise<void> => {
        try {
            const dbNameResponse = await getDBNameRequest();
            if (!isActive || !dbNameResponse?.data) {
                return;
            }
            //Get the array item whose attribute NAME is equal to SETTINGS_DB_NAME or SETTINGS_DB_NAME_SUFFIX
            const tmpDBNameSetting = dbNameResponse.data.find((item: any) => item.name === SETTINGS_DB_NAME);
            const tmpDBNameSuffixSetting = dbNameResponse.data.find((item: any) => item.name === SETTINGS_DB_NAME_SUFFIX);
            
            if (!tmpDBNameSetting) {
                document.title = 'FlexBioDB';
                return;
            }

            if (tmpDBNameSetting) {
                const tmpDBName = tmpDBNameSetting.value;
                document.title = tmpDBName;
                setDbName(tmpDBName);
                setDbNameSuffix(tmpDBNameSuffixSetting ? tmpDBNameSuffixSetting.value : null);
                persistCachedDBName(tmpDBName);
                persistCachedDBNameSuffix(tmpDBNameSuffixSetting ? tmpDBNameSuffixSetting.value : null);

            } else {
                console.warn('DB Name is empty, using default title.');
                document.title = 'FlexBioDB';
                setDbName('FlexBioDB');
            }
        } catch {
            if (isActive) {
                console.warn('Failed to load DB Name from backend, using default title.');
                document.title = 'FlexBioDB';
                setDbName('FlexBioDB');
            }
        }
    };

     // Load the DB welcome message from the backend and set it as the document title
    const loadWelcomeMessage = async (): Promise<void> => {
        try {
            const dbWelcomeMessageResponse = await getDBWelcomeMessageRequest();
            if (!isActive || !dbWelcomeMessageResponse?.data) {
                return;
            }
            if (dbWelcomeMessageResponse.data && dbWelcomeMessageResponse.data[0].value.trim() !== '') {

                setDbWelcomeMessage(dbWelcomeMessageResponse.data[0].value);
                persistCachedDbWelcomeMessage(dbWelcomeMessageResponse.data[0].value);
                
            } else {
                console.warn('DB Welcome Message is empty, using default message.');
                setDbWelcomeMessage('Welcome to FlexBioDB');
            }
        } catch {
            if (isActive) {
                console.warn('Failed to load DB Welcome Message from backend, using default message.');
                setDbWelcomeMessage('Welcome to FlexBioDB');
            }
        }
    };

    loadDBName();
    loadLogo();
    loadFavicon();
    loadWelcomeMessage();

    return () => {
      isActive = false;
    };
  }, [clearLogo, logoSrc, setLogoSrc]);

  React.useEffect(() => {
    updateDocumentFavicon(faviconSrc);
  }, [faviconSrc]);

  return <LogoContext.Provider value={{ dbName, dbNameSuffix, logoSrc, clearLogo, setDbName, faviconSrc, setFaviconSrc, dbWelcomeMessage }}>{children}</LogoContext.Provider>;
}

export function useLogoContext(): LogoContextValue {
  const context = React.useContext(LogoContext);

  if (!context) {
    throw new Error('useLogoContext must be used within a LogoProvider.');
  }

  return context;
}