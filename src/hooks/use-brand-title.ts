'use client';

import * as React from 'react';

import { useLogoContext } from '@/contexts/logo-context';

export function useBrandTitle(): string {
  const { dbName, dbNameSuffix } = useLogoContext();

  return React.useMemo(() => {
    const brandName = `${dbName ?? 'FlexBioDB'}${dbNameSuffix ?? ''}`.trim();

    return brandName ;
  }, [dbName, dbNameSuffix]);
}