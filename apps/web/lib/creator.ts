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

export type PostMedia = {
  id: string;
  type: 'IMAGE' | 'VIDEO';
  url: string;
  mimeType?: string;
  sizeBytes?: number;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
  sortOrder: number;
};

export type CreatorSummary = Pick<
  CreatorProfile,
  'username' | 'displayName' | 'avatarUrl' | 'verificationStatus'
>;

export type CreatorPost = {
  id: string;
  caption: string | null;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  visibility: 'PUBLIC' | 'FOLLOWERS' | 'SUBSCRIBERS';
  publishedAt: string | null;
  createdAt?: string;
  updatedAt?: string;
  media: PostMedia[];
  creator?: CreatorSummary;
};

export type CreatorFeed = { items: CreatorPost[]; nextCursor: string | null };

export async function fetchCreatorFeed(username: string, page = 1): Promise<CreatorFeed> {
  const response = await fetch(
    `${apiUrl}/v1/creators/${encodeURIComponent(username.toLowerCase())}/posts?page=${page}&limit=6`,
    { cache: 'no-store' },
  );
  if (!response.ok) throw new Error('Unable to load creator posts');
  return (await response.json()) as CreatorFeed;
}

export async function fetchPublicPost(postId: string): Promise<CreatorPost | null> {
  const response = await fetch(`${apiUrl}/v1/posts/${encodeURIComponent(postId)}`, {
    cache: 'no-store',
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Unable to load post');
  return (await response.json()) as CreatorPost;
}

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
