export type CreatorProfile = {
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  coverImageUrl: string | null;
  websiteUrl: string | null;
  location: string | null;
  category: string | null;
  languages: string[];
  verificationStatus: 'NONE' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  theme: string;
  accentColor: string;
  isAvailableForChat: boolean;
  isAvailableForAudioCall: boolean;
  isAvailableForVideoCall: boolean;
  isAvailableForBrandDeals: boolean;
  followersCount: number;
  postsCount: number;
  subscribersCount: number;
  capabilities: {
    messaging: boolean;
    audioCall: boolean;
    videoCall: boolean;
    live: boolean;
    brandProposals: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
};

export const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export async function fetchPublicCreator(username: string): Promise<CreatorProfile | null> {
  const response = await fetch(
    `${apiUrl}/v1/creators/${encodeURIComponent(username.toLowerCase())}`,
    {
      cache: 'no-store',
    },
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Unable to load creator profile');
  return (await response.json()) as CreatorProfile;
}
