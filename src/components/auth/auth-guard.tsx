'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Alert from '@mui/material/Alert';

import { paths } from '@/paths';
import { logger } from '@/lib/default-logger';
import { useUser } from '@/hooks/use-user';
import { protectedRoutes } from '@/protected-routes';
import { match } from 'path-to-regexp';

export interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps): React.JSX.Element | null {
  const router = useRouter();
  const pathname = usePathname(); // Get the current path
  const { user, error, isLoading } = useUser();
  const [isChecking, setIsChecking] = React.useState<boolean>(true);

  const checkPermissions = async (): Promise<void> => {
    console.log('Requested path:', pathname); // Log the current path
    if (isLoading) {
      return;
    }

    if (error) {
      setIsChecking(false);
      return;
    }

    // Find a matching protected route
    const route = protectedRoutes.find((route) => {
      const matcher = match(route.path, { decode: decodeURIComponent });
      return matcher(pathname); // Check if the current path matches the route
    });

    // If the route is protected, check if the user is logged in
    if(route) {
      if (!user) {
        logger.debug('[AuthGuard]: User is not logged in, redirecting to sign in');
        router.replace(paths.auth.signIn);
        return;
      }
    }

  

    setIsChecking(false);
  };

  React.useEffect(() => {
    checkPermissions().catch(() => {
      // noop
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Expected
  }, [user, error, isLoading]);

  if (isChecking) {
    return null;
  }

  if (error) {
    return <Alert color="error">{error}</Alert>;
  }

  return <React.Fragment>{children}</React.Fragment>;
}
