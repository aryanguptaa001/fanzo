'use client';

import { UserProfile, useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

type FanzoUser = {
  displayName: string | null;
  email: string;
  role: 'FAN' | 'CREATOR' | 'ADMIN';
};

export default function ProfilePage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [fanzoUser, setFanzoUser] = useState<FanzoUser | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const synchronizeUser = async () => {
      try {
        const token = await getToken();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/v1/users/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!response.ok) throw new Error('Unable to load your Fanzo account');
        setFanzoUser((await response.json()) as FanzoUser);
      } catch (error) {
        setSyncError(error instanceof Error ? error.message : 'Unable to load your Fanzo account');
      }
    };

    void synchronizeUser();
  }, [getToken, isLoaded, isSignedIn]);

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center gap-6 p-8">
      {fanzoUser ? (
        <p className="text-muted-foreground text-sm">
          Signed in as {fanzoUser.displayName ?? fanzoUser.email} · {fanzoUser.role}
        </p>
      ) : null}
      {syncError ? <p className="text-destructive text-sm">{syncError}</p> : null}
      <UserProfile routing="hash" />
    </main>
  );
}
