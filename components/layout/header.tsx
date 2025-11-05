'use client';

import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">Wavelaunch OS</h1>
        </div>

        <div className="ml-auto flex items-center gap-4">
          {session && (
            <>
              <div className="text-sm">
                <p className="font-medium">{session.user.name}</p>
                <p className="text-muted-foreground text-xs">{session.user.role}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/auth/sign-in' })}
              >
                Sign Out
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
