// hooks/usePreviousFullUrl.ts
'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export const usePreviousFullUrl = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previousUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const fullPath = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    // Solo guarda si es diferente de lo ya guardado
    const alreadyStored = sessionStorage.getItem('prevFullPath');
    if (alreadyStored !== fullPath) {
      previousUrlRef.current = alreadyStored;
      sessionStorage.setItem('prevFullPath', fullPath || '');
    }
  }, [pathname, searchParams]);

  return previousUrlRef.current;
};
