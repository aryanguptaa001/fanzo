import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { apiUrl, type CreatorProfile } from './creator';

export async function fetchMyCreator(): Promise<CreatorProfile | null> {
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) return null;
  const response = await fetch(`${apiUrl}/v1/creators/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Unable to load your creator profile');
  return (await response.json()) as CreatorProfile;
}
