'use client';

import * as React from 'react';

import type { User, Person } from '@/types/user';
import { authClient } from '@/lib/auth/client';
import { logger } from '@/lib/default-logger';
import { getPersonRequest } from '@/api/persons';

export interface UserContextValue {
  user: User | null;
  person: Person | null;
  error: string | null;
  isLoading: boolean;
  checkSession?: () => Promise<void>;
  setPerson?: (person: Person | null) => void; // New method to update the person info
}

export const UserContext = React.createContext<UserContextValue | undefined>(undefined);

export interface UserProviderProps {
  children: React.ReactNode;
}

export function UserProvider({ children }: UserProviderProps): React.JSX.Element {
  const [state, setState] = React.useState<{ user: User | null; person: Person | null; error: string | null; isLoading: boolean }>({
    user: null,
    person: null,
    error: null,
    isLoading: true,
  });

  const checkSession = React.useCallback(async (): Promise<void> => {
    try {
      const { data, error } = await authClient.getUser();

      if (error) {
        logger.error(error);
        setState((prev) => ({ ...prev, user: null, person: null, error: 'Something went wrong', isLoading: false }));
        return;
      }

      // Fetch person data if user has a personId
      let personData: Person | null = null;
      if (data?.personId) {
        try {
          const personResponse = await getPersonRequest(data.personId);
          personData = (Array.isArray(personResponse.data) && personResponse.data.length > 0 ? personResponse.data[0] : null) as Person | null;
        } catch (personErr) {
          logger.error('Failed to fetch person data:', personErr);
        }
      }

      setState((prev) => ({ ...prev, user: data ?? null, person: personData, error: null, isLoading: false }));
    } catch (err) {
      logger.error(err);
      setState((prev) => ({ ...prev, user: null, person: null, error: 'Something went wrong', isLoading: false }));
    }
  }, []);

  const setPerson = React.useCallback((person: Person | null) => {
    setState((prev) => ({ ...prev, person }));
  }, []);

  React.useEffect(() => {
    checkSession().catch((err: unknown) => {
      logger.error(err);
      // noop
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Expected
  }, []);

  return <UserContext.Provider value={{ ...state, checkSession, setPerson }}>{children}</UserContext.Provider>;
}

export const UserConsumer = UserContext.Consumer;
