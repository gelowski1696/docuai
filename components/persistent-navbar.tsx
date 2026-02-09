'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './navbar';
import { getSession } from '@/app/actions/get-session';

type NavUser = {
  email: string;
  role: string;
  subscriptionTier?: string;
} | null;

export function PersistentNavbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<NavUser>(null);

  const hideOnAuthRoutes = pathname?.startsWith('/login') || pathname?.startsWith('/register');

  useEffect(() => {
    if (hideOnAuthRoutes) return;

    let active = true;

    async function loadSession() {
      const session = await getSession();
      if (!active) return;

      if (session) {
        setUser({
          email: session.email,
          role: session.role,
          subscriptionTier: session.subscriptionTier,
        });
      } else {
        setUser(null);
      }
    }

    loadSession();
    return () => {
      active = false;
    };
  }, [pathname, hideOnAuthRoutes]);

  if (hideOnAuthRoutes) return null;

  return <Navbar user={user} />;
}
