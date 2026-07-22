import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { apiUrl, type CreatorPost, type CreatorProfile } from './creator';

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

async function authenticatedRequest(path: string) {
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) return null;
  return fetch(`${apiUrl}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export async function fetchMyPosts() {
  const response = await authenticatedRequest('/v1/posts/me?page=1&limit=12');
  if (!response?.ok) return { items: [] as CreatorPost[], total: 0, hasMore: false };
  return (await response.json()) as {
    items: CreatorPost[];
    total: number;
    hasMore: boolean;
  };
}

export async function fetchOwnedPost(postId: string): Promise<CreatorPost | null> {
  const response = await authenticatedRequest(`/v1/posts/me/${encodeURIComponent(postId)}`);
  if (!response || response.status === 404) return null;
  if (!response.ok) throw new Error('Unable to load post');
  return (await response.json()) as CreatorPost;
}
