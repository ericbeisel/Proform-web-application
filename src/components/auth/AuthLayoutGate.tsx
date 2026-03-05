'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { checkAccountStatus } from '@/api/auth/account-status/route';
import { clearAuthSession, hasAuthSession } from '@/lib/auth/session';

export default function AuthLayoutGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!hasAuthSession()) {
        if (!cancelled) setReady(true);
        return;
      }

      try {
        const redirectTo = await checkAccountStatus();
        if (cancelled) return;
        if (pathname !== redirectTo) {
          router.replace(redirectTo);
          return;
        }
      } catch {
        clearAuthSession();
      }

      if (!cancelled) setReady(true);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-[280px]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-[#6202AC]" />
      </div>
    );
  }

  return <>{children}</>;
}
